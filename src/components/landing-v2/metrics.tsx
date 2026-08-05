import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

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
          {section.metrics.map((metric) => (
            <article className="lv2-metric" key={metric.id}>
              <div className="lv2-metric__value">{metric.value}</div>
              <div className="lv2-metric__label">{metric.label}</div>
              {metric.detail ? (
                <p className="lv2-metric__detail">{metric.detail}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
