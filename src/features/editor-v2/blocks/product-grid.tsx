interface ProductGridProps {
  heading: string; columns: number; rows: number; gap: number
  showPrice: boolean; backgroundColor: string; paddingTop: number; paddingBottom: number
}

const MOCK = Array.from({ length: 12 }, (_, i) => ({ name: `Product ${i + 1}`, price: `$${(19.99 + i * 10).toFixed(2)}` }))

export function ProductGridRender({ heading, columns, rows, gap, showPrice, backgroundColor, paddingTop, paddingBottom }: ProductGridProps) {
  const count = columns * rows
  return (
    <section style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, fontFamily: "var(--v2-font-heading, inherit)" }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {MOCK.slice(0, count).map((p, i) => (
            <div key={i} style={{ borderRadius: "var(--v2-radius, 8px)", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ aspectRatio: "1/1", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>Image</div>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</p>
                {showPrice && <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: "var(--v2-primary, #005bd3)" }}>{p.price}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
