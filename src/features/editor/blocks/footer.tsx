"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface FooterProps {
  storeName: string
  copyright: string
  links: string // comma-separated "Label:href" pairs
  backgroundColor: string
  textColor: string
  showSocial: boolean
}

export const FooterBlock = ({
  storeName, copyright, links, backgroundColor, textColor, showSocial,
}: FooterProps) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  const navLinks = links
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, href] = l.split(":")
      return { label: label?.trim(), href: href?.trim() || "#" }
    })

  return (
    <footer
      ref={craftRef(connect, drag)}
      style={{ backgroundColor, color: textColor, padding: "40px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{storeName}</div>
            {showSocial && (
              <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 13, opacity: 0.7 }}>
                <span>Twitter</span>
                <span>Instagram</span>
                <span>Facebook</span>
              </div>
            )}
          </div>
          <nav style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {navLinks.map((link, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, textDecoration: "none", fontSize: 14, opacity: 0.8 }}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ borderTop: `1px solid ${textColor}22`, paddingTop: 16, fontSize: 13, opacity: 0.6 }}>
          {copyright}
        </div>
      </div>
    </footer>
  )
}

const FooterSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FooterProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Store Name
        <input
          type="text"
          value={props.storeName}
          onChange={(e) => setProp((p: FooterProps) => (p.storeName = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Copyright
        <input
          type="text"
          value={props.copyright}
          onChange={(e) => setProp((p: FooterProps) => (p.copyright = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Links (Label:href, comma-separated)
        <textarea
          value={props.links}
          onChange={(e) => setProp((p: FooterProps) => (p.links = e.target.value))}
          placeholder="Privacy:/privacy, Terms:/terms, Contact:/contact"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          rows={2}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background Color
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((p: FooterProps) => (p.backgroundColor = e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text Color
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((p: FooterProps) => (p.textColor = e.target.value))}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input
          type="checkbox"
          checked={props.showSocial}
          onChange={(e) => setProp((p: FooterProps) => (p.showSocial = e.target.checked))}
        />
        Show Social Links
      </label>
    </div>
  )
}

FooterBlock.craft = {
  displayName: "Footer",
  props: { _v: 1,
    storeName: "My Store",
    copyright: "© 2026 My Store. All rights reserved.",
    links: "Privacy:/privacy, Terms:/terms, Contact:/contact",
    backgroundColor: "#111111",
    textColor: "#ffffff",
    showSocial: true,
  },
  rules: { canMoveIn: () => false },
  related: { settings: FooterSettings },
}
