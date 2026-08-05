import { Check } from "lucide-react";
import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";
import { Badge } from "./badge";

const layouts: Record<string, string> = {
  "visual-editor": "lv2-bento__card--lg",
  "local-first-payments": "lv2-bento__card--lg",
  "connected-operations": "",
};

export function DifferentiatorsSection() {
  const section = sectionData.differentiators;

  return (
    <section id="differentiators" className="lv2-section" aria-labelledby="differentiators-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Everything you need.<br />Nothing you don’t.</>}
          body={section.body}
          id="differentiators-title"
        />

        <div className="lv2-bento">
          {section.differentiators.map((item) => (
            <article
              key={item.id}
              className={`lv2-card lv2-bento__card ${layouts[item.id] ?? ""} lv2-card--hover`}
            >
              <Badge variant="accent">Indigo</Badge>
              <h3 style={{ marginTop: 14 }}>{item.title}</h3>
              <p style={{ marginTop: 8, color: "var(--lv2-muted)", fontSize: 14.5 }}>{item.description}</p>
              {item.points?.length ? (
                <ul style={{ margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 10, padding: 0, listStyle: "none" }}>
                  {item.points.map((point) => (
                    <li key={point} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--lv2-fg-soft)", fontSize: 14 }}>
                      <Check aria-hidden style={{ width: 16, height: 16, color: "var(--lv2-success)" }} />
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
