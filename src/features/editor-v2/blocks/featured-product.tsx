interface FeaturedProductProps {
  title: string; description: string; price: string; ctaText: string; image: string
  layout: "left" | "right"; backgroundColor: string; accentColor: string; paddingTop: number; paddingBottom: number
}

export function FeaturedProductRender({ title, description, price, ctaText, image, layout, backgroundColor, accentColor, paddingTop, paddingBottom }: FeaturedProductProps) {
  return (
    <section style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, direction: layout === "right" ? "rtl" : "ltr" }}>
        <div style={{ aspectRatio: "1/1", backgroundColor: "#f3f4f6", borderRadius: "var(--v2-radius, 8px)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", direction: "ltr" }}>
          {image ? <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#9ca3af", fontSize: 14 }}>Product Image</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", direction: "ltr" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--v2-font-heading, inherit)" }}>{title}</h2>
          <p style={{ fontSize: 16, marginTop: 12, opacity: 0.7, lineHeight: 1.6 }}>{description}</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginTop: 16, color: accentColor }}>{price}</p>
          <button style={{ marginTop: 24, padding: "14px 32px", fontSize: 16, fontWeight: 600, backgroundColor: accentColor, color: "#fff", border: "none", borderRadius: "var(--v2-radius, 8px)", cursor: "pointer", alignSelf: "flex-start" }}>{ctaText}</button>
        </div>
      </div>
    </section>
  )
}
