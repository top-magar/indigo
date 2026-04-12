interface LinkGroupProps {
  title: string; links: string
}

export function LinkGroup({ title, links }: LinkGroupProps) {
  const items: { label: string; url: string }[] = typeof links === "string" ? JSON.parse(links || "[]") : links
  return (
    <div>
      <h4 style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", color: "var(--store-color-text, #0f172a)", margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>{title}</h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((l, i) => (
          <li key={i}><a href={l.url} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--store-color-muted, #64748b)", textDecoration: "none" }}>{l.label}</a></li>
        ))}
      </ul>
    </div>
  )
}
