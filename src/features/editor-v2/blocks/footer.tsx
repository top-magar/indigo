interface FooterProps {
  companyName: string; copyright: string
  col1Title: string; col1Links: string; col2Title: string; col2Links: string
  backgroundColor: string; textColor: string; paddingTop: number; paddingBottom: number
}

function LinkCol({ title, links, color }: { title: string; links: string; color: string }) {
  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{title}</p>
      {links.split(",").map((l) => l.trim()).filter(Boolean).map((link) => (
        <a key={link} href="#" style={{ display: "block", fontSize: 13, color, textDecoration: "none", marginBottom: 8, opacity: 0.8 }}>{link}</a>
      ))}
    </div>
  )
}

export function FooterRender({ companyName, copyright, col1Title, col1Links, col2Title, col2Links, backgroundColor, textColor, paddingTop, paddingBottom }: FooterProps) {
  return (
    <footer style={{ backgroundColor, color: textColor, padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48 }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "var(--v2-font-heading, inherit)" }}>{companyName}</p>
          <p style={{ fontSize: 13, marginTop: 8, opacity: 0.6 }}>{copyright}</p>
        </div>
        <LinkCol title={col1Title} links={col1Links} color={textColor} />
        <LinkCol title={col2Title} links={col2Links} color={textColor} />
      </div>
    </footer>
  )
}
