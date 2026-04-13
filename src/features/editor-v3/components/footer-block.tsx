"use client"
import type { ReactNode } from "react"

interface FooterColumn { title: string; links: string }
interface SocialLink { platform: string; url: string }

interface FooterProps {
  storeName?: string
  description?: string
  columns?: FooterColumn[]
  layout?: "columns" | "minimal" | "centered"
  showNewsletter?: boolean
  socialLinks?: SocialLink[]
  copyright?: string
  style?: React.CSSProperties
  children?: ReactNode
}

export function FooterBlock({ storeName = "My Store", description, columns = [], layout = "columns", showNewsletter, socialLinks = [], copyright, style }: FooterProps) {
  const cols = Array.isArray(columns) ? columns : []
  const socials = Array.isArray(socialLinks) ? socialLinks : []
  const year = new Date().getFullYear()

  return (
    <footer style={{ ...style, background: style?.background ?? "#111827", color: style?.color ?? "#d1d5db", padding: style?.padding ?? "48px 24px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {layout === "columns" && (
          <div style={{ display: "grid", gridTemplateColumns: `1.5fr ${cols.map(() => "1fr").join(" ")}${showNewsletter ? " 1.5fr" : ""}`, gap: 32, marginBottom: 32 }}>
            {/* Brand */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>{storeName}</div>
              {description && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#9ca3af" }}>{description}</p>}
              {socials.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  {socials.map((s, i) => (
                    <a key={i} href={s.url} style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>{s.platform}</a>
                  ))}
                </div>
              )}
            </div>
            {/* Link columns */}
            {cols.map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 12 }}>{col.title}</div>
                {col.links.split("\n").filter(Boolean).map((link, j) => (
                  <a key={j} href="#" style={{ display: "block", fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 8 }}>{link.trim()}</a>
                ))}
              </div>
            ))}
            {/* Newsletter */}
            {showNewsletter && (
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 12 }}>Stay Updated</div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>Subscribe for updates and offers.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Email" style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, background: "#1f2937" }} />
                  <button style={{ padding: "8px 16px", borderRadius: 6, background: "#3b82f6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>Subscribe</button>
                </div>
              </div>
            )}
          </div>
        )}
        {layout === "minimal" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>{storeName}</div>
            <div style={{ display: "flex", gap: 24 }}>
              {cols.flatMap((col) => col.links.split("\n").filter(Boolean)).slice(0, 6).map((link, i) => (
                <a key={i} href="#" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>{link.trim()}</a>
              ))}
            </div>
          </div>
        )}
        {layout === "centered" && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>{storeName}</div>
            {description && <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>{description}</p>}
            <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
              {cols.flatMap((col) => col.links.split("\n").filter(Boolean)).slice(0, 8).map((link, i) => (
                <a key={i} href="#" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>{link.trim()}</a>
              ))}
            </div>
          </div>
        )}
        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #1f2937", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{copyright || `© ${year} ${storeName}. All rights reserved.`}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Visa", "Mastercard", "PayPal"].map((p) => (
              <span key={p} style={{ fontSize: 10, color: "#6b7280", padding: "2px 6px", border: "1px solid #374151", borderRadius: 3 }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
