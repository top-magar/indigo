interface NavLinksProps {
  links: string; direction: "horizontal" | "vertical"; gap: number; _sectionId?: string
}

export function NavLinks({ links, direction, gap, _sectionId }: NavLinksProps) {
  const items: { label: string; url: string }[] = typeof links === "string" ? JSON.parse(links || "[]") : links
  return (
    <nav style={{ display: "flex", flexDirection: direction === "vertical" ? "column" : "row", gap }}>
      {items.map((l, i) => (
        <a key={i} href={l.url} onClick={_sectionId ? (e) => e.preventDefault() : undefined}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--store-color-text, #0f172a)", textDecoration: "none" }}>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
