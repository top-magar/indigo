"use client"
import { useNode } from "@craftjs/core"
import { useState } from "react"
import { craftRef } from "../craft-ref"

interface TrustItem { icon: string; title: string; description: string }
interface TrustSignalsProps {
  heading: string; items: string; columns: 2 | 3 | 4
  variant: "icons" | "badges" | "minimal"
  backgroundColor: string; textColor: string; accentColor: string
  paddingTop: number; paddingBottom: number; alignment: "left" | "center"
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const defaultItems: TrustItem[] = [
  { icon: "🚚", title: "Free Shipping", description: "On orders over Rs. 2,000" },
  { icon: "🔒", title: "Secure Payment", description: "100% secure checkout" },
  { icon: "↩️", title: "Easy Returns", description: "30-day return policy" },
  { icon: "💬", title: "24/7 Support", description: "We're here to help" },
]
const parse = (s: string): TrustItem[] => { try { return JSON.parse(s) } catch { return defaultItems } }

export const TrustSignalsBlock = (props: TrustSignalsProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, items, columns, variant, backgroundColor, textColor, accentColor, paddingTop, paddingBottom, alignment } = props
  const parsed = parse(items)

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: alignment }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24 }}>
          {parsed.map((item, i) => (
            <div key={i} style={{
              padding: variant === "badges" ? 20 : 16,
              borderRadius: variant === "badges" ? 12 : 0,
              backgroundColor: variant === "badges" ? `${accentColor}10` : "transparent",
              border: variant === "badges" ? `1px solid ${accentColor}30` : "none",
              textAlign: variant === "minimal" ? "left" : "center",
              display: "flex", flexDirection: variant === "minimal" ? "row" : "column",
              alignItems: variant === "minimal" ? "center" : "center", gap: variant === "minimal" ? 12 : 8,
            }}>
              <span style={{ fontSize: variant === "icons" ? 32 : 24 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TrustSignalsSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TrustSignalsProps }))
  const set = <K extends keyof TrustSignalsProps>(k: K, v: TrustSignalsProps[K]) => setProp((p: TrustSignalsProps) => { (p as any)[k] = v })
  const [localItems, setLocalItems] = useState<TrustItem[]>(() => parse(props.items))
  const updateItems = (n: TrustItem[]) => { setLocalItems(n); setProp((p: TrustSignalsProps) => { p.items = JSON.stringify(n) }) }
  const updateItem = (idx: number, field: keyof TrustItem, val: string) => { const next = [...localItems]; (next[idx] as any)[field] = val; updateItems(next) }

  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} placeholder="Optional" className={I} /></label>
      </div></details>
      <details open><summary className={S}>Items ({localItems.length})</summary><div className="flex flex-col gap-2 pb-3">
        {localItems.map((item, i) => (
          <div key={i} className="rounded-md border border-border/50 bg-muted/20 p-2">
            <div className="mb-1.5 flex justify-between"><span className="text-[10px] font-semibold text-muted-foreground">#{i + 1}</span><button onClick={() => updateItems(localItems.filter((_, j) => j !== i))} className="text-[10px] text-red-500">Remove</button></div>
            <div className="grid grid-cols-[48px_1fr] gap-1.5">
              <input value={item.icon} onChange={(e) => updateItem(i, "icon", e.target.value)} className={`${I} text-center`} />
              <input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="Title" className={I} />
            </div>
            <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Description" className={`${I} mt-1.5 w-full`} />
          </div>
        ))}
        <button onClick={() => updateItems([...localItems, { icon: "✨", title: "New Signal", description: "Description" }])} className="rounded border border-dashed border-border/50 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40">+ Add Item</button>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Variant<select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={I}><option value="icons">Icons (centered)</option><option value="badges">Badges</option><option value="minimal">Minimal (inline)</option></select></label>
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
        <label className={F}>Alignment<select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={I}><option value="center">Center</option><option value="left">Left</option></select></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
        <label className={F}>Accent<input type="color" value={props.accentColor} onChange={(e) => set("accentColor", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

TrustSignalsBlock.craft = {
  displayName: "Trust Signals",
  props: { _v: 1, heading: "", items: JSON.stringify(defaultItems), columns: 4, variant: "icons", backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#3b82f6", paddingTop: 32, paddingBottom: 32, alignment: "center" },
  rules: { canMoveIn: () => false },
  related: { settings: TrustSignalsSettings },
}
