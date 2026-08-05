"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { pricingPlans } from "@/data/landing/core";
import { SectionHeading } from "./section-heading";

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="lv2-section" aria-labelledby="pricing-title">
      <div className="lv2-container">
        <SectionHeading
          index={7}
          total={10}
          label="Pricing"
          eyebrow="Simple and transparent"
          headline={<>Pricing that scales<br />with your data</>}
          body="Flexible plans designed to support early teams today and complex data operations as your product grows."
          id="pricing-title"
        />

        <div className="lv2-pricing-toggle">
          <span aria-hidden>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            className={annual ? "lv2-toggle lv2-toggle--active" : "lv2-toggle"}
            onClick={() => setAnnual((a) => !a)}
          />
          <span aria-hidden>Annual</span>
          {annual ? <span className="lv2-pricing-toggle__note">2 Months Free</span> : null}
        </div>

        <div className="lv2-pricing-grid">
          {pricingPlans.map((plan, i) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <motion.div
                key={plan.id}
                className={`lv2-pricing-card ${plan.popular ? "lv2-pricing-card--popular" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                {plan.popular ? <div className="lv2-pricing-card__badge">Most Popular</div> : null}
                <div className="lv2-pricing-card__title">{plan.title}</div>
                <div className="lv2-pricing-card__subtitle">{plan.subtitle}</div>
                <div className="lv2-pricing-card__price">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      {price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="lv2-pricing-card__period">/month</span>
                </div>
                <div className="lv2-pricing-card__note">{annual ? plan.note : "Billed monthly."}</div>
                <a href={plan.cta.href} className="lv2-btn lv2-btn--primary lv2-btn--block">
                  {plan.cta.label}
                </a>
                <ul className="lv2-pricing-card__features">
                  {plan.features.map((feat) => (
                    <li key={feat}>
                      <Check aria-hidden />
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
