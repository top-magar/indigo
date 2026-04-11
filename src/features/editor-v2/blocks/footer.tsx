interface FooterProps {
  columns: string; copyright: string; backgroundColor: string
}

export function Footer({ columns, copyright, backgroundColor }: FooterProps) {
  const cols: { title: string; links: { label: string; url: string }[] }[] = (() => { try { return JSON.parse(columns) } catch { return [] } })()
  return (
    <footer style={{ backgroundColor }} className="px-6 py-10">
      <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${cols.length || 1}, minmax(0, 1fr))` }}>
        {cols.map((col, i) => (
          <div key={i}>
            <h4 className="mb-3" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l, j) => <li key={j}><a href={l.url} className="text-sm hover:opacity-70" style={{ color: "var(--store-color-muted)" }}>{l.label}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      {copyright && <p className="mt-8 border-t border-gray-200 pt-4 text-center text-sm" style={{ color: "var(--store-color-muted)" }}>{copyright}</p>}
    </footer>
  )
}
