"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { Section, TextField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

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
  if (!props) return null
  const set = <K extends keyof HeaderProps>(k: K, v: HeaderProps[K]) => setProp((p: HeaderProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Store Name" value={props.storeName} onChange={(v) => set("storeName", v)} />
        <ImagePickerField label="Logo" value={props.logoUrl} onChange={(url) => set("logoUrl", url)} />
                <SliderField label="Logo Width" value={props.logoWidth} onChange={(v) => set("logoWidth", v)} min={24} max={200} />
        <label className={F}>Nav Links (Label:href, comma-separated)<textarea value={props.links} onChange={(e) => set("links", e.target.value)} placeholder="Shop:/products, About:/about" className={I} rows={2} /></label>
      </Section>
      <Section title="Layout">
                <SegmentedControl label="Layout" value={props.layout} onChange={(v) => set("layout", v as any)} options={[{ value: "default", label: "Default" }, { value: "centered", label: "Centered" }, { value: "minimal", label: "Minimal (logo only)" }]} />
                <SliderField label="Height" value={props.height} onChange={(v) => set("height", v)} min={48} max={120} />
                <SliderField label="Horizontal Padding" value={props.paddingX} onChange={(v) => set("paddingX", v)} min={12} max={80} />
                <ToggleField label="Sticky" checked={props.sticky} onChange={(v) => set("sticky", v)} />
                <ToggleField label="Bottom border" checked={props.showSeparator} onChange={(v) => set("showSeparator", v)} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

HeaderBlock.craft = {
  displayName: "Header",
  props: { _v: 1, storeName: "My Store", logoUrl: "", logoWidth: 100, links: "Shop:/products, About:/about, Contact:/contact", backgroundColor: "", textColor: "", sticky: false, showSeparator: true, height: 64, paddingX: 24, layout: "default" },
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false, canDrag: () => true },
  related: { settings: HeaderSettings },
}
