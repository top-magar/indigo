/** Hero — Pure render component. No editor dependency. */

interface HeroProps {
  heading: string
  subheading: string
  ctaText: string
  ctaHref: string
  variant: "full" | "split" | "minimal"
  textAlign: "left" | "center" | "right"
  image: string
  backgroundColor: string
  textColor: string
  ctaColor: string
  paddingTop: number
  paddingBottom: number
  minHeight: number
}

export function HeroRender({ heading, subheading, ctaText, ctaHref, variant, textAlign, image, backgroundColor, textColor, ctaColor, paddingTop, paddingBottom, minHeight }: HeroProps) {
  const align = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center"

  if (variant === "split") {
    return (
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight, backgroundColor, color: textColor }}>
        <div style={{ padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--v2-font-heading, inherit)" }}>{heading}</h1>
          <p style={{ fontSize: 18, marginTop: 16, opacity: 0.8 }}>{subheading}</p>
          {ctaText && <a href={ctaHref} style={{ marginTop: 24, display: "inline-block", padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: ctaColor, color: "#fff", borderRadius: "var(--v2-radius, 8px)", textDecoration: "none" }}>{ctaText}</a>}
        </div>
        <div style={{ backgroundColor: "var(--v2-bg, #f3f4f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#9ca3af", fontSize: 14 }}>Image</span>}
        </div>
      </section>
    )
  }

  const bgStyle = image
    ? { backgroundImage: `url(${image})`, backgroundSize: "cover" as const, backgroundPosition: "center" }
    : { backgroundColor }

  return (
    <section style={{ ...bgStyle, minHeight, color: textColor, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px`, display: "flex", flexDirection: "column" as const, alignItems: align, justifyContent: "center", textAlign }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: variant === "minimal" ? 28 : 48, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--v2-font-heading, inherit)" }}>{heading}</h1>
        <p style={{ fontSize: variant === "minimal" ? 16 : 20, marginTop: 16, opacity: 0.8 }}>{subheading}</p>
        {ctaText && <a href={ctaHref} style={{ marginTop: 24, display: "inline-block", padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: ctaColor, color: "#fff", borderRadius: "var(--v2-radius, 8px)", textDecoration: "none" }}>{ctaText}</a>}
      </div>
    </section>
  )
}
