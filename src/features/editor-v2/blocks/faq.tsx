"use client"

import { useState } from "react"

interface FAQProps {
  heading: string; items: string; backgroundColor: string; accentColor: string; paddingTop: number; paddingBottom: number
}

export function FAQRender({ heading, items, backgroundColor, accentColor, paddingTop, paddingBottom }: FAQProps) {
  const parsed = items.split("\n").map((line) => { const [q, a] = line.split("|"); return { q: q?.trim() ?? "", a: a?.trim() ?? "" } }).filter((i) => i.q)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, fontFamily: "var(--v2-font-heading, inherit)", textAlign: "center" }}>{heading}</h2>
        {parsed.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500, textAlign: "left", color: "inherit" }}>
              {item.q}
              <span style={{ color: accentColor, fontSize: 18 }}>{openIdx === i ? "−" : "+"}</span>
            </button>
            {openIdx === i && <p style={{ padding: "0 0 16px", fontSize: 14, lineHeight: 1.6, opacity: 0.7 }}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
