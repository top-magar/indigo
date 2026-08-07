"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type RangeKey = "7d" | "30d" | "90d";

type RangeData = {
  label: string;
  kpis: {
    sessions: { value: string; delta: string; up: boolean; spark: number[] };
    checkouts: { value: string; delta: string; up: boolean; spark: number[] };
    conversion: { value: string; delta: string; up: boolean; spark: number[] };
    revenue: { value: string; delta: string; up: boolean; spark: number[] };
  };
  series: { label: string; value: number }[];
  channels: { label: string; value: number }[];
  insight: string;
};

const RANGES: Record<RangeKey, RangeData> = {
  "7d": {
    label: "Last 7 days",
    kpis: {
      sessions: { value: "8,492", delta: "18.4%", up: true, spark: [12, 18, 14, 22, 19, 26, 24] },
      checkouts: { value: "1,247", delta: "12.2%", up: true, spark: [8, 10, 9, 13, 12, 15, 14] },
      conversion: { value: "4.8%", delta: "0.6%", up: true, spark: [3, 4, 3.5, 4.2, 4, 4.6, 4.8] },
      revenue: { value: "NPR 4.8M", delta: "24%", up: true, spark: [20, 26, 22, 30, 28, 36, 34] },
    },
    series: [
      { label: "Mon", value: 140 }, { label: "Tue", value: 126 }, { label: "Wed", value: 132 },
      { label: "Thu", value: 112 }, { label: "Fri", value: 118 }, { label: "Sat", value: 92 },
      { label: "Sun", value: 102 },
    ],
    channels: [
      { label: "Organic", value: 82 }, { label: "Paid", value: 61 },
      { label: "Email", value: 48 }, { label: "Social", value: 34 },
    ],
    insight: "Cart completions peak 20:30–21:45 on weekdays. Promote COD reminders 30 minutes before this window.",
  },
  "30d": {
    label: "Last 30 days",
    kpis: {
      sessions: { value: "32,180", delta: "31.2%", up: true, spark: [18, 22, 26, 24, 30, 34, 38] },
      checkouts: { value: "4,903", delta: "18.9%", up: true, spark: [10, 13, 15, 14, 18, 20, 22] },
      conversion: { value: "5.2%", delta: "0.9%", up: true, spark: [3.8, 4.1, 4.4, 4.6, 4.9, 5, 5.2] },
      revenue: { value: "NPR 19.2M", delta: "41%", up: true, spark: [30, 36, 34, 42, 48, 52, 58] },
    },
    series: [
      { label: "W1", value: 128 }, { label: "W2", value: 142 }, { label: "W3", value: 136 },
      { label: "W4", value: 158 }, { label: "W5", value: 172 }, { label: "W6", value: 168 },
      { label: "W7", value: 188 },
    ],
    channels: [
      { label: "Organic", value: 74 }, { label: "Paid", value: 66 },
      { label: "Email", value: 52 }, { label: "Social", value: 41 },
    ],
    insight: "Repeat-purchase rate rose after the weekend campaign. Cross-sell bundled products during the 18:00–20:00 window.",
  },
  "90d": {
    label: "Last 90 days",
    kpis: {
      sessions: { value: "96,540", delta: "52.8%", up: true, spark: [22, 30, 28, 38, 42, 50, 58] },
      checkouts: { value: "14,206", delta: "33.4%", up: true, spark: [14, 18, 20, 24, 28, 32, 38] },
      conversion: { value: "5.6%", delta: "1.4%", up: true, spark: [4, 4.4, 4.8, 5, 5.2, 5.4, 5.6] },
      revenue: { value: "NPR 54.1M", delta: "67%", up: true, spark: [34, 42, 48, 54, 62, 70, 80] },
    },
    series: [
      { label: "M1", value: 118 }, { label: "M2", value: 134 }, { label: "M3", value: 152 },
      { label: "M4", value: 146 }, { label: "M5", value: 168 }, { label: "M6", value: 182 },
      { label: "M7", value: 204 },
    ],
    channels: [
      { label: "Organic", value: 69 }, { label: "Paid", value: 71 },
      { label: "Email", value: 55 }, { label: "Social", value: 46 },
    ],
    insight: "Q2 checkout flow converts best on mobile-first landing pages. Test pre-filled COD addresses to lift completion.",
  },
};

const EVENT_POOL = [
  { type: "page_view", value: "-", when: "just now" },
  { type: "add_to_cart", value: "NPR 1,200", when: "just now" },
  { type: "checkout_start", value: "NPR 3,450", when: "just now" },
  { type: "purchase", value: "NPR 3,850", when: "just now" },
  { type: "search", value: "-", when: "just now" },
  { type: "coupon_applied", value: "SAVE10", when: "just now" },
];

function Sparkline({ points, reduced }: { points: number[]; reduced: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = 100 / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(28 - ((p - min) / range) * 24).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" width="100%" height="32" preserveAspectRatio="none" aria-hidden>
      {reduced ? null : (
        <motion.path
          d={d}
          fill="none"
          stroke="var(--lv2-highlight)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
        />
      )}
    </svg>
  );
}

