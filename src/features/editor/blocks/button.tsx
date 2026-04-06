"use client"

import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"

interface ButtonBlockProps {
  text: string
  href: string
  variant: "solid" | "outline" | "ghost" | "link"
  size: "sm" | "md" | "lg" | "xl"
  fullWidth: boolean
  alignment: "left" | "center" | "right"
  backgroundColor: string
  textColor: string
  borderRadius: number
  shadow: "none" | "sm" | "md" | "lg"
  icon: "" | "arrow-right" | "cart" | "external"
  iconPosition: "left" | "right"
  openInNewTab: boolean
}

const sizes: Record<string, { h: number; px: number; fs: number }> = {
  sm: { h: 32, px: 12, fs: 13 },
  md: { h: 40, px: 16, fs: 14 },
  lg: { h: 48, px: 24, fs: 16 },
  xl: { h: 56, px: 32, fs: 18 },
}

const shadows: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px rgba(0,0,0,0.07)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
}

const iconSvgs: Record<string, string> = {
  "arrow-right": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  cart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`,
}

export const ButtonBlock = (props: ButtonBlockProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { text, variant, size, fullWidth, alignment, backgroundColor, textColor, borderRadius, shadow, icon, iconPosition } = props
  const s = sizes[size]
  const bg = backgroundColor || "var(--store-primary, #000)"
  const fg = textColor || "var(--store-bg, #fff)"

  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600,
    borderRadius, boxShadow: shadows[shadow], cursor: "pointer",
    transition: "opacity 0.15s", width: fullWidth ? "100%" : undefined,
  }

  const style: React.CSSProperties =
    variant === "solid" ? { ...base, backgroundColor: bg, color: fg, border: "none" } :
    variant === "outline" ? { ...base, backgroundColor: "transparent", color: bg, border: `2px solid ${bg}` } :
    variant === "ghost" ? { ...base, backgroundColor: "transparent", color: bg, border: "none" } :
    { ...base, backgroundColor: "transparent", color: bg, border: "none", textDecoration: "underline", height: "auto", padding: 0 }

  const iconHtml = icon && iconSvgs[icon] ? <span dangerouslySetInnerHTML={{ __html: iconSvgs[icon] }} /> : null

  return (
    <div ref={craftRef(connect, drag)} style={{ textAlign: alignment }}>
      <button style={style} onClick={(e) => e.preventDefault()}>
        {icon && iconPosition === "left" && iconHtml}
        {text}
        {icon && iconPosition === "right" && iconHtml}
      </button>
    </div>
  )
}

const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"

const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ButtonBlockProps }))
  if (!props) return null
  const set = <K extends keyof ButtonBlockProps>(key: K, val: ButtonBlockProps[K]) => setProp((p: ButtonBlockProps) => { (p as any)[key] = val })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
            <Section title="Content">
                  <TextField label="Text" value={props.text} onChange={(v) => set("text", v)} />
                  <TextField label="Link" value={props.href} onChange={(v) => set("href", v)} placeholder="/products" />
                  <ToggleField label="Open in new tab" checked={props.openInNewTab} onChange={(v) => set("openInNewTab", v)} />
      </Section>

            <Section title="Style">
                  <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }, { value: "link", label: "Link" }]} />
                  <SegmentedControl label="Size" value={props.size} onChange={(v) => set("size", v as any)} options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" }]} />
                  <SegmentedControl label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "left", label: "Left", icon: AlignLeft, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenter, iconOnly: true }, { value: "right", label: "Right", icon: AlignRight, iconOnly: true }]} />
                  <ToggleField label="Full Width" checked={props.fullWidth} onChange={(v) => set("fullWidth", v)} />
      </Section>

            <Section title="Colors">
          <label className={fieldClass}>Background<input type="color" value={props.backgroundColor || "#000000"} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <label className={fieldClass}>Text<input type="color" value={props.textColor || "#ffffff"} onChange={(e) => set("textColor", e.target.value)} /></label>
      </Section>

            <Section title="Shape">
                  <SliderField label="Corner Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={32} />
                  <SegmentedControl label="Shadow" value={props.shadow} onChange={(v) => set("shadow", v as any)} options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
      </Section>

            <Section title="Icon">
                  <SegmentedControl label="Icon" value={props.icon} onChange={(v) => set("icon", v as any)} options={[{ value: "arrow-right", label: "Arrow Right" }, { value: "cart", label: "Shopping Cart" }, { value: "external", label: "External Link" }]} />
          {props.icon && (
                    <SegmentedControl label="Position" value={props.iconPosition} onChange={(v) => set("iconPosition", v as any)} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
          )}
      </Section>
    </div>
  )
}

ButtonBlock.craft = {
  displayName: "Button",
  props: {
    _v: 1, text: "Click me", href: "#", variant: "solid", size: "md",
    fullWidth: false, alignment: "left", backgroundColor: "", textColor: "",
    borderRadius: 8, shadow: "none", icon: "", iconPosition: "right", openInNewTab: false,
  },
  rules: { canMoveIn: () => false },
  related: { settings: ButtonSettings },
}
