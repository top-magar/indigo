"use client";

import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";
import { useCountUp } from "./motion/reveal";

export function MetricsSection() {
  const section = sectionData.metrics;

  return (
    <section id="metrics" className="lv2-section" aria-labelledby="metrics-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={section.headline}
          body={section.body}
          id="metrics-title"
        />
        <div className="lv2-metrics">
          {section.metrics.map((metric, i) => (
            <MetricCard key={metric.id} metric={metric} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ metric, delay }: { metric: { id: string; label: string; value: string; detail?: string }; delay: number }) {
  const { ref, display } = useCountUp(metric.value, 1300);
  return (
    <article className="lv2-metric" ref={ref}>
      <div className="lv2-metric__value" style={{ transitionDelay: `${delay}ms` }}>
        {display}
      </div>
      <div className="lv2-metric__label">{metric.label}</div>
      {metric.detail ? <p className="lv2-metric__detail">{metric.detail}</p> : null}
    </article>
  );
}
