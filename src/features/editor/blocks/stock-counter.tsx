"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, SliderField, ColorField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface StockCounterProps {
  stock: number
  message: string
  lowThreshold: number
  showBar: boolean
  maxStock: number
  variant: "badge" | "bar" | "text"
  urgencyColor: string
  textColor: string
  backgroundColor: string
}

export const StockCounterBlock = (props: StockCounterProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { stock, message, lowThreshold, showBar, maxStock, variant, urgencyColor, textColor, backgroundColor } = props
  const isLow = stock <= lowThreshold
  const pct = Math.min(100, Math.round((stock / Math.max(maxStock, 1)) * 100))
  const displayMsg = message.replace("{n}", String(stock))

  if (variant === "badge") {
    return (
      <div ref={craftRef(connect, drag)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, backgroundColor: backgroundColor || (isLow ? "#fef2f2" : "#f0fdf4"), color: textColor || (isLow ? urgencyColor : "#16a34a") }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isLow ? urgencyColor : "#22c55e", animation: isLow ? "pulse 1.5s infinite" : undefined }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{displayMsg}</span>
      </div>
    )
  }

  if (variant === "bar") {
    return (
      <div ref={craftRef(connect, drag)} style={{ padding: "12px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: textColor || (isLow ? urgencyColor : "#374151") }}>{displayMsg}</div>
        {showBar && (
          <div style={{ height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, backgroundColor: isLow ? urgencyColor : "#22c55e", transition: "width 0.5s ease" }} />
          </div>
        )}
      </div>
    )
  }

  // text variant
  return (
    <div ref={craftRef(connect, drag)} style={{ padding: "8px 0" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: textColor || (isLow ? urgencyColor : "#374151") }}>
        {isLow && "🔥 "}{displayMsg}
      </span>
    </div>
  )
}

const StockCounterSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as StockCounterProps }))
  if (!props) return null
  const set = <K extends keyof StockCounterProps>(k: K, v: StockCounterProps[K]) => setProp((p: StockCounterProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Stock">
        <SliderField label="Stock Count" value={props.stock} onChange={(v) => set("stock", v)} min={0} max={200} />
        <TextField label="Message" value={props.message} onChange={(v) => set("message", v)} placeholder="Only {n} left!" />
        <SliderField label="Low Stock Threshold" value={props.lowThreshold} onChange={(v) => set("lowThreshold", v)} min={1} max={50} />
        <SliderField label="Max Stock (for bar)" value={props.maxStock} onChange={(v) => set("maxStock", v)} min={1} max={500} />
        <ToggleField label="Show progress bar" checked={props.showBar} onChange={(v) => set("showBar", v)} />
      </Section>
      <Section title="Layout">
        <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as StockCounterProps["variant"])} options={[{ value: "badge", label: "Badge" }, { value: "bar", label: "Bar" }, { value: "text", label: "Text" }]} />
      </Section>
      <Section title="Colors">
        <ColorField label="Urgency Color" value={props.urgencyColor} onChange={(v) => set("urgencyColor", v)} />
        <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
        <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
      </Section>
      <UniversalStyleControls skip={["style"]} />
    </div>
  )
}

StockCounterBlock.craft = {
  displayName: "Stock Counter",
  props: { _v: 1, stock: 12, message: "Only {n} left in stock!", lowThreshold: 10, showBar: true, maxStock: 100, variant: "bar" as const, urgencyColor: "#ef4444", textColor: "", backgroundColor: "", hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  rules: { canMoveIn: () => false },
  related: { settings: StockCounterSettings },
}
