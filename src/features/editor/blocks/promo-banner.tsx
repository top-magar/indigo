"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface PromoBannerProps {
  text: string
  ctaText: string
  ctaHref: string
  backgroundColor: string
  textColor: string
  size: "sm" | "md" | "lg"
}

const sizeStyles = {
  sm: { padding: "12px 24px", fontSize: 14 },
  md: { padding: "20px 24px", fontSize: 16 },
  lg: { padding: "32px 24px", fontSize: 18 },
}

export const PromoBannerBlock = ({ text, ctaText, ctaHref, backgroundColor, textColor, size }: PromoBannerProps) => {
  const { connectors: { connect, drag } } = useNode()
  const s = sizeStyles[size]

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, ...s, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
      <span style={{ fontWeight: 600 }}>{text}</span>
      {ctaText && (
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
          {ctaText}
        </a>
      )}
    </div>
  )
}

const PromoBannerSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as PromoBannerProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text
        <input type="text" value={props.text} onChange={(e) => setProp((p: PromoBannerProps) => (p.text = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        CTA Text
        <input type="text" value={props.ctaText} onChange={(e) => setProp((p: PromoBannerProps) => (p.ctaText = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        CTA Link
        <input type="text" value={props.ctaHref} onChange={(e) => setProp((p: PromoBannerProps) => (p.ctaHref = e.target.value))} placeholder="/sale" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Size
        <select value={props.size} onChange={(e) => setProp((p: PromoBannerProps) => (p.size = e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: PromoBannerProps) => (p.backgroundColor = e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text Color
        <input type="color" value={props.textColor} onChange={(e) => setProp((p: PromoBannerProps) => (p.textColor = e.target.value))} />
      </label>
    </div>
  )
}

PromoBannerBlock.craft = {
  displayName: "Promo Banner",
  props: { text: "🔥 Summer Sale — 20% off everything!", ctaText: "Shop Now", ctaHref: "/sale", backgroundColor: "#dc2626", textColor: "#ffffff", size: "md" } satisfies PromoBannerProps,
  related: { settings: PromoBannerSettings },
}
