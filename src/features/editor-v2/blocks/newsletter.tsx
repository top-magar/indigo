interface NewsletterProps {
  heading: string; subheading: string; buttonText: string; placeholder: string
  backgroundColor: string; accentColor: string; paddingTop: number; paddingBottom: number
}

export function NewsletterRender({ heading, subheading, buttonText, placeholder, backgroundColor, accentColor, paddingTop, paddingBottom }: NewsletterProps) {
  return (
    <section style={{ backgroundColor, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px`, textAlign: "center" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--v2-font-heading, inherit)" }}>{heading}</h2>
        <p style={{ fontSize: 15, marginTop: 8, opacity: 0.7 }}>{subheading}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <input type="email" placeholder={placeholder} style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "1px solid rgba(0,0,0,0.15)", borderRadius: "var(--v2-radius, 8px)", outline: "none" }} />
          <button style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, backgroundColor: accentColor, color: "#fff", border: "none", borderRadius: "var(--v2-radius, 8px)", cursor: "pointer", whiteSpace: "nowrap" }}>{buttonText}</button>
        </div>
      </div>
    </section>
  )
}
