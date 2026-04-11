interface SocialIconsProps {
  links: string
}

export function SocialIcons({ links }: SocialIconsProps) {
  const items: { platform: string; url: string }[] = typeof links === "string" ? JSON.parse(links || "[]") : links
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {items.map((l, i) => (
        <a key={i} href={l.url} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--store-color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          {l.platform[0]?.toUpperCase()}
        </a>
      ))}
    </div>
  )
}
