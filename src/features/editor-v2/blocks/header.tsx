interface HeaderProps {
  logoText: string
  navItems: string
  sticky: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
}

export function HeaderRender({ logoText, navItems, sticky, backgroundColor, textColor, accentColor }: HeaderProps) {
  const items = navItems.split(",").map((s) => s.trim()).filter(Boolean)
  return (
    <header style={{ backgroundColor, color: textColor, position: sticky ? "sticky" : "relative", top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto", padding: "12px var(--v2-section-gap-h, 24px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: accentColor, fontFamily: "var(--v2-font-heading, inherit)" }}>{logoText}</span>
        <nav style={{ display: "flex", gap: 24 }}>
          {items.map((item) => (
            <a key={item} href="#" style={{ fontSize: 14, color: textColor, textDecoration: "none", opacity: 0.8 }}>{item}</a>
          ))}
        </nav>
      </div>
    </header>
  )
}
