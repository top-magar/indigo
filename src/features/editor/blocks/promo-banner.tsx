"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useNodeOptional as useNode } from "../hooks/use-node-safe"
import { craftRef } from "../lib/craft-ref"
import { Section, TextField, ColorField, SegmentedControl, ToggleField } from "../controls/editor-fields"
import { UniversalStyleControls } from "../controls/universal-style-controls"

interface PromoBannerProps {
  text: string; ctaText: string; ctaHref: string
  backgroundColor: string; textColor: string; ctaColor: string; ctaTextColor: string
  variant: "bar" | "split" | "centered"
  size: "sm" | "md" | "lg"
  showDismiss: boolean; sticky: boolean
  icon: "" | "🔥" | "🎉" | "⚡" | "🛍️"
  countdownDate: string
}

const padMap = { sm: "8px 16px", md: "12px 24px", lg: "20px 24px" }
const fsMap = { sm: 13, md: 15, lg: 18 }

function InlineCountdown({ target, color }: { target: string; color: string }) {
  const [left, setLeft] = useState("")
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setLeft("Expired"); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color, marginLeft: 8 }}>{left}</span>
}

export const PromoBannerBlock = (props: PromoBannerProps) => {
  const { connectors: { connect, drag } } = useNode()
  const [dismissed, setDismissed] = useState(false)
  const { text, ctaText, backgroundColor, textColor, ctaColor, ctaTextColor, variant, size, icon, showDismiss, sticky, countdownDate } = props
  const pad = padMap[size]; const fs = fsMap[size]
  const btnStyle: React.CSSProperties = { padding: "6px 16px", borderRadius: "var(--store-radius, 6px)", backgroundColor: ctaColor, color: ctaTextColor, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }

  const wrapStyle: React.CSSProperties = {
    backgroundColor, color: textColor,
    padding: dismissed ? 0 : pad,
    ...(sticky ? { position: "sticky" as const, top: 0, zIndex: 50 } : {}),
    ...(dismissed ? { maxHeight: 0, overflow: "hidden", opacity: 0 } : {}),
    transition: "all 0.3s ease",
  }

  const countdown = countdownDate ? <InlineCountdown target={countdownDate} color={ctaColor || "#fff"} /> : null

  const dismissBtn = showDismiss && !dismissed ? (
    <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: textColor, cursor: "pointer", padding: 4, opacity: 0.7, flexShrink: 0 }} aria-label="Dismiss">
      <X size={16} />
    </button>
  ) : null

  if (variant === "centered") {
    return (
      <div ref={craftRef(connect, drag)} style={{ ...wrapStyle, textAlign: "center" }}>
        <div style={{ fontSize: fs, fontWeight: 600 }}>{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{text}{countdown}</div>
        {ctaText && <button style={{ ...btnStyle, marginTop: 8 }}>{ctaText}</button>}
        {dismissBtn && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{dismissBtn}</div>}
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: fs, fontWeight: 600, flex: 1, textAlign: "center" }}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{text}{countdown}</span>
      {ctaText && <button style={btnStyle}>{ctaText}</button>}
      {dismissBtn}
    </div>
  )
}

const PromoBannerSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as PromoBannerProps }))
  if (!props) return null
  const set = <K extends keyof PromoBannerProps>(k: K, v: PromoBannerProps[K]) => setProp((p: PromoBannerProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
        <TextField label="Text" value={props.text} onChange={(v) => set("text", v)} />
        <TextField label="CTA Text" value={props.ctaText} onChange={(v) => set("ctaText", v)} />
        <TextField label="CTA Link" value={props.ctaHref} onChange={(v) => set("ctaHref", v)} />
        <SegmentedControl label="Icon" value={props.icon} onChange={(v) => set("icon", v as PromoBannerProps["icon"])} options={[{ value: "", label: "None" }, { value: "🔥", label: "🔥" }, { value: "🎉", label: "🎉" }, { value: "⚡", label: "⚡" }, { value: "🛍️", label: "🛍️" }]} />
      </Section>
      <Section title="Behavior">
        <ToggleField label="Sticky (stays at top)" checked={props.sticky} onChange={(v) => set("sticky", v)} />
        <ToggleField label="Show dismiss (X)" checked={props.showDismiss} onChange={(v) => set("showDismiss", v)} />
        <TextField label="Countdown (optional)" value={props.countdownDate} onChange={(v) => set("countdownDate", v)} placeholder="2026-12-31T23:59:59" />
      </Section>
      <Section title="Layout">
        <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as PromoBannerProps["variant"])} options={[{ value: "bar", label: "Bar" }, { value: "centered", label: "Centered" }]} />
        <SegmentedControl label="Size" value={props.size} onChange={(v) => set("size", v as PromoBannerProps["size"])} options={[{ value: "sm", label: "S" }, { value: "md", label: "M" }, { value: "lg", label: "L" }]} />
      </Section>
      <Section title="Colors">
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
          <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
          <ColorField label="CTA BG" value={props.ctaColor} onChange={(v) => set("ctaColor", v)} />
          <ColorField label="CTA Text" value={props.ctaTextColor} onChange={(v) => set("ctaTextColor", v)} />
        </div>
      </Section>
      <UniversalStyleControls />
    </div>
  )
}

PromoBannerBlock.craft = {
  displayName: "Promo Banner",
  props: { _v: 2, text: "Free shipping on orders over Rs. 2,000!", ctaText: "Shop Now", ctaHref: "/products", backgroundColor: "#1a1a2e", textColor: "#ffffff", ctaColor: "#ffffff", ctaTextColor: "#1a1a2e", variant: "bar" as const, size: "md" as const, showDismiss: true, sticky: false, icon: "🔥" as const, countdownDate: "", hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  rules: { canMoveIn: () => false },
  related: { settings: PromoBannerSettings },
}
