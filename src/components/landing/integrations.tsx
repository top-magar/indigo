"use client";

import { useMemo, useState } from "react";
import { sectionData, type Integration } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";
import { Badge } from "./badge";

const categoryCounts: Record<string, number> = sectionData.integrations.rows.flat().reduce<Record<string, number>>((acc, item) => {
  acc[item.category] = (acc[item.category] ?? 0) + 1;
  return acc;
}, {});

const categories = ["All", ...Object.keys(categoryCounts)] as const;

export function IntegrationsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const allItems = useMemo(() => sectionData.integrations.rows.flat(), []);
  const filtered = useMemo(
    () => (activeCategory === "All" ? allItems : allItems.filter((item) => item.category === activeCategory)),
    [activeCategory, allItems],
  );

  return (
    <section id="integrations" className="lv2-section" aria-labelledby="integrations-title">
      <div className="lv2-container">
        <SectionHeading
          index={sectionData.integrations.index}
          total={sectionData.integrations.total}
          label={sectionData.integrations.label}
          eyebrow={sectionData.integrations.eyebrow}
          headline={sectionData.integrations.headline}
          body={sectionData.integrations.body}
          id="integrations-title"
        />

        <div className="lv2-integration-tabs" role="tablist" aria-label="Integration categories">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const count = category === "All" ? allItems.length : categoryCounts[category] ?? 0;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                className={isActive ? "lv2-tab lv2-tab--active" : "lv2-tab"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
                <em>{count}</em>
              </button>
            );
          })}
        </div>

        <div className="lv2-integration-grid" role="tabpanel">
          {filtered.map((item: Integration) => (
            <a key={item.id} href="#integrations" className="lv2-integration">
              <div className="lv2-integration__logo">{item.name.charAt(0)}</div>
              <div>
                <strong>{item.name}</strong>
                <Badge variant="ghost">{item.category}</Badge>
              </div>
            </a>
          ))}
        </div>

        <div className="lv2-integration-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <p style={{ margin: 0, color: "var(--lv2-muted)", fontSize: 14 }}>
            Don’t see your tool? Use the REST API and webhooks to connect anything in minutes.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/docs" className="lv2-btn lv2-btn--ghost lv2-btn--sm">View API Docs</a>
            <a href="/contact" className="lv2-btn lv2-btn--primary lv2-btn--sm">Request Integration</a>
          </div>
        </div>
      </div>
    </section>
  );
}