export function DashboardPreview() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [events, setEvents] = useState(() => EVENT_POOL.slice(0, 5));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const data = RANGES[range];

  const reduced = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    [],
  );

  // Live event feed — text-swap only (pinned rows, no mount/unmount → no flicker).
  useEffect(() => {
    if (reduced) return;
    let nextId = EVENT_POOL.length;
    const timer = setInterval(() => {
      setEvents((prev) => {
        const pick = EVENT_POOL[nextId % EVENT_POOL.length];
        nextId += 1;
        return [pick, ...prev.slice(0, 4)];
      });
    }, 3200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Chart geometry
  const W = 700;
  const H = 180;
  const PAD = 8;
  const pts = data.series.map((s, i) => ({
    x: PAD + (i * (W - PAD * 2)) / (data.series.length - 1),
    y: H - PAD - (s.value / 220) * (H - PAD * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setHoverIndex(best);
  };

  const hover = hoverIndex !== null ? pts[hoverIndex] : null;
  const hoverSeries = hoverIndex !== null ? data.series[hoverIndex] : null;

  return (
    <div className="lv2-dashboard lv2-grid-bg" aria-hidden={false}>
      <div className="lv2-dashboard__bar">
        <div className="lv2-dash-dots">
          <i />
          <i />
          <i />
        </div>
        <div className="lv2-dashboard__url">analytics.indigo.com/storefront</div>
        <div className="lv2-live-badge">
          <span className="lv2-dot lv2-dot--pulse" />
          Live
        </div>
      </div>
      <div className="lv2-dashboard__body">
        <aside className="lv2-dashboard__rail">
          <div className="lv2-rail-item lv2-rail-item--active">Overview</div>
          <div className="lv2-rail-item">Funnels</div>
          <div className="lv2-rail-item">Products</div>
          <div className="lv2-rail-item">Customers</div>
          <div className="lv2-rail-item">Campaigns</div>
        </aside>
        <div className="lv2-dashboard__main">
          <div className="lv2-dash-toolbar">
            <span className="lv2-dash-toolbar__label">Date range</span>
            <div className="lv2-dash-seg" role="group" aria-label="Date range">
              {(Object.keys(RANGES) as RangeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={range === key ? "lv2-dash-seg__btn lv2-dash-seg__btn--active" : "lv2-dash-seg__btn"}
                  aria-pressed={range === key}
                  onClick={() => { setRange(key); setHoverIndex(null); }}
                >
                  {key === "7d" ? "7D" : key === "30d" ? "30D" : "90D"}
                </button>
              ))}
            </div>
            <span className="lv2-dash-toolbar__note">{data.label}</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={range}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="lv2-kpi-row">
                {(["sessions", "checkouts", "conversion", "revenue"] as const).map((key) => {
                  const kpi = data.kpis[key];
                  return (
                    <div className="lv2-kpi" key={key}>
                      <div className="lv2-kpi__label">{key === "sessions" ? "Active sessions" : key === "checkouts" ? "Checkouts" : key === "conversion" ? "Conversion" : "Revenue"}</div>
                      <div className="lv2-kpi__value">{kpi.value}</div>
                      <div className={`lv2-kpi__delta ${kpi.up ? "lv2-kpi__delta--up" : "lv2-kpi__delta--down"}`}>
                        ↑ {kpi.delta}
                      </div>
                      <Sparkline points={kpi.spark} reduced={reduced} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="lv2-dash-grid">
            <div className="lv2-dash-panel">
              <div className="lv2-dash-panel__head">
                <strong>Revenue trend</strong>
                <span>{data.label}</span>
              </div>
              <div className="lv2-chart-wrap">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${W} ${H}`}
                  width="100%"
                  height={H}
                  fill="none"
                  aria-label={`Revenue trend, ${data.label}`}
                  onPointerMove={onPointerMove}
                  onPointerLeave={() => setHoverIndex(null)}
                >
                  <defs>
                    <linearGradient id="lv2-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--lv2-accent)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--lv2-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke="var(--lv2-border)" strokeDasharray="3 5" strokeWidth="1" />
                  ))}
                  <motion.path
                    d={area}
                    fill="url(#lv2-area)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  />
                  <motion.path
                    d={line}
                    stroke="var(--lv2-highlight)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  {hover ? (
                    <g>
                      <line x1={hover.x} x2={hover.x} y1={PAD} y2={H - PAD} stroke="var(--lv2-fg-soft)" strokeWidth="1" strokeDasharray="2 3" />
                      <circle cx={hover.x} cy={hover.y} r="5" fill="var(--lv2-highlight)" stroke="var(--lv2-bg)" strokeWidth="2" />
                    </g>
                  ) : null}
                </svg>
                {hover && hoverSeries ? (
                  <div className="lv2-chart-tip" style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}>
                    <strong>{hoverSeries.label}</strong>
                    <span>NPR {hoverSeries.value}K</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="lv2-dash-panel">
              <div className="lv2-dash-panel__head">
                <strong>Traffic channels</strong>
                <span>Primary sources</span>
              </div>
              <div className="lv2-bars">
                {data.channels.map((row, i) => (
                  <div className="lv2-bars__row" key={row.label}>
                    <span>{row.label}</span>
                    <div className="lv2-bars__track">
                      <motion.div
                        className="lv2-bars__fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${row.value}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 + i * 0.08 }}
                      />
                    </div>
                    <strong>{row.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lv2-dash-panel">
            <div className="lv2-dash-panel__head">
              <strong>Recent events</strong>
              <span className="lv2-live-badge"><span className="lv2-dot lv2-dot--pulse" /> Streaming</span>
            </div>
            <table className="lv2-dash-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Value</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={i}>
                    <td><code>{ev.type}</code></td>
                    <td>{ev.value}</td>
                    <td>{ev.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lv2-ai-card">
            <strong>
              <span className="lv2-dot lv2-dot--pulse" aria-hidden /> AI insight
            </strong>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={range}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {data.insight}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
