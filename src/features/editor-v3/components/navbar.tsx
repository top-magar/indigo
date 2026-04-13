"use client"
import type { ReactNode } from "react"

interface NavbarProps {
  storeName?: string
  links?: Array<{ label: string; href: string }>
  layout?: "logo-left" | "logo-center" | "minimal"
  ctaText?: string
  ctaHref?: string
  sticky?: boolean
  showCart?: boolean
  style?: React.CSSProperties
  children?: ReactNode
}

export function Navbar({ storeName = "My Store", links = [], layout = "logo-left", ctaText, ctaHref, sticky = true, showCart, style }: NavbarProps) {
  const navLinks = Array.isArray(links) ? links : []

  return (
    <header style={{
      ...style,
      position: sticky ? "sticky" : "relative",
      top: 0,
      zIndex: 50,
      background: style?.background ?? "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: style?.padding ?? "12px 24px",
    }}>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: layout === "logo-center" ? "center" : "space-between",
        maxWidth: 1280,
        margin: "0 auto",
        gap: 24,
      }}>
        {/* Logo */}
        <a href="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: "none", color: "inherit", order: layout === "logo-center" ? 1 : 0 }}>
          {storeName}
        </a>

        {/* Links */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", order: layout === "logo-center" ? 0 : 1 }}>
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} style={{ fontSize: 14, textDecoration: "none", color: "#374151" }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", order: 2 }}>
          {showCart && (
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>🛒</button>
          )}
          {ctaText && (
            <a href={ctaHref ?? "#"} style={{
              padding: "8px 20px", borderRadius: 6, background: "#000", color: "#fff",
              fontSize: 13, fontWeight: 500, textDecoration: "none",
            }}>
              {ctaText}
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}
