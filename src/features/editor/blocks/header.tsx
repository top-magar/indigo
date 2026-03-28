"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"

interface HeaderProps {
  storeName: string
  logoUrl: string
  logoWidth: number
  links: string
  backgroundColor: string
  textColor: string
  sticky: boolean
  showSeparator: boolean
  height: number
  paddingX: number
  layout: "default" | "centered" | "minimal"
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const HeaderBlock = (props: HeaderProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { storeName, logoUrl, logoWidth, links, backgroundColor, textColor, sticky, showSeparator, height, paddingX, layout } = props

  const navLinks = links.split(",").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, href] = l.split(":")
    return { label: label?.trim(), href: href?.trim() || "#" }
  })

  const logoEl = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {logoUrl && <img src={logoUrl} alt={storeName} style={{ height: logoWidth * 0.8, width: logoWidth, objectFit: "contain" }} />}
      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--store-font-heading)" }}>{storeName}</span>
    </div>
  )

  const navEl = (
    <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {navLinks.map((link, i) => (
        <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, textDecoration: "none", fontSize: 14, opacity: 0.85, fontWeight: 500 }}>{link.label}</a>
      ))}
    </nav>
  )

  return (
    <header ref={craftRef(connect, drag)} style={{
      backgroundColor, color: textColor, height,
      padding: `0 ${paddingX}px`, display: "flex", alignItems: "center",
      justifyContent: layout === "centered" ? "center" : "space-between",
      flexDirection: layout === "centered" ? "column" : "row",
      gap: layout === "centered" ? 8 : 0,
      position: sticky ? "sticky" : "relative", top: 0, zIndex: 50,
      borderBottom: showSeparator ? "1px solid rgba(0,0,0,0.08)" : undefined,
    }}>
      {layout === "centered" ? <>{logoEl}{navEl}</> : <>{logoEl}{layout !== "minimal" && navEl}</>}
    </header>
  )
}

const HeaderSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as HeaderProps }))
  const set = <K extends keyof HeaderProps>(k: K, v: HeaderProps[K]) => setProp((p: HeaderProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Store Name<input type="text" value={props.storeName} onChange={(e) => set("storeName", e.target.value)} className={I} /></label>
        <ImagePickerField label="Logo" value={props.logoUrl} onChange={(url) => set("logoUrl", url)} />
        <label className={F}>Logo Width ({props.logoWidth}px)<input type="range" min={24} max={200} value={props.logoWidth} onChange={(e) => set("logoWidth", +e.target.value)} /></label>
        <label className={F}>Nav Links (Label:href, comma-separated)<textarea value={props.links} onChange={(e) => set("links", e.target.value)} placeholder="Shop:/products, About:/about" className={I} rows={2} /></label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Layout<select value={props.layout} onChange={(e) => set("layout", e.target.value as any)} className={I}><option value="default">Default</option><option value="centered">Centered</option><option value="minimal">Minimal (logo only)</option></select></label>
        <label className={F}>Height ({props.height}px)<input type="range" min={48} max={120} value={props.height} onChange={(e) => set("height", +e.target.value)} /></label>
        <label className={F}>Horizontal Padding ({props.paddingX}px)<input type="range" min={12} max={80} value={props.paddingX} onChange={(e) => set("paddingX", +e.target.value)} /></label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.sticky} onChange={(e) => set("sticky", e.target.checked)} />Sticky</label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showSeparator} onChange={(e) => set("showSeparator", e.target.checked)} />Bottom border</label>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

HeaderBlock.craft = {
  displayName: "Header",
  props: { _v: 1, storeName: "My Store", logoUrl: "", logoWidth: 100, links: "Shop:/products, About:/about, Contact:/contact", backgroundColor: "#ffffff", textColor: "#111111", sticky: false, showSeparator: true, height: 64, paddingX: 24, layout: "default" },
  rules: { canMoveIn: () => false, canDrag: () => true },
  related: { settings: HeaderSettings },
}
