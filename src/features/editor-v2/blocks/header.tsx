interface HeaderProps {
  logo: string; storeName: string; navLinks: string
  backgroundColor: string; sticky: boolean
}

export function Header({ logo, storeName, navLinks, backgroundColor, sticky }: HeaderProps) {
  const links: { label: string; url: string }[] = (() => { try { return JSON.parse(navLinks) } catch { return [] } })()
  return (
    <header className={`flex items-center justify-between px-6 py-4 ${sticky ? "sticky top-0 z-50" : ""}`} style={{ backgroundColor }}>
      <div className="flex items-center gap-3">
        {logo && <img src={logo} alt={storeName} className="h-8 w-8 object-contain" />}
        <span className="text-lg font-bold">{storeName}</span>
      </div>
      <nav className="flex gap-6">
        {links.map((l, i) => <a key={i} href={l.url} className="text-sm font-medium hover:opacity-70">{l.label}</a>)}
      </nav>
    </header>
  )
}
