"use client"
import { useState } from "react"
import { Search, User, ShoppingBag, X, Menu } from "lucide-react"
import { useBlockMode } from "./data-context"

interface HeaderProps {
  logo: string; storeName: string; navLinks: string; showSearch: boolean; showCart: boolean
  showAccount: boolean; announcementText: string; announcementBg: string; sticky: boolean
  backgroundColor: string; borderBottom: boolean
}

export function Header({ logo, storeName, navLinks, showSearch = true, showCart = true, showAccount = false,
  announcementText = "", announcementBg, sticky = true, backgroundColor = "#ffffff", borderBottom = true }: HeaderProps) {
  const [dismissed, setDismissed] = useState(false)
  const { mode } = useBlockMode()
  const links: { label: string; url: string }[] = (() => { try { return JSON.parse(navLinks) } catch { return [] } })()
  const textColor = "var(--store-color-text)"

  return (
    <div className={sticky ? "sticky top-0 z-50" : ""}>
      {announcementText && !dismissed && (
        <div className="relative text-xs text-center text-white py-1.5 px-4" style={{ background: announcementBg || "var(--store-color-primary)" }}>
          {announcementText}
          <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"><X size={14} /></button>
        </div>
      )}
      <header className={`flex items-center justify-between px-6 py-3 ${borderBottom ? "border-b border-gray-200" : ""}`} style={{ backgroundColor }}>
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt={storeName} className="h-8 object-contain" />}
          <span className="text-lg" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)" as never, color: textColor }}>{storeName}</span>
        </div>
        <nav className="hidden @sm:flex items-center gap-6">
          {links.map((l, i) => <a key={i} href={l.url} onClick={mode === "editor" ? (e) => e.preventDefault() : undefined} className="text-sm hover:opacity-70" style={{ color: textColor }}>{l.label}</a>)}
          <div className="flex items-center gap-3 ml-4">
            {showSearch && <button aria-label="Search" style={{ color: textColor }}><Search size={18} /></button>}
            {showAccount && <button aria-label="Account" style={{ color: textColor }}><User size={18} /></button>}
            {showCart && (
              <button aria-label="Cart" className="relative" style={{ color: textColor }}>
                <ShoppingBag size={18} />
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
              </button>
            )}
          </div>
        </nav>
        <button aria-label="Menu" className="@sm:hidden" style={{ color: textColor }}><Menu size={22} /></button>
      </header>
    </div>
  )
}
