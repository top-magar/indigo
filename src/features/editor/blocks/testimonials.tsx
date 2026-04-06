"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { useResponsiveStyles } from "../use-responsive"
import { useState } from "react"
import { craftRef } from "../craft-ref"
import { Section, TextField, ColorField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface TestimonialItem { quote: string; author: string; role: string; rating: number; avatarUrl: string }

interface TestimonialsProps {
  heading: string
  subheading: string
  items: string
  columns: 1 | 2 | 3
  variant: "cards" | "minimal" | "large-quote"
  showRating: boolean
  showAvatar: boolean
  cardStyle: "bordered" | "shadow" | "filled"
  backgroundColor: string
  cardBackgroundColor: string
  accentColor: string
  paddingTop: number
  paddingBottom: number
}

const defaultItems: TestimonialItem[] = [
  { quote: "Amazing quality and fast shipping!", author: "Sarah M.", role: "Verified Buyer", rating: 5, avatarUrl: "" },
  { quote: "Best purchase I've made this year.", author: "James K.", role: "Verified Buyer", rating: 5, avatarUrl: "" },
  { quote: "Great customer service and beautiful products.", author: "Emily R.", role: "Verified Buyer", rating: 4, avatarUrl: "" },
]

const stars = (n: number, color: string) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: i <= n ? color : "var(--store-placeholder-text, #d1d5db)", fontSize: 14 }}>★</span>
    ))}
  </div>
)

const parseItems = (s: string): TestimonialItem[] => { try { return JSON.parse(s) } catch { return defaultItems } }

