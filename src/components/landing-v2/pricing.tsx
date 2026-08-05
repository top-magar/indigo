"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

export function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const section = sectionData.pricing;

  return (
    <section id="pricing" className="lv2-section" aria-labelledby="pricing-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Start free. Scale<br />when the store does.</>}
          body={section.body}
          id="pricing-title"
        />

        <div className="lv2-pricing-toggle" role="group" aria-label="Billing period">
          <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>
            Monthly
          </button>
          <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>
            Annual
          </button>
        </div>

        <div style={{ margin: "0 0 12px", color: "var(--lv2-faint)", fontSize: 13.5 }}>
          {annual ? section.annualNote : section.monthlyNote}
        </div>

        <div className="lv2-pricing">
          {section.plans.map((plan) => (
            <article
              key={plan.id}
              className={plan.highlighted ? "lv2-plan lv2-plan--featured" : "lv2-plan"}
            >
              <div className="lv2-plan__name">
                {plan.name}
                {plan.highlighted ? <span className="lv2-badge lv2-badge--accent">Most Popular</span> : null}
              </div>
              <p style={{ margin: "8px 0 0", color: "var(--lv2-muted)", fontSize: 14 }}>{plan.tagline}</p>
              <div className="lv2-plan__price">
                {plan.monthlyPriceNpr === null ? "Custom" : `NPR ${annual ? Math.round(plan.monthlyPriceNpr * 10) : plan.monthlyPriceNpr}`}
                {plan.monthlyPriceNpr === null ? null : <small>{annual ? "/yr" : plan.periodLabel}</small>}
              </div>
              {plan.monthlyPriceNpr !== null ? (
                <p className="lv2-plan__note">
                  {annual ? "Billed annually — two months free." : plan.periodLabel}
                </p>
              ) : null}

              <ul className="lv2-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <a href={plan.cta.href} className="lv2-btn lv2-btn--primary">
                {plan.cta.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
