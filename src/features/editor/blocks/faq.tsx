"use client"
import { useNode } from "@craftjs/core"
import { useState } from "react"
import { craftRef } from "../craft-ref"

interface FaqItem { question: string; answer: string }
interface FaqProps {
  heading: string; subheading: string; items: string
  variant: "accordion" | "two-column" | "cards"
  backgroundColor: string; textColor: string; accentColor: string
  paddingTop: number; paddingBottom: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const defaultItems: FaqItem[] = [
  { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within Nepal." },
  { question: "Do you offer international shipping?", answer: "Currently we only ship within Nepal." },
]
const parse = (s: string): FaqItem[] => { try { return JSON.parse(s) } catch { return defaultItems } }

export const FaqBlock = (props: FaqProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, subheading, items, variant, backgroundColor, textColor, accentColor, paddingTop, paddingBottom } = props
  const parsed = parse(items)
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  if (variant === "cards") {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>}
          {subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32, textAlign: "left" }}>
            {parsed.map((item, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{item.question}</h4>
                <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "two-column") {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>
          <div>{heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>}{subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {parsed.map((item, i) => (
              <div key={i} style={{ padding: "20px 0", borderBottom: "1px solid #e5e7eb" }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{item.question}</h4>
                <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // accordion
  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 8px" }}>{heading}</h2>}
        {subheading && <p style={{ fontSize: 16, opacity: 0.7, textAlign: "center", marginBottom: 32 }}>{subheading}</p>}
        {parsed.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: textColor, fontSize: 15, fontWeight: 600, textAlign: "left" }}>
              {item.question}<span style={{ color: accentColor, fontSize: 20 }}>{openIdx === i ? "−" : "+"}</span>
            </button>
            {openIdx === i && <p style={{ fontSize: 14, color: "#6b7280", padding: "0 0 16px", lineHeight: 1.6, margin: 0 }}>{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

const FaqSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as FaqProps }))
  const set = <K extends keyof FaqProps>(k: K, v: FaqProps[K]) => setProp((p: FaqProps) => { (p as any)[k] = v })
  const [localItems, setLocalItems] = useState<FaqItem[]>(() => parse(props.items))
  const updateItems = (n: FaqItem[]) => { setLocalItems(n); setProp((p: FaqProps) => { p.items = JSON.stringify(n) }) }
  const updateItem = (idx: number, field: keyof FaqItem, val: string) => { const next = [...localItems]; (next[idx] as any)[field] = val; updateItems(next) }

  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} className={I} /></label>
        <label className={F}>Subheading<input type="text" value={props.subheading} onChange={(e) => set("subheading", e.target.value)} className={I} /></label>
      </div></details>
      <details open><summary className={S}>Questions ({localItems.length})</summary><div className="flex flex-col gap-2.5 pb-3">
        {localItems.map((item, i) => (
          <div key={i} className="rounded-md border border-border/50 bg-muted/20 p-2">
            <div className="mb-1.5 flex justify-between"><span className="text-[10px] font-semibold text-muted-foreground">#{i + 1}</span><button onClick={() => updateItems(localItems.filter((_, j) => j !== i))} className="text-[10px] text-red-500">Remove</button></div>
            <input value={item.question} onChange={(e) => updateItem(i, "question", e.target.value)} placeholder="Question" className={`${I} w-full`} />
            <textarea value={item.answer} onChange={(e) => updateItem(i, "answer", e.target.value)} placeholder="Answer" className={`${I} mt-1.5 w-full`} rows={2} />
          </div>
        ))}
        <button onClick={() => updateItems([...localItems, { question: "New question?", answer: "Answer here." }])} className="rounded border border-dashed border-border/50 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40">+ Add Question</button>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Variant<select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={I}><option value="accordion">Accordion</option><option value="two-column">Two Column</option><option value="cards">Cards</option></select></label>
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

FaqBlock.craft = {
  displayName: "FAQ",
  props: { _v: 1, heading: "Frequently Asked Questions", subheading: "", items: JSON.stringify(defaultItems), variant: "accordion", backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#3b82f6", paddingTop: 48, paddingBottom: 48 },
  rules: { canMoveIn: () => false },
  related: { settings: FaqSettings },
}
