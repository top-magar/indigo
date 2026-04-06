"use client"

import { AlignCenter, AlignLeft } from "lucide-react"
import { useNodeOptional as useNode } from "../use-node-safe"
import { useState } from "react"
import { craftRef } from "../craft-ref"
import { Section, TextField, ColorField, SliderField, SegmentedControl } from "../components/editor-fields"
import { PaddingControl } from "../components/padding-control"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface TrustItem { icon: string; title: string; description: string }
interface TrustSignalsProps {
  heading: string; items: string; columns: 2 | 3 | 4
  variant: "icons" | "badges" | "minimal"
  backgroundColor: string; textColor: string; accentColor: string
  paddingTop: number; paddingBottom: number; alignment: "left" | "center"
}

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
    <div ref={craftRef(connect, drag)} style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px var(--store-section-gap-h, 24px) ${paddingBottom}px`, textAlign: alignment }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 24, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>}
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
  if (!props) return null
  const set = <K extends keyof TrustSignalsProps>(k: K, v: TrustSignalsProps[K]) => setProp((p: TrustSignalsProps) => { (p as any)[k] = v })
  const [localItems, setLocalItems] = useState<TrustItem[]>(() => parse(props.items))
  const updateItems = (n: TrustItem[]) => { setLocalItems(n); setProp((p: TrustSignalsProps) => { p.items = JSON.stringify(n) }) }
  const updateItem = (idx: number, field: keyof TrustItem, val: string) => { const next = [...localItems]; (next[idx] as any)[field] = val; updateItems(next) }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} placeholder="Optional" />
      </Section>
      <Section title="Items ({localItems.length})">
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
      </Section>
      <Section title="Layout">
                <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "icons", label: "Icons (centered)" }, { value: "badges", label: "Badges" }, { value: "minimal", label: "Minimal (inline)" }]} />
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
                <SegmentedControl label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "center", label: "Center", icon: AlignCenter, iconOnly: true }, { value: "left", label: "Left", icon: AlignLeft, iconOnly: true }]} />
        <div className="grid grid-cols-2 gap-2">
                  <PaddingControl top={props.paddingTop} bottom={props.paddingBottom} onTop={(v) => set("paddingTop", v)} onBottom={(v) => set("paddingBottom", v)} max={96} />
        </div>
      </Section>
      <Section title="Colors">
                <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
                <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
                <ColorField label="Accent" value={props.accentColor} onChange={(v) => set("accentColor", v)} />
      </Section>
          <UniversalStyleControls skip={["style", "spacing"]} />
    </div>
  )
}

TrustSignalsBlock.craft = {
  displayName: "Trust Signals",
  props: { _v: 1, heading: "", items: JSON.stringify(defaultItems), columns: 4, variant: "icons", backgroundColor: "", textColor: "", accentColor: "#3b82f6", paddingTop: 32, paddingBottom: 32, alignment: "center" },
    hideOnDesktop: false, _scrollEffect: "none", _shadow: "none", _opacity: 100, _blur: 0, _borderRadius: 0, _sticky: "none", hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: TrustSignalsSettings },
}
