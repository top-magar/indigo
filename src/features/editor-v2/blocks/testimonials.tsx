interface TestimonialsProps {
  heading: string; items: string; columns: number; backgroundColor: string; accentColor: string; paddingTop: number; paddingBottom: number
}

export function TestimonialsRender({ heading, items, columns, backgroundColor, accentColor, paddingTop, paddingBottom }: TestimonialsProps) {
  const parsed = items.split("\n").map((line) => { const [name, quote] = line.split("|"); return { name: name?.trim() ?? "", quote: quote?.trim() ?? "" } }).filter((i) => i.name)

  return (
    <section style={{ backgroundColor, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, fontFamily: "var(--v2-font-heading, inherit)", textAlign: "center" }}>{heading}</h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24 }}>
          {parsed.map((t, i) => (
            <div key={i} style={{ padding: 24, backgroundColor: "#fff", borderRadius: "var(--v2-radius, 8px)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ color: accentColor, fontSize: 24, lineHeight: 1, marginBottom: 8 }}>"</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{t.quote}</p>
              <p style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
