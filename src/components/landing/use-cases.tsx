"use client";

import { Check } from "lucide-react";
import { healthMetrics } from "@/data/landing/core";
import { SectionHeading } from "./section-heading";
import { motion } from "framer-motion";
import { EASE } from "./motion/reveal";

const useCases = [
  {
    title: "Real-time storefront analytics",
    description: "See live sessions, checkout events, and campaign performance before the day ends.",
    bullets: ["Live event stream", "Order attribution", "Storefront + checkout view"],
    visual: (
      <div className="lv2-card lv2-dashboard" style={{ margin: 0 }}>
        <div className="lv2-dash-panel__head" style={{ padding: "14px 16px 0" }}>
          <strong>Live dashboard</strong>
          <span className="lv2-live-badge"><span className="lv2-dot lv2-dot--pulse" /> Live</span>
        </div>
        <div style={{ padding: "10px 16px 16px" }}>
          <div className="lv2-kpi-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Active users</div><div className="lv2-kpi__value">12,489</div></div>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Conversion</div><div className="lv2-kpi__value">4.8%</div></div>
          </div>
          <div className="lv2-dash-panel" style={{ marginTop: 12 }}>
            <div className="lv2-dash-panel__head">
              <strong>Health table</strong>
              <span>Sample indicators</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {healthMetrics.map((row) => (
                <div className="lv2-health-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                  <span className={`lv2-badge lv2-badge--${row.state === "Healthy" ? "success" : "warning"}`}>{row.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Automated reporting workflows",
    description: "Schedule merchant-ready summaries instead of rebuilding the same spreadsheet each week.",
    bullets: ["Scheduled report delivery", "Slack and email alerts", "One-click exports"],
    visual: (
      <div className="lv2-card lv2-dashboard" style={{ margin: 0 }}>
        <div className="lv2-dash-panel" style={{ margin: 16 }}>
          <div className="lv2-dash-panel__head">
            <strong>Weekly digest</strong>
            <span className="lv2-badge lv2-badge--success">Scheduled</span>
          </div>
          <div className="lv2-health-row"><span>Recipients</span><strong>Merchant + ops team</strong></div>
          <div className="lv2-health-row"><span>Next delivery</span><strong>Monday 08:00 NPT</strong></div>
          <div className="lv2-health-row"><span>Format</span><strong>PDF + Slack message</strong></div>
        </div>
      </div>
    ),
  },
  {
    title: "Marketing attribution",
    description: "Connect campaigns to orders without losing context in ad dashboards.",
    bullets: ["Campaign-to-order mapping", "Channel performance", "Revenue by source"],
    visual: (
      <div className="lv2-card lv2-dashboard" style={{ margin: 0 }}>
        <div className="lv2-dash-panel" style={{ margin: 16 }}>
          <div className="lv2-dash-panel__head">
            <strong>Channel breakdown</strong>
            <span className="lv2-badge lv2-badge--accent">+18.2% WoW</span>
          </div>
          <div className="lv2-bars">
            {[
              { label: "Organic", value: 82 },
              { label: "Paid search", value: 61 },
              { label: "Social", value: 48 },
              { label: "Email", value: 72 },
              { label: "Direct", value: 55 },
              { label: "Referral", value: 34 },
            ].map((row, i) => (
              <div className="lv2-bars__row" key={row.label}>
                <span>{row.label}</span>
                <div className="lv2-bars__track">
                  <motion.div
                    className="lv2-bars__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                  />
                </div>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export function UseCasesSection() {
  return (
    <section id="solutions" className="lv2-section" aria-labelledby="solutions-title">
      <div className="lv2-container">
        <SectionHeading
          index={4}
          total={10}
          label="Use Cases"
          eyebrow="Built for data-driven teams"
          headline={<>Designed for merchants,<br />founders, and operators</>}
          body="Each workflow pulls from the same catalog, orders, and analytics foundation instead of splitting data across disconnected tools."
          id="solutions-title"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {useCases.map((useCase, index) => (
            <div className={index % 2 === 1 ? "lv2-usecase lv2-usecase--flip" : "lv2-usecase"} key={useCase.title}>
              <div className="lv2-usecase__copy">
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
                <ul className="lv2-usecase__bullets">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lv2-usecase__visual">
                {useCase.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
