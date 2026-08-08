"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { sectionData, type ComparisonRow } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

const cmp = sectionData.comparison;

function CellValue({ value, note }: { value: boolean | string; note?: string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="lv2-cmp-mark lv2-cmp-mark--yes" aria-label="Included">
        <Check aria-hidden />
      </span>
    ) : (
      <span className="lv2-cmp-mark lv2-cmp-mark--no" aria-label="Not included">
        <X aria-hidden />
      </span>
    );
  }
  return (
    <span className="lv2-cmp-value">
      <Check className="lv2-cmp-value__check" aria-hidden />
      {value}
      {note ? <span className="lv2-cmp-note">{note}</span> : null}
    </span>
  );
}

/** True when both products behave the same for this feature (parity row). */
function isParity(row: ComparisonRow) {
  return row.indigo === row.alternative;
}

export function ComparisonSection() {
  const [diffOnly, setDiffOnly] = useState(false);

  return (
    <section id="comparison" className="lv2-section" aria-labelledby="comparison-title">
      <div className="lv2-container">
        <SectionHeading
          index={cmp.index}
          total={cmp.total}
          label={cmp.label}
          eyebrow={cmp.eyebrow}
          headline={cmp.headline}
          body={cmp.body}
          id="comparison-title"
        />

        <div className="lv2-cmp">
          {/* Toolbar: legend + highlight-differences switch */}
          <div className="lv2-cmp__toolbar">
            <div className="lv2-cmp__legend" aria-hidden>
              <span><span className="lv2-cmp-legend__dot lv2-cmp-legend__dot--yes" />Included</span>
              <span><span className="lv2-cmp-legend__dot lv2-cmp-legend__dot--no" />Missing</span>
              <span><span className="lv2-cmp-legend__dot lv2-cmp-legend__dot--same" />Same on both</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={diffOnly}
              aria-label="Highlight differences between Indigo and templated platforms"
              className={`lv2-cmp-switch${diffOnly ? " lv2-cmp-switch--on" : ""}`}
              onClick={() => setDiffOnly((v) => !v)}
            >
              <span className="lv2-cmp-switch__track"><span className="lv2-cmp-switch__knob" /></span>
              Highlight differences
            </button>
          </div>

          {/* Header row */}
          <div className="lv2-cmp__head">
            <div className="lv2-cmp__head-feature"><span className="lv2-cmp__label">Feature</span></div>
            <div className="lv2-cmp__head-alt">
              <span className="lv2-cmp__label">{cmp.alternativeLabel}</span>
              <strong>Fragmented setup</strong>
            </div>
            <div className="lv2-cmp__head-us">
              <span className="lv2-cmp__label">{cmp.indigoLabel}</span>
              <strong>Connected by default</strong>
            </div>
          </div>

          {/* Grouped rows */}
          {cmp.groups.map((group) => (
            <div key={group.title}>
              <div className="lv2-cmp__group" role="row">
                <span className="lv2-cmp__group-title">{group.title}</span>
              </div>
              {group.rows.map((row) => {
                const parity = isParity(row);
                const dimmed = diffOnly && parity;
                return (
                  <div
                    key={row.feature}
                    role="row"
                    className={`lv2-cmp__row${parity ? " lv2-cmp__row--same" : ""}${dimmed ? " lv2-cmp__row--dim" : ""}`}
                  >
                    <div className="lv2-cmp__cell lv2-cmp__cell--feature" role="cell">{row.feature}</div>
                    <div className="lv2-cmp__cell lv2-cmp__cell--alt" role="cell">
                      <CellValue value={row.alternative} note={row.note} />
                    </div>
                    <div className="lv2-cmp__cell lv2-cmp__cell--us" role="cell">
                      <CellValue value={row.indigo} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Footnote */}
          <p className="lv2-cmp__foot">
            Feature parity across plans — see the <a href="#pricing">pricing page</a> for exact limits on Growth+ and beyond.
          </p>
        </div>
      </div>
    </section>
  );
}
