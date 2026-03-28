"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface PromoBannerProps {
  text: string; ctaText: string; ctaHref: string
  backgroundColor: string; textColor: string; ctaColor: string; ctaTextColor: string
  variant: "bar" | "split" | "centered"
  size: "sm" | "md" | "lg"
  showDismiss: boolean; icon: "" | "🔥" | "🎉" | "⚡" | "🛍️"
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const padMap = { sm: "8px 16px", md: "12px 24px", lg: "20px 24px" }
const fsMap = { sm: 13, md: 15, lg: 18 }

export const PromoBannerBlock = (props: PromoBannerProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { text, ctaText, ctaHref, backgroundColor, textColor, ctaColor, ctaTextColor, variant, size, icon } = props
  const pad = padMap[size]; const fs = fsMap[size]
  const btnStyle: React.CSSProperties = { padding: "6px 16px", borderRadius: "var(--store-radius, 6px)", backgroundColor: ctaColor, color: ctaTextColor, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }

  if (variant === "centered") {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: pad, textAlign: "center" }}>
        <div style={{ fontSize: fs, fontWeight: 600 }}>{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{text}</div>
        {ctaText && <button style={{ ...btnStyle, marginTop: 8 }}>{ctaText}</button>}
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: pad, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: fs, fontWeight: 600 }}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{text}</span>
      {ctaText && <button style={btnStyle}>{ctaText}</button>}
    </div>
  )
}

const PromoBannerSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as PromoBannerProps }))
  const set = <K extends keyof PromoBannerProps>(k: K, v: PromoBannerProps[K]) => setProp((p: PromoBannerProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Text<input type="text" value={props.text} onChange={(e) => set("text", e.target.value)} className={I} /></label>
        <label className={F}>CTA Text<input type="text" value={props.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={I} /></label>
        <label className={F}>CTA Link<input type="text" value={props.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} className={I} /></label>
        <label className={F}>Icon<select value={props.icon} onChange={(e) => set("icon", e.target.value as any)} className={I}><option value="">None</option><option value="🔥">🔥 Fire</option><option value="🎉">🎉 Party</option><option value="⚡">⚡ Flash</option><option value="🛍️">🛍️ Shopping</option></select></label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Variant<select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={I}><option value="bar">Bar</option><option value="centered">Centered</option></select></label>
        <label className={F}>Size<select value={props.size} onChange={(e) => set("size", e.target.value as any)} className={I}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></label>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
          <label className={F}>CTA BG<input type="color" value={props.ctaColor} onChange={(e) => set("ctaColor", e.target.value)} /></label>
          <label className={F}>CTA Text<input type="color" value={props.ctaTextColor} onChange={(e) => set("ctaTextColor", e.target.value)} /></label>
        </div>
      </div></details>
    </div>
  )
}

PromoBannerBlock.craft = {
  displayName: "Promo Banner",
  props: { _v: 1, text: "Free shipping on orders over Rs. 2,000!", ctaText: "Shop Now", ctaHref: "/products", backgroundColor: "#1a1a2e", textColor: "#ffffff", ctaColor: "#ffffff", ctaTextColor: "#1a1a2e", variant: "bar", size: "md", showDismiss: false, icon: "🔥" },
  rules: { canMoveIn: () => false },
  related: { settings: PromoBannerSettings },
}
