"use client"

import { useNode } from "@craftjs/core"
import { useState } from "react"
import { craftRef } from "../craft-ref"

interface FaqProps {
  heading: string
  items: string // JSON array: [{question, answer}]
  backgroundColor: string
}

const defaultItems = JSON.stringify([
  { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items. Items must be in original condition." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available at checkout." },
  { question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide. Shipping rates vary by destination." },
])

export const FaqBlock = ({ heading, items, backgroundColor }: FaqProps) => {
  const { connectors: { connect, drag } } = useNode()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  let parsed: any[] = []
  try { parsed = JSON.parse(items) } catch {}

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: "48px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>{heading}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {parsed.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 500, textAlign: "left" }}
              >
                {item.question}
                <span style={{ fontSize: 20, color: "#9ca3af", transform: openIndex === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </button>
              {openIndex === i && (
                <div style={{ padding: "0 0 16px", fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FaqSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as FaqProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Heading
        <input type="text" value={props.heading} onChange={(e) => setProp((p: FaqProps) => (p.heading = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        FAQ Items (JSON)
        <textarea value={props.items} onChange={(e) => setProp((p: FaqProps) => (p.items = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono" rows={8} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: FaqProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

FaqBlock.craft = {
  displayName: "FAQ",
  props: { _v: 1, heading: "Frequently Asked Questions", items: defaultItems, backgroundColor: "#ffffff" },
  related: { settings: FaqSettings },
}
