"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface TrustSignalsProps {
  items: string // JSON array: [{icon, title, description}]
  columns: 3 | 4
  backgroundColor: string
}

const defaultItems = JSON.stringify([
  { icon: "🚚", title: "Free Shipping", description: "On orders over $50" },
  { icon: "🔒", title: "Secure Payment", description: "256-bit SSL encryption" },
  { icon: "↩️", title: "Easy Returns", description: "30-day return policy" },
  { icon: "💬", title: "24/7 Support", description: "We're here to help" },
])

export const TrustSignalsBlock = ({ items, columns, backgroundColor }: TrustSignalsProps) => {
  const { connectors: { connect, drag } } = useNode()
  let parsed: any[] = []
  try { parsed = JSON.parse(items) } catch {}

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: "32px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24, maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        {parsed.map((item, i) => (
          <div key={i} style={{ padding: 16 }}>
            <div style={{ fontSize: 32 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TrustSignalsSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TrustSignalsProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Columns
        <select value={props.columns} onChange={(e) => setProp((p: TrustSignalsProps) => (p.columns = +e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value={3}>3</option><option value={4}>4</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Items (JSON)
        <textarea value={props.items} onChange={(e) => setProp((p: TrustSignalsProps) => (p.items = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono" rows={8} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: TrustSignalsProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

TrustSignalsBlock.craft = {
  displayName: "Trust Signals",
  props: { items: defaultItems, columns: 4, backgroundColor: "#ffffff" } satisfies TrustSignalsProps,
  related: { settings: TrustSignalsSettings },
}
