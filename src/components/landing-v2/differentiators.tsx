"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { EASE } from "./motion/reveal";

const STREAM_EVENTS = ["page_view", "add_to_cart", "checkout_start", "purchase", "button_click", "search"];

function StreamingDemo() {
  const [events, setEvents] = useState(() => STREAM_EVENTS.slice(0, 4));
  const reduced = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    [],
  );
  useEffect(() => {
    if (reduced) return;
    let next = STREAM_EVENTS.length;
    const t = setInterval(() => {
      setEvents((prev) => {
        const nextEvents = [STREAM_EVENTS[next % STREAM_EVENTS.length], ...prev.slice(0, 3)];
        next += 1;
        return nextEvents;
      });
    }, 2600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className="lv2-mini-window">
      <div className="lv2-mini-window__bar"><i /><i /><i /></div>
      <div>
        {events.map((type, i) => (
          <div key={i} className="lv2-event-row">
            <span>{type}</span>
            <em>{i === 0 ? "now" : `${i}s`}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIDemo() {
  const [active, setActive] = useState(0);
  return (
    <div className="lv2-ai-demo">
      <div className="lv2-ai-demo__chart">
        <svg viewBox="0 0 100 32" width="100%" height="32" preserveAspectRatio="none">
          <motion.path
            d="M0,28 L10,22 L20,18 L30,14 L40,10 L50,8 L60,12 L70,16 L80,20 L90,24 L100,28"
            fill="none"
            stroke="var(--lv2-highlight)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
          />
        </svg>
      </div>
      <div className="lv2-ai-demo__stats">
        <div className="lv2-ai-demo__stat">
          <strong>Accuracy</strong>
          <span>94.2%</span>
        </div>
        <div className="lv2-ai-demo__stat">
          <strong>Models</strong>
          <span>12</span>
        </div>
      </div>
      <div className="lv2-ai-demo__tabs">
        {["Churn", "Conversion", "Growth"].map((tab, i) => (
          <button
            type="button"
            key={tab}
            className={active === i ? "lv2-ai-demo__tab lv2-ai-demo__tab--active" : "lv2-ai-demo__tab"}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function BuilderDemo() {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="lv2-builder">
      <div className="lv2-builder__zone" onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}>
        <AnimatePresence>
          {dragging ? (
            <motion.div
              className="lv2-builder__drop"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              Drop widget here
            </motion.div>
          ) : (
            <div className="lv2-builder__placeholder">
              <div className="lv2-kpi"><div className="lv2-kpi__label">Sessions</div><div className="lv2-kpi__value">9,182</div></div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EnterpriseDemo() {
  return (
    <div className="lv2-enterprise">
      <div className="lv2-enterprise__shield">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
        </svg>
      </div>
      <div className="lv2-enterprise__label">SOC 2 Type II</div>
      <div className="lv2-enterprise__note">Bank-grade encryption</div>
    </div>
  );
}

function PerformanceDemo() {
  return (
    <div className="lv2-perf">
      <div className="lv2-perf__value">3×</div>
      <div className="lv2-perf__label">Faster queries</div>
      <div className="lv2-perf__note">Optimized at scale</div>
    </div>
  );
}

const demos = [
  { id: "stream", title: "Real-time", subtitle: "Stream insights as they happen", visual: <StreamingDemo /> },
  { id: "ai", title: "AI-Powered", subtitle: "Predictive intelligence", visual: <AIDemo /> },
  { id: "builder", title: "Custom", subtitle: "Drag & drop builder", visual: <BuilderDemo /> },
  { id: "enterprise", title: "Enterprise", subtitle: "SOC 2 Type II", visual: <EnterpriseDemo /> },
  { id: "perf", title: "Performance", subtitle: "3x faster queries", visual: <PerformanceDemo /> },
];

export function DifferentiatorsSection() {
  return (
    <section id="differentiators" className="lv2-section" aria-labelledby="differentiators-title">
      <div className="lv2-container">
        <SectionHeading
          index={5}
          total={10}
          label="Differentiators"
          eyebrow="Built different"
          headline={<>Everything you need.<br />Nothing you don&apos;t.</>}
          body="A focused set of powerful capabilities, designed to work together seamlessly. No bloat, no complexity — just clarity."
          id="differentiators-title"
        />

        <div className="lv2-diff-grid">
          {demos.map((demo, i) => (
            <motion.article
              key={demo.id}
              className="lv2-diff-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            >
              <div className="lv2-diff-card__visual">{demo.visual}</div>
              <div className="lv2-diff-card__title">{demo.title}</div>
              <div className="lv2-diff-card__subtitle">{demo.subtitle}</div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
