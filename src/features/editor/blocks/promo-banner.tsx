"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface PromoBannerProps {
  text: string; ctaText: string; ctaHref: string
  backgroundColor: string; textColor: string; ctaColor: string; ctaTextColor: string
  variant: "bar" | "split" | "centered"
  size: "sm" | "md" | "lg"
  showDismiss: boolean; icon: "" | "🔥" | "🎉" | "⚡" | "🛍️"
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const padMap = { sm: "8px 16px", md: "12px 24px", lg: "20px 24px" }
const fsMap = { sm: 13, md: 15, lg: 18 }

export const PromoBannerBlock = (props: PromoBannerProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { text, ctaText, ctaHref, backgroundColor, textColor, ctaColor, ctaTextColor, variant, size, icon } = props
  const pad = padMap[size]; const fs = fsMap[size]
  const btnStyle: React.CSSProperties = { padding: "6px 16px", borderRadius: "var(--store-radius, 6px)", backgroundColor: ctaColor, color: ctaTextColor, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }

  if (variant === "centered") {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: pad, textAlign: "center" }}>
        <div style={{ fontSize: fs, fontWeight: 600 }}>{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{text}</div>
        {ctaText && <button style={{ ...btnStyle, marginTop: 8 }}>{ctaText}</button>}
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: pad, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: fs, fontWeight: 600 }}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{text}</span>
      {ctaText && <button style={btnStyle}>{ctaText}</button>}
          <UniversalStyleControls />
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
                <SelectField label="Icon" value={props.icon} onChange={(v) => set("icon", v as any)} options={[{ value: "🔥", label: "🔥 Fire" }, { value: "🎉", label: "🎉 Party" }, { value: "⚡", label: "⚡ Flash" }, { value: "🛍️", label: "🛍️ Shopping" }]} />
      </Section>
      <Section title="Layout">
                <SelectField label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "bar", label: "Bar" }, { value: "centered", label: "Centered" }]} />
                <SelectField label="Size" value={props.size} onChange={(v) => set("size", v as any)} options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
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
  props: { _v: 1, text: "Free shipping on orders over Rs. 2,000!", ctaText: "Shop Now", ctaHref: "/products", backgroundColor: "#1a1a2e", textColor: "#ffffff", ctaColor: "#ffffff", ctaTextColor: "#1a1a2e", variant: "bar", size: "md", showDismiss: false, icon: "🔥" },
  rules: { canMoveIn: () => false },
  related: { settings: PromoBannerSettings },
}
