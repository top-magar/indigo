"use client"
import { useEffect, useState } from "react"
import { useBlockMode } from "./data-context"

interface HeaderProps {
  logo: string; storeName: string; navLinks: string
  backgroundColor: string; sticky: boolean
}

export function Header({ logo, storeName, navLinks, backgroundColor, sticky }: HeaderProps) {
  const { mode, slug } = useBlockMode()
  const [tenant, setTenant] = useState({ logo, storeName })
  const links: { label: string; url: string }[] = (() => { try { return JSON.parse(navLinks) } catch { return [] } })()

  useEffect(() => {
    if (mode === "editor") { setTenant({ logo, storeName }); return }
    fetch(`/api/store/${slug}/products?limit=1`)
      .then((r) => r.json())
      .then((d) => {
        const t = d.data?.tenant
        if (t) setTenant({ logo: logo || "", storeName: t.name ?? storeName })
      })
      .catch(() => {})
  }, [mode, slug, logo, storeName])

  return (
    <header className={`flex items-center justify-between px-6 py-4 ${sticky ? "sticky top-0 z-50" : ""}`} style={{ backgroundColor }}>
      <div className="flex items-center gap-3">
        {tenant.logo && <img src={tenant.logo} alt={tenant.storeName} className="h-8 w-8 object-contain" />}
        <span className="text-lg" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{tenant.storeName}</span>
      </div>
      <nav className="flex gap-6">
        {links.map((l, i) => <a key={i} href={l.url} className="text-sm font-medium hover:opacity-70">{l.label}</a>)}
      </nav>
    </header>
  )
}
