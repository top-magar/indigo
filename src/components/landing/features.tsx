"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { EASE } from "./motion/reveal";

/* ─── Design Visual ──────────────────────────────────────────── */
function DesignVisual() {
  return (
    <div className="lv2-mini-window overflow-hidden flex bg-[var(--lv2-surface-1)] h-[260px]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-[var(--lv2-border)] p-3 flex flex-col gap-2 relative z-10">
        <div className="w-full h-2 bg-[var(--lv2-border-strong)] rounded mb-2" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-6 rounded border ${i === 2 ? "border-[var(--lv2-accent)] bg-[var(--lv2-accent-soft)]" : "border-[var(--lv2-border)] bg-[var(--lv2-line-soft)]"}`} />
        ))}
      </div>
      {/* Canvas */}
      <div className="flex-1 bg-[var(--lv2-bg)] p-4 relative flex justify-center items-center">
        <div className="w-full h-full bg-[var(--lv2-panel)] rounded-md shadow-2xl overflow-hidden flex flex-col relative border border-[var(--lv2-border)]">
          <div className="w-full h-1/3 bg-[var(--lv2-surface-2)] flex items-center justify-center">
            <div className="w-1/2 h-4 bg-[var(--lv2-border-strong)] rounded" />
          </div>
          <div className="flex-1 flex gap-2 p-2">
            <div className="flex-1 bg-[var(--lv2-surface-2)] rounded-sm" />
            <div className="flex-1 bg-[var(--lv2-surface-2)] rounded-sm" />
          </div>
          
          {/* Selected Outline */}
          <div className="absolute inset-0 top-1/3 pointer-events-none border-2 border-[var(--lv2-accent)]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Run Visual ─────────────────────────────────────────────── */
function RunVisual() {
  return (
    <div className="lv2-mini-window overflow-hidden bg-[var(--lv2-surface-1)] h-[260px] p-4 flex flex-col gap-3 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="w-24 h-3 bg-[var(--lv2-border-strong)] rounded" />
        <div className="w-16 h-6 bg-[var(--lv2-accent)] rounded-md" />
      </div>
      {/* Orders Table Mockup */}
      <div className="flex-1 border border-[var(--lv2-border)] rounded-md bg-[var(--lv2-surface-2)] overflow-hidden flex flex-col">
        <div className="flex gap-4 p-3 border-b border-[var(--lv2-border)] bg-[var(--lv2-surface-3)]">
          <div className="w-4 h-4 bg-[var(--lv2-border-strong)] rounded-sm" />
          <div className="w-12 h-2 bg-[var(--lv2-border-strong)] rounded mt-1" />
          <div className="w-16 h-2 bg-[var(--lv2-border-strong)] rounded mt-1" />
          <div className="w-20 h-2 bg-[var(--lv2-border-strong)] rounded mt-1" />
        </div>
        {[
          { id: "1284", status: "Unfulfilled", statusColor: "text-amber-600 dark:text-amber-400 bg-amber-400/10 border-amber-400/20" },
          { id: "1283", status: "Fulfilled", statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
          { id: "1282", status: "Fulfilled", statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 p-3 border-b border-[var(--lv2-border)] items-center">
            <div className="w-4 h-4 bg-[var(--lv2-line-soft)] rounded-sm" />
            <div className="w-12 text-[10px] font-mono text-[var(--lv2-muted)]">#{item.id}</div>
            <div className={`px-2 py-0.5 text-[9px] rounded-sm border ${item.statusColor}`}>
              {item.status}
            </div>
            <div className="w-12 h-2 bg-[var(--lv2-border-strong)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Grow Visual ────────────────────────────────────────────── */
function GrowVisual() {
  return (
    <div className="lv2-mini-window overflow-hidden bg-[var(--lv2-surface-1)] h-[260px] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--lv2-accent-soft)_0%,transparent_70%)] opacity-30" />
      <div className="w-full max-w-sm flex flex-col gap-3 relative z-10">
        {/* Metric Card */}
        <div className="bg-[var(--lv2-surface-2)] border border-[var(--lv2-border)] p-4 rounded-lg flex justify-between items-center shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-[var(--lv2-faint)] text-[10px] uppercase tracking-wider">Returning Customers</span>
            <span className="text-[var(--lv2-fg)] text-lg font-medium">42.8%</span>
          </div>
          <div className="w-16 h-10 flex items-end justify-between gap-1">
            {[2, 3, 2, 4, 3, 5, 6].map((h, i) => (
              <motion.div 
                key={i} 
                className="w-1.5 bg-[var(--lv2-highlight)] rounded-t-sm"
                initial={{ height: 0 }}
                whileInView={{ height: h * 6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
        {/* Promotion */}
        <div className="bg-gradient-to-r from-[var(--lv2-accent)] to-[var(--lv2-highlight)] p-4 rounded-lg flex items-center justify-between text-white shadow-lg">
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white">Dashain Mega Sale</span>
            <span className="text-white/80 text-xs">Active · +14% conv</span>
          </div>
          <div className="bg-white text-[var(--lv2-accent)] text-xs font-bold px-2 py-1 rounded">
            20% OFF
          </div>
        </div>
      </div>
    </div>
  );
}

const cards = [
  {
    id: "design",
    title: "Design",
    description: "Visual site builder with flexible templates. Drag, drop, and publish a premium storefront in minutes.",
    size: "lg" as const,
    visual: <DesignVisual />,
  },
  {
    id: "run",
    title: "Run",
    description: "Centralized order management, real-time inventory, and seamless local shipping integrations.",
    size: "sm" as const,
    visual: <RunVisual />,
  },
  {
    id: "grow",
    title: "Grow",
    description: "Built-in customer retention, automated marketing hooks, and deep commerce analytics.",
    size: "sm" as const,
    visual: <GrowVisual />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="lv2-section" aria-labelledby="features-title">
      <div className="lv2-container">
        <SectionHeading
          index={2}
          total={10}
          label="Platform"
          eyebrow="Core pillars"
          headline={<>Everything you need to<br />build, run, and grow.</>}
          body="Indigo is a complete commerce operating system designed specifically for the Nepali market. We've removed the friction from setting up and scaling your online business."
          id="features-title"
        />
        
        {/* Custom Bento Grid Layout for 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-12 md:mt-16">
          <motion.article
            className="lv2-card lv2-card--hover col-span-1 md:col-span-2 overflow-hidden flex flex-col md:flex-row gap-6 p-0"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold tracking-tight text-[var(--lv2-fg)] mb-2">{cards[0].title}</div>
              <p className="text-[var(--lv2-muted)] text-sm md:text-base leading-relaxed">{cards[0].description}</p>
            </div>
            <div className="flex-1 md:max-w-[60%] border-t md:border-t-0 md:border-l border-[var(--lv2-border)]">
              {cards[0].visual}
            </div>
          </motion.article>

          <motion.article
            className="lv2-card lv2-card--hover overflow-hidden flex flex-col p-0"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            <div className="p-6 md:p-8">
              <div className="text-xl font-bold tracking-tight text-[var(--lv2-fg)] mb-2">{cards[1].title}</div>
              <p className="text-[var(--lv2-muted)] text-sm leading-relaxed">{cards[1].description}</p>
            </div>
            <div className="mt-auto border-t border-[var(--lv2-border)]">
              {cards[1].visual}
            </div>
          </motion.article>

          <motion.article
            className="lv2-card lv2-card--hover overflow-hidden flex flex-col p-0"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            <div className="p-6 md:p-8">
              <div className="text-xl font-bold tracking-tight text-[var(--lv2-fg)] mb-2">{cards[2].title}</div>
              <p className="text-[var(--lv2-muted)] text-sm leading-relaxed">{cards[2].description}</p>
            </div>
            <div className="mt-auto border-t border-[var(--lv2-border)]">
              {cards[2].visual}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
