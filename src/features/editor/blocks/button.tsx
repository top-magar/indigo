"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

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
  const fg = textColor || "#fff"

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

const summaryClass = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const inputClass = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ButtonBlockProps }))
  const set = <K extends keyof ButtonBlockProps>(key: K, val: ButtonBlockProps[K]) => setProp((p: ButtonBlockProps) => { (p as any)[key] = val })

  return (
    <div className="flex flex-col gap-1 p-1">
      <details open>
        <summary className={summaryClass}>Content</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Text<input type="text" value={props.text} onChange={(e) => set("text", e.target.value)} className={inputClass} /></label>
          <label className={fieldClass}>Link<input type="text" value={props.href} onChange={(e) => set("href", e.target.value)} placeholder="/products" className={inputClass} /></label>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <input type="checkbox" checked={props.openInNewTab} onChange={(e) => set("openInNewTab", e.target.checked)} />Open in new tab
          </label>
        </div>
      </details>

      <details open>
        <summary className={summaryClass}>Style</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Variant
            <select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={inputClass}>
              <option value="solid">Solid</option><option value="outline">Outline</option><option value="ghost">Ghost</option><option value="link">Link</option>
            </select>
          </label>
          <label className={fieldClass}>Size
            <select value={props.size} onChange={(e) => set("size", e.target.value as any)} className={inputClass}>
              <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option><option value="xl">Extra Large</option>
            </select>
          </label>
          <label className={fieldClass}>Alignment
            <select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={inputClass}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <input type="checkbox" checked={props.fullWidth} onChange={(e) => set("fullWidth", e.target.checked)} />Full Width
          </label>
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Colors</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Background<input type="color" value={props.backgroundColor || "#000000"} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <label className={fieldClass}>Text<input type="color" value={props.textColor || "#ffffff"} onChange={(e) => set("textColor", e.target.value)} /></label>
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Shape</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Corner Radius ({props.borderRadius}px)<input type="range" min={0} max={32} value={props.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} /></label>
          <label className={fieldClass}>Shadow
            <select value={props.shadow} onChange={(e) => set("shadow", e.target.value as any)} className={inputClass}>
              <option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
            </select>
          </label>
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Icon</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Icon
            <select value={props.icon} onChange={(e) => set("icon", e.target.value as any)} className={inputClass}>
              <option value="">None</option><option value="arrow-right">Arrow Right</option><option value="cart">Shopping Cart</option><option value="external">External Link</option>
            </select>
          </label>
          {props.icon && (
            <label className={fieldClass}>Position
              <select value={props.iconPosition} onChange={(e) => set("iconPosition", e.target.value as any)} className={inputClass}>
                <option value="left">Left</option><option value="right">Right</option>
              </select>
            </label>
          )}
        </div>
      </details>
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
