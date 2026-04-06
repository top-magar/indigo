interface CollectionListProps {
  heading: string; columns: number; gap: number; backgroundColor: string; paddingTop: number; paddingBottom: number
}

const MOCK = ["Summer Collection", "Winter Essentials", "New Arrivals", "Best Sellers", "Sale"]

export function CollectionListRender({ heading, columns, gap, backgroundColor, paddingTop, paddingBottom }: CollectionListProps) {
  return (
    <section style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, fontFamily: "var(--v2-font-heading, inherit)" }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {MOCK.slice(0, columns).map((name) => (
            <a key={name} href="#" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ aspectRatio: "3/2", backgroundColor: "#f3f4f6", borderRadius: "var(--v2-radius, 8px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>Image</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12, textAlign: "center" }}>{name}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
