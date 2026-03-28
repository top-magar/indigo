"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface TestimonialsProps {
  heading: string
  items: string // JSON array: [{quote, author, role, rating}]
  columns: 2 | 3
  backgroundColor: string
}

const defaultItems = JSON.stringify([
  { quote: "Amazing quality and fast shipping!", author: "Sarah M.", role: "Verified Buyer", rating: 5 },
  { quote: "Best purchase I've made this year.", author: "James K.", role: "Verified Buyer", rating: 5 },
  { quote: "Great customer service and beautiful products.", author: "Emily R.", role: "Verified Buyer", rating: 4 },
])

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n)

export const TestimonialsBlock = ({ heading, items, columns, backgroundColor }: TestimonialsProps) => {
  const { connectors: { connect, drag } } = useNode()
  let parsed: any[] = []
  try { parsed = JSON.parse(items) } catch {}

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: "48px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>{heading}</h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24 }}>
          {parsed.map((t, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 12, backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
              <div style={{ color: "#f59e0b", fontSize: 16, letterSpacing: 2 }}>{stars(t.rating || 5)}</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "12px 0 16px", color: "#374151" }}>"{t.quote}"</p>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.author}</div>
              {t.role && <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TestimonialsSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TestimonialsProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Heading
        <input type="text" value={props.heading} onChange={(e) => setProp((p: TestimonialsProps) => (p.heading = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Columns
        <select value={props.columns} onChange={(e) => setProp((p: TestimonialsProps) => (p.columns = +e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value={2}>2</option><option value={3}>3</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Testimonials (JSON)
        <textarea value={props.items} onChange={(e) => setProp((p: TestimonialsProps) => (p.items = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono" rows={8} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: TestimonialsProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

TestimonialsBlock.craft = {
  displayName: "Testimonials",
  props: { _v: 1, heading: "What Our Customers Say", items: defaultItems, columns: 3, backgroundColor: "#f9fafb" },
  related: { settings: TestimonialsSettings },
}
