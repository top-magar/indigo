"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, User, ShoppingBag, X, Menu } from "lucide-react"
import { useBlockMode } from "./data-context"
import { safeParseJson } from "./shared-utils"

type Layout = "logo-left" | "logo-center" | "minimal" | "split-nav"

interface HeaderProps {
  layout: Layout
  logo: string
  storeName: string
  navLinks: string
  showSearch: boolean
  showCart: boolean
  showAccount: boolean
  ctaText: string
  ctaUrl: string
  announcementText: string
  announcementBg: string
  sticky: boolean
  transparent: boolean
  backgroundColor: string
  borderBottom: boolean
}

interface NavLink { label: string; url: string }

const gridAreas: Record<Layout, string> = {
  "logo-left":  `"logo nav actions"`,
  "logo-center": `"nav logo actions"`,
  "minimal":    `"logo . actions"`,
  "split-nav":  `"nav logo actions"`,
}

const gridColumns: Record<Layout, string> = {
  "logo-left":  "auto 1fr auto",
  "logo-center": "1fr auto 1fr",
  "minimal":    "auto 1fr auto",
  "split-nav":  "1fr auto 1fr",
}

export function Header({
  layout = "logo-left", logo, storeName, navLinks, showSearch = true, showCart = true,
  showAccount = false, ctaText = "", ctaUrl = "", announcementText = "", announcementBg = "",
  sticky = true, transparent = false, backgroundColor = "#ffffff", borderBottom = true,
}: HeaderProps) {
  const [dismissed, setDismissed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { mode } = useBlockMode()
  const isEditor = mode === "editor"
  const links = safeParseJson<NavLink[]>(navLinks, [])
  const prevent = isEditor ? (e: React.MouseEvent) => e.preventDefault() : undefined

  // Transparent → solid on scroll
  const onScroll = useCallback(() => setScrolled(window.scrollY > 20), [])
  useEffect(() => {
    if (!transparent || isEditor) return
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [transparent, isEditor, onScroll])

  const isTransparent = transparent && !scrolled && !isEditor
  const bg = isTransparent ? "transparent" : backgroundColor
  const color = isTransparent ? "#ffffff" : "var(--store-color-text, #0f172a)"
  const border = borderBottom && !isTransparent

  // Split nav links for split-nav layout
  const mid = Math.ceil(links.length / 2)
  const navLeft = layout === "split-nav" ? links.slice(0, mid) : links
  const navRight = layout === "split-nav" ? links.slice(mid) : []

  return (
    <div className={sticky && !isEditor ? "sticky top-0 z-50" : ""}>
      {/* Announcement */}
      {announcementText && !dismissed && (
        <div className="relative text-xs text-center text-white py-1.5 px-8" style={{ background: announcementBg || "var(--store-color-primary, #000)" }}>
          {announcementText}
          <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white" aria-label="Dismiss announcement"><X size={14} /></button>
        </div>
      )}

      {/* Desktop — CSS grid, single render path */}
      <header
        className={`hidden @sm:grid items-center gap-6 px-6 py-3 transition-colors ${border ? "border-b border-gray-200" : ""}`}
        style={{ backgroundColor: bg, gridTemplateAreas: gridAreas[layout], gridTemplateColumns: gridColumns[layout] }}
        role="banner"
      >
        {/* Logo area */}
        <div className="flex items-center gap-2.5" style={{ gridArea: "logo" }}>
          {logo && <img src={logo} alt={storeName} className="h-8 object-contain" />}
          <span className="text-lg whitespace-nowrap" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)" as never, color }}>{storeName}</span>
        </div>

        {/* Nav area */}
        {layout !== "minimal" && (
          <nav className="flex items-center gap-6" style={{ gridArea: "nav", justifyContent: layout === "split-nav" ? "space-between" : layout === "logo-center" ? "flex-end" : "flex-start" }}>
            {navLeft.map((l, i) => <a key={i} href={l.url} onClick={prevent} className="text-sm hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color }}>{l.label}</a>)}
            {navRight.length > 0 && <span className="w-px h-4 bg-current opacity-20" />}
            {navRight.map((l, i) => <a key={`r${i}`} href={l.url} onClick={prevent} className="text-sm hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color }}>{l.label}</a>)}
          </nav>
        )}

        {/* Actions area */}
        <div className="flex items-center gap-3 justify-end" style={{ gridArea: "actions" }}>
          {ctaText && (
            <a href={ctaUrl || "#"} onClick={prevent} className="text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: "var(--store-color-primary, #000)", color: "#fff", borderRadius: "var(--store-btn-radius, 8px)" }}>{ctaText}</a>
          )}
          {showSearch && <button aria-label="Search" style={{ color }}><Search size={18} /></button>}
          {showAccount && <button aria-label="Account" style={{ color }}><User size={18} /></button>}
          {showCart && (
            <button aria-label="Cart" className="relative" style={{ color }}>
              <ShoppingBag size={18} />
              <span className="absolute -top-1.5 -right-1.5 text-[10px] w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--store-color-primary, #000)", color: "#fff" }}>0</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile — always logo + hamburger */}
      <div className={`@sm:hidden flex items-center justify-between px-6 py-3 transition-colors ${border ? "border-b border-gray-200" : ""}`} style={{ backgroundColor: bg }} role="banner">
        <div className="flex items-center gap-2.5">
          {logo && <img src={logo} alt={storeName} className="h-8 object-contain" />}
          <span className="text-lg" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)" as never, color }}>{storeName}</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ color }}><Menu size={22} /></button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && <MobileDrawer onClose={() => setDrawerOpen(false)} links={links} ctaText={ctaText} ctaUrl={ctaUrl} showSearch={showSearch} showAccount={showAccount} prevent={prevent} />}
    </div>
  )
}

function MobileDrawer({ onClose, links, ctaText, ctaUrl, showSearch, showAccount, prevent }: {
  onClose: () => void; links: NavLink[]; ctaText: string; ctaUrl: string
  showSearch: boolean; showAccount: boolean; prevent: ((e: React.MouseEvent) => void) | undefined
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <nav className="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-xl flex flex-col p-6 gap-1 overflow-y-auto animate-slide-in-right">
        <button onClick={onClose} className="self-end mb-4" aria-label="Close menu"><X size={22} /></button>
        {links.map((l, i) => <a key={i} href={l.url} onClick={prevent} className="py-2.5 text-base hover:opacity-70 border-b border-gray-100">{l.label}</a>)}
        {showSearch && <button className="py-2.5 text-base text-left flex items-center gap-2 border-b border-gray-100"><Search size={16} /> Search</button>}
        {showAccount && <button className="py-2.5 text-base text-left flex items-center gap-2 border-b border-gray-100"><User size={16} /> Account</button>}
        {ctaText && (
          <a href={ctaUrl || "#"} onClick={prevent} className="mt-4 text-center text-sm font-medium px-4 py-2.5"
            style={{ background: "var(--store-color-primary, #000)", color: "#fff", borderRadius: "var(--store-btn-radius, 8px)" }}>{ctaText}</a>
        )}
      </nav>
    </div>
  )
}