const cardStyleMap = {
  bordered: (bg: string) => ({ backgroundColor: bg, border: "1px solid var(--store-border, #e5e7eb)", borderRadius: 12 }),
  shadow: (bg: string) => ({ backgroundColor: bg, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", borderRadius: 12 }),
  filled: (bg: string) => ({ backgroundColor: bg, borderRadius: 12 }),
}

const avatar = (url: string, name: string) => url
  ? <img src={url} alt={name} style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }} />
  : <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "var(--store-placeholder-bg, #e5e7eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "var(--store-secondary, #6b7280)" }}>{name.charAt(0)}</div>

export const TestimonialsBlock = (props: TestimonialsProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, subheading, items, columns, variant, showRating, showAvatar, cardStyle, backgroundColor, cardBackgroundColor, accentColor, paddingTop, paddingBottom } = props
  const { columns: rCols } = useResponsiveStyles()
  const parsed = parseItems(items)

  if (variant === "large-quote") {
    const t = parsed[0]
    if (!t) return <div ref={craftRef(connect, drag)} style={{ padding: 48, backgroundColor, textAlign: "center" }}>No testimonials</div>
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 28, fontWeight: 700, margin: "0 0 32px" }}>{heading}</h2>}
          <div style={{ fontSize: 48, lineHeight: 1, color: accentColor, marginBottom: 8 }}>"</div>
          <p style={{ fontSize: 22, lineHeight: 1.6, fontStyle: "italic", color: "var(--store-text, #374151)" }}>{t.quote}</p>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            {showAvatar && avatar(t.avatarUrl, t.author)}
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{t.author}</div>
              {t.role && <div style={{ fontSize: 13, color: "var(--store-secondary, #9ca3af)" }}>{t.role}</div>}
            </div>
          </div>
          {showRating && <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>{stars(t.rating, accentColor)}</div>}
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>{heading}</h2>}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {parsed.map((t, i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: i < parsed.length - 1 ? "1px solid var(--store-border, #e5e7eb)" : undefined }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--store-text, #374151)", margin: 0 }}>"{t.quote}"</p>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  {showRating && stars(t.rating, accentColor)}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>— {t.author}</span>
                  {t.role && <span style={{ fontSize: 12, color: "var(--store-secondary, #9ca3af)" }}>{t.role}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // cards variant
  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 28, fontWeight: 700, textAlign: "center", margin: 0 }}>{heading}</h2>}
        {subheading && <p style={{ fontSize: 16, color: "var(--store-secondary, #6b7280)", textAlign: "center", marginTop: 8 }}>{subheading}</p>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${rCols(columns)}, 1fr)`, gap: 24, marginTop: 32 }}>
          {parsed.map((t, i) => (
            <div key={i} style={{ padding: 24, ...cardStyleMap[cardStyle](cardBackgroundColor) }}>
              {showRating && stars(t.rating, accentColor)}
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "12px 0 16px", color: "var(--store-text, #374151)" }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {showAvatar && avatar(t.avatarUrl, t.author)}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.author}</div>
                  {t.role && <div style={{ fontSize: 12, color: "var(--store-secondary, #9ca3af)" }}>{t.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const inputClass = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const TestimonialsSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TestimonialsProps }))
  if (!props) return null
  const set = <K extends keyof TestimonialsProps>(key: K, val: TestimonialsProps[K]) => setProp((p: TestimonialsProps) => { (p as any)[key] = val })

  const [localItems, setLocalItems] = useState<TestimonialItem[]>(() => parseItems(props.items))

  const updateItems = (newItems: TestimonialItem[]) => {
    setLocalItems(newItems)
    setProp((p: TestimonialsProps) => { p.items = JSON.stringify(newItems) })
  }

  const updateItem = (idx: number, field: keyof TestimonialItem, val: any) => {
    const next = [...localItems]
    ;(next[idx] as any)[field] = val
    updateItems(next)
  }

  const addItem = () => updateItems([...localItems, { quote: "New testimonial", author: "Name", role: "", rating: 5, avatarUrl: "" }])
  const removeItem = (idx: number) => updateItems(localItems.filter((_, i) => i !== idx))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
            <Section title="Content">
                  <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
                  <TextField label="Subheading" value={props.subheading} onChange={(v) => set("subheading", v)} />
      </Section>

            <Section title="Testimonials ({localItems.length})">
          {localItems.map((item, i) => (
            <div key={i} className="rounded-md border border-border/50 bg-muted/20 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground">#{i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
              </div>
              <textarea value={item.quote} onChange={(e) => updateItem(i, "quote", e.target.value)} placeholder="Quote" className={`${inputClass} w-full`} rows={2} />
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <input value={item.author} onChange={(e) => updateItem(i, "author", e.target.value)} placeholder="Author" className={inputClass} />
                <input value={item.role} onChange={(e) => updateItem(i, "role", e.target.value)} placeholder="Role" className={inputClass} />
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <select value={item.rating} onChange={(e) => updateItem(i, "rating", +e.target.value)} className={inputClass}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>)}
                </select>
                <input value={item.avatarUrl} onChange={(e) => updateItem(i, "avatarUrl", e.target.value)} placeholder="Avatar URL" className={inputClass} />
              </div>
            </div>
          ))}
          <button onClick={addItem} className="rounded border border-dashed border-border/50 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
            + Add Testimonial
          </button>
      </Section>

            <Section title="Layout">
                  <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "cards", label: "Cards" }, { value: "minimal", label: "Minimal" }, { value: "large-quote", label: "Large Quote" }]} />
          <label className={fieldClass}>Columns
            <select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={inputClass}>
              <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
                    <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                    <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
          </div>
      </Section>

            <Section title="Style">
                  <SegmentedControl label="Card Style" value={props.cardStyle} onChange={(v) => set("cardStyle", v as any)} options={[{ value: "bordered", label: "Bordered" }, { value: "shadow", label: "Shadow" }, { value: "filled", label: "Filled" }]} />
          <div className="grid grid-cols-2 gap-2">
                    <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
                    <ColorField label="Card BG" value={props.cardBackgroundColor} onChange={(v) => set("cardBackgroundColor", v)} />
          </div>
                  <ColorField label="Star Color" value={props.accentColor} onChange={(v) => set("accentColor", v)} />
                  <ToggleField label="Show Rating" checked={props.showRating} onChange={(v) => set("showRating", v)} />
                  <ToggleField label="Show Avatar" checked={props.showAvatar} onChange={(v) => set("showAvatar", v)} />
      </Section>
          <UniversalStyleControls skip={["spacing"]} />
    </div>
  )
}

TestimonialsBlock.craft = {
  displayName: "Testimonials",
  props: {
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
    _v: 1, heading: "What Our Customers Say", subheading: "",
    items: JSON.stringify(defaultItems), columns: 3, variant: "cards",
    showRating: true, showAvatar: true, cardStyle: "bordered",
    backgroundColor: "", cardBackgroundColor: "#ffffff",
    accentColor: "#f59e0b", paddingTop: 48, paddingBottom: 48,
  },
  rules: { canMoveIn: () => false },
  related: { settings: TestimonialsSettings },
}
