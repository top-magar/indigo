import { Check, X } from "lucide-react";
import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

function CellValue({ value, good }: { value: boolean | string; good: boolean }) {
  if (typeof value === "boolean") {
    return good ? (
      <Check className="lv2-icon-check" aria-label="Included" />
    ) : (
      <X className="lv2-icon-x" aria-label="Not included" />
    );
  }
  return (
    <>
      <Check className="lv2-icon-check" aria-label="Partial" />
      {value}
    </>
  );
}

export function ComparisonSection() {
  const section = sectionData.comparison;

  return (
    <section id="comparison" className="lv2-section" aria-labelledby="comparison-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Indigo vs.<br />templated platforms</>}
          body={section.body}
          id="comparison-title"
        />

        <div className="lv2-compare">
          <div className="lv2-compare__head">
            <div>
              <span className="lv2-compare__label">Feature</span>
            </div>
            <div className="lv2-compare__product">
              <span className="lv2-compare__label">{section.indigoLabel}</span>
              <strong>AI-powered and built-in</strong>
            </div>
            <div>
              <span className="lv2-compare__label">{section.alternativeLabel}</span>
              <strong>Fragmented setup</strong>
            </div>
          </div>
          <div>
            {section.rows.map((row) => (
              <div className="lv2-compare__row" key={row.feature}>
                <div className="lv2-compare__cell lv2-compare__cell--dim">{row.feature}</div>
                <div className="lv2-compare__cell lv2-compare__cell--good">
                  <CellValue value={row.indigo} good />
                </div>
                <div className="lv2-compare__cell lv2-compare__cell--dim">
                  <CellValue value={row.alternative} good={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
