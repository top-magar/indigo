"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(sectionData.faq.items[0]?.id ?? null);
  const section = sectionData.faq;

  return (
    <section id="faq" className="lv2-section" aria-labelledby="faq-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Answers before you ask</>}
          body={section.body}
          id="faq-title"
        />

        <div className="lv2-faq">
          {section.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="lv2-faq__item"
                data-open={isOpen ? "true" : "false"}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${item.id}`}
                  className="lv2-faq__q"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  {item.question}
                  <Plus aria-hidden />
                </button>
                <div
                  id={`faq-${item.id}`}
                  className="lv2-faq__a"
                  role="region"
                  hidden={!isOpen}
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>

        {section.cta ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <a href={section.cta.href} className="lv2-btn lv2-btn--ghost">{section.cta.label}</a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
