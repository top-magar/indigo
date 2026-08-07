"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { EASE } from "./motion/reveal";

/* ─── Event stream (cycling) ─────────────────────────────────────────── */

const STREAM_EVENTS = ["page_view", "add_to_cart", "checkout_start", "purchase", "button_click", "search"];

function EventStreamVisual() {
  const [rows, setRows] = useState(() => STREAM_EVENTS.slice(0, 6).map((e, i) => ({ type: e, id: i })));
  const reduced = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    [],
  );
  useEffect(() => {
    if (reduced) return;
    let next = rows.length;
    const t = setInterval(() => {
      setRows((prev) => [{ type: STREAM_EVENTS[next % STREAM_EVENTS.length], id: next }, ...prev].slice(0, 6));
      next += 1;
    }, 2600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className="lv2-mini-window">
      <div className="lv2-mini-window__bar"><i /><i /><i /></div>
      <div>
        <AnimatePresence initial={false}>
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              className="lv2-event-row"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>{row.type}</span>
              <em>{i === 0 ? "now" : `${i}s`}</em>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Conversion funnel (selectable stages) ──────────────────────────── */

const FUNNEL = [
  { label: "Visitors", count: "10,000", pct: 100 },
  { label: "Product views", count: "6,200", pct: 62 },
  { label: "Add to cart", count: "2,400", pct: 24 },
  { label: "Purchases", count: "890", pct: 9 },
];

function FunnelVisual() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="lv2-funnel">
      {FUNNEL.map((stage, i) => {
        const drop = i === 0 ? null : 100 - Math.round((FUNNEL[i].pct / FUNNEL[i - 1].pct) * 100);
        return (
          <button
            type="button"
            key={stage.label}
            className={`lv2-funnel__stage ${active === i ? "lv2-funnel__stage--active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
            aria-pressed={active === i}
            aria-label={`${stage.label}: ${stage.count} (${stage.pct}% of visitors)`}
          >
            <span>{stage.label}</span>
            <strong>{stage.count}</strong>
            <div className="lv2-funnel__track">
              <motion.div
                className="lv2-funnel__bar"
                initial={{ width: 0 }}
                whileInView={{ width: `${stage.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              />
            </div>
            <em>{stage.pct}%</em>
            <AnimatePresence>
              {active === i && drop !== null ? (
                <motion.span
                  className="lv2-funnel__drop"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  −{drop}% drop-off
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Heatmap (pointer response) ─────────────────────────────────────── */

// Deterministic 10×5 heat pattern (0-3), pseudo-random but stable across renders.
const HEAT_GRID = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const rows: number[][] = [];
  for (let r = 0; r < 5; r += 1) {
    const row: number[] = [];
    for (let c = 0; c < 10; c += 1) {
      // center-weighted: hotter toward the middle columns
      const centerBias = 1 - Math.abs(c - 4.5) / 5.5;
      const v = rnd() + centerBias * 0.9;
      row.push(v > 1.15 ? 3 : v > 0.75 ? 2 : v > 0.4 ? 1 : 0);
    }
    rows.push(row);
  }
  return rows;
})();

function HeatmapVisual() {
  const [hot, setHot] = useState<{ r: number; c: number } | null>(null);
  return (
    <div className="lv2-heat" onMouseLeave={() => setHot(null)}>
      {HEAT_GRID.map((row, r) =>
        row.map((heat, c) => (
          <motion.i
            key={`${r}-${c}`}
            data-heat={heat}
            className={`lv2-heat__cell ${hot?.r === r && hot?.c === c ? "lv2-heat__cell--hot" : ""}`}
            onMouseEnter={() => setHot({ r, c })}
            onFocus={() => setHot({ r, c })}
            tabIndex={0}
            aria-label={`Tap heat ${heat + 1} of 4`}
            animate={{ opacity: hot && (hot.r !== r || hot.c !== c) ? 0.55 : 1 }}
            transition={{ duration: 0.15 }}
          />
        )),
      )}
    </div>
  );
}

/* ─── Cohort matrix (cell tooltip) ───────────────────────────────────── */

const COHORT = [
  { week: "Jan", cells: ["92%", "74%", "68%", "51%", "44%", "39%"] },
  { week: "Feb", cells: ["88%", "70%", "54%", "42%", "37%", "33%"] },
  { week: "Mar", cells: ["90%", "73%", "62%", "47%", "40%", "35%"] },
  { week: "Apr", cells: ["86%", "69%", "58%", "45%", "38%", "32%"] },
];

function CohortVisual() {
  const [tip, setTip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);
  return (
    <div className="lv2-cohort-wrap" onMouseLeave={() => setTip(null)}>
      <table className="lv2-cohort">
        <thead>
          <tr>
            <th>Week</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th><th>W5</th><th>W6</th>
          </tr>
        </thead>
        <tbody>
          {COHORT.map((row) => (
            <tr key={row.week}>
              <td>{row.week}</td>
              {row.cells.map((value, i) => {
                const heat = i < 1 ? 1 : i < 2 ? 2 : i < 3 ? 2 : 3;
                return (
                  <td
                    key={i}
                    data-hot={heat}
                    onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, label: `${row.week} · Week ${i + 1}`, value })}
                    onFocus={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTip({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, label: `${row.week} · Week ${i + 1}`, value });
                    }}
                    tabIndex={0}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <AnimatePresence>
        {tip ? (
          <motion.div
            className="lv2-cohort-tip"
            style={{ left: Math.min(tip.x + 12, window.innerWidth - 180), top: tip.y + 12 }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <strong>{tip.label}</strong>
            <span>{tip.value} retained</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ─── Cards ──────────────────────────────────────────────────────────── */

const cards = [
  {
    id: "event-stream",
    title: "Event stream",
    description: "Watch every page view, add-to-cart, checkout, and campaign event as it happens.",
    size: "lg" as const,
    visual: <EventStreamVisual />,
  },
  {
    id: "conversion-funnels",
    title: "Conversion funnels",
    description: "See where shoppers drop off — hover or tap a stage to inspect the loss.",
    size: "sm" as const,
    visual: <FunnelVisual />,
  },
  {
    id: "heatmaps",
    title: "Heatmaps",
    description: "See where people tap, scroll, and hesitate before buying.",
    size: "sm" as const,
    visual: <HeatmapVisual />,
  },
  {
    id: "dashboards",
    title: "Custom dashboards",
    description: "Compose views for founders, marketers, and operations with the same live dataset.",
    size: "sm" as const,
    visual: (
      <div className="lv2-mini-window">
        <div className="lv2-mini-window__bar"><i /><i /><i /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Sessions</div><div className="lv2-kpi__value">9,182</div></div>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Orders</div><div className="lv2-kpi__value">418</div></div>
          </div>
          <div style={{ height: 48, borderRadius: 8, background: "var(--lv2-accent-soft)", border: "1px solid var(--lv2-accent-border)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "integrations",
    title: "Tool integrations",
    description: "Connect gateways, email, messaging, and warehouses without glue code.",
    size: "sm" as const,
    visual: (
      <div className="lv2-integrations-grid">
        {["eSewa", "Khalti", "Slack", "Stripe"].map((name) => (
          <div className="lv2-bento-integration" key={name}>
            <div className="lv2-bento-integration__logo">{name.charAt(0)}</div>
            <div>
              <strong>{name}</strong>
              <small>Connected</small>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cohort",
    title: "Cohort analysis",
    description: "Track repeat purchase behaviour and retention cohorts over time.",
    size: "full" as const,
    visual: <CohortVisual />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="lv2-section" aria-labelledby="features-title">
      <div className="lv2-container">
        <SectionHeading
          index={2}
          total={10}
          label="Features"
          eyebrow="Main product"
          headline={<>Built to reduce<br />data blindspots</>}
          body="From event stream to cohort view, Indigo replaces fragmented tools with one structured workspace. Values below are sample UI content until live product benchmarks are finalized."
          id="features-title"
        />
        <div className="lv2-bento">
          {cards.map((card, i) => (
            <motion.article
              key={card.id}
              className={`lv2-card lv2-bento__card ${
                card.size === "lg"
                  ? "lv2-bento__card--lg"
                  : card.size === "full"
                    ? "lv2-bento__card--full"
                    : "lv2-bento__card--sm"
              } lv2-card--hover`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <div className="lv2-card-title">{card.title}</div>
              <p>{card.description}</p>
              <div className="lv2-bento__visual">{card.visual}</div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
