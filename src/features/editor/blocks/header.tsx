"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface HeaderProps {
  storeName: string
  logoUrl: string
  links: string // comma-separated "Label:href" pairs
  backgroundColor: string
  textColor: string
  sticky: boolean
}

export const HeaderBlock = ({
  storeName, logoUrl, links, backgroundColor, textColor, sticky,
}: HeaderProps) => {
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
    <header
      ref={craftRef(connect, drag)}
      style={{
        backgroundColor,
        color: textColor,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logoUrl && <img src={logoUrl} alt={storeName} style={{ height: 32, objectFit: "contain" }} />}
        <span style={{ fontSize: 18, fontWeight: 700 }}>{storeName}</span>
      </div>
      <nav style={{ display: "flex", gap: 20 }}>
        {navLinks.map((link, i) => (
          <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, textDecoration: "none", fontSize: 14, opacity: 0.9 }}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

const HeaderSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as HeaderProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Store Name
        <input
          type="text"
          value={props.storeName}
          onChange={(e) => setProp((p: HeaderProps) => (p.storeName = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Logo URL
        <input
          type="url"
          value={props.logoUrl}
          onChange={(e) => setProp((p: HeaderProps) => (p.logoUrl = e.target.value))}
          placeholder="https://..."
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Nav Links (Label:href, comma-separated)
        <textarea
          value={props.links}
          onChange={(e) => setProp((p: HeaderProps) => (p.links = e.target.value))}
          placeholder="Shop:/products, About:/about, Contact:/contact"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          rows={2}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background Color
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((p: HeaderProps) => (p.backgroundColor = e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text Color
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((p: HeaderProps) => (p.textColor = e.target.value))}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input
          type="checkbox"
          checked={props.sticky}
          onChange={(e) => setProp((p: HeaderProps) => (p.sticky = e.target.checked))}
        />
        Sticky Header
      </label>
    </div>
  )
}

HeaderBlock.craft = {
  displayName: "Header",
  props: { _v: 1,
    storeName: "My Store",
    logoUrl: "",
    links: "Shop:/products, About:/about, Contact:/contact",
    backgroundColor: "#ffffff",
    textColor: "#111111",
    sticky: false,
  },
  rules: { canMoveIn: () => false, canDrag: () => true },
  related: { settings: HeaderSettings },
}
