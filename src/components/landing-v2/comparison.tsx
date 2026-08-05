import { Check, X } from "lucide-react";
import { comparisonRows } from "@/data/landing/core";
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
  return (
    <section id="comparison" className="lv2-section" aria-labelledby="comparison-title">
      <div className="lv2-container">
        <SectionHeading
          index={6}
          total={10}
          label="Comparison"
          eyebrow="Why choose us"
          headline={<>The smarter alternative<br />to templated platforms</>}
          body="Indigo replaces fragmented page builders, disconnected checkout tools, and manual reporting with one structured commerce workspace."
          id="comparison-title"
        />

        <div className="lv2-compare">
          <div className="lv2-compare__head">
            <div>
              <span className="lv2-compare__label">Feature</span>
            </div>
            <div className="lv2-compare__product">
              <span className="lv2-compare__label">Templated platforms</span>
              <strong>Fragmented setup</strong>
            </div>
            <div className="lv2-compare__product lv2-compare__product--us">
              <span className="lv2-compare__label">Indigo</span>
              <strong>Connected by default</strong>
            </div>
          </div>
          <div>
            {comparisonRows.map((row) => (
              <div className="lv2-compare__row" key={row.feature}>
                <div className="lv2-compare__cell lv2-compare__cell--dim">{row.feature}</div>
                <div className="lv2-compare__cell lv2-compare__cell--dim">
                  <CellValue value={row.them} good={false} />
                </div>
                <div className="lv2-compare__cell lv2-compare__cell--good">
                  <CellValue value={row.us} good />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
