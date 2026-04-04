"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { InlineEdit } from "../components/inline-edit"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, Row } from "../components/editor-fields"

interface HeroProps {
  variant: "full" | "split" | "minimal"
  heading: string
  subheading: string
  ctaText: string
  ctaHref: string
  ctaStyle: "solid" | "outline"
  ctaColor: string
  ctaBackground: string
  secondCtaText: string
  secondCtaHref: string
  backgroundImage: string
  backgroundColor: string
  backgroundPosition: "center" | "top" | "bottom"
  textColor: string
  overlayOpacity: number
  minHeight: number
  contentPosition: "center" | "left" | "right"
  headingSize: number
  subheadingSize: number
  paddingTop: number
  paddingBottom: number
  contentMaxWidth: number
  showBadge: boolean
  badgeText: string
}

const summaryClass = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const inputClass = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const ctaBtnStyle = (style: string, bg: string, color: string, radius: string) =>
  style === "outline"
    ? { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: "transparent", color: bg, border: `2px solid ${bg}`, borderRadius: radius, cursor: "pointer" }
    : { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: bg, color, border: "none", borderRadius: radius, cursor: "pointer" }

export const HeroBlock = (props: HeroProps) => {
  const { connectors: { connect, drag }, isSelected, actions: { setProp } } = useNode((n) => ({ isSelected: n.events.selected }))
  const {
    variant, heading, subheading, ctaText, ctaHref, ctaStyle, ctaColor, ctaBackground,
    secondCtaText, backgroundImage, backgroundColor, backgroundPosition, textColor,
    overlayOpacity, minHeight, contentPosition, headingSize, subheadingSize,
    paddingTop, paddingBottom, contentMaxWidth, showBadge, badgeText,
  } = props
  const radius = "var(--store-radius, 8px)"
  const align = contentPosition === "left" ? "flex-start" : contentPosition === "right" ? "flex-end" : "center"
  const textAlign = contentPosition as any

  const badge = showBadge && badgeText ? (
    <span style={{ display: "inline-block", padding: "4px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, backgroundColor: "var(--store-accent, #3b82f6)", color: "#fff", marginBottom: 16 }}>{badgeText}</span>
  ) : null

  const primaryBtn = ctaText ? (
    <button style={ctaBtnStyle(ctaStyle, ctaBackground, ctaColor, radius)}>{ctaText}</button>
  ) : null

  const secondaryBtn = secondCtaText ? (
    <button style={{ ...ctaBtnStyle("outline", ctaBackground, ctaColor, radius), marginLeft: 12 }}>{secondCtaText}</button>
  ) : null

  if (variant === "split") {
    return (
      <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight, backgroundColor }}>
        <div style={{ padding: `${paddingTop}px 48px ${paddingBottom}px`, display: "flex", flexDirection: "column", justifyContent: "center", color: textColor }}>
          {badge}
          <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }} />
          <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8 }} />
          {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
        </div>
        <div style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: "cover", backgroundPosition,
          backgroundColor: backgroundImage ? undefined : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14,
        }}>
          {!backgroundImage && "Add image →"}
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div ref={craftRef(connect, drag)} style={{ padding: `${paddingTop}px 48px ${paddingBottom}px`, textAlign, backgroundColor, color: textColor, minHeight, display: "flex", flexDirection: "column", alignItems: align, justifyContent: "center" }}>
        {badge}
        <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, maxWidth: contentMaxWidth, fontFamily: "var(--store-font-heading)" }} />
        <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8, maxWidth: contentMaxWidth }} />
        {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
      </div>
    )
  }

  // full variant
  return (
    <div ref={craftRef(connect, drag)} style={{
      position: "relative", minHeight,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: "cover", backgroundPosition, backgroundColor,
      display: "flex", alignItems: align, justifyContent: "center", textAlign,
    }}>
      {backgroundImage && <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }} />}
      <div style={{ position: "relative", zIndex: 1, padding: `${paddingTop}px 48px ${paddingBottom}px`, color: textColor, maxWidth: contentMaxWidth + 96, display: "flex", flexDirection: "column", alignItems: align }}>
        {badge}
        <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }} />
        <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.9, maxWidth: contentMaxWidth }} />
        {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
      </div>
    </div>
  )
}

const HeroSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as HeroProps }))
  if (!props) return null
  const set = <K extends keyof HeroProps>(key: K, val: HeroProps[K]) => setProp((p: HeroProps) => { (p as any)[key] = val })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
        <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
        <TextAreaField label="Subheading" value={props.subheading} onChange={(v) => set("subheading", v)} />
        <ToggleField label="Show Badge" checked={props.showBadge} onChange={(v) => set("showBadge", v)} />
        {props.showBadge && <TextField label="Badge Text" value={props.badgeText} onChange={(v) => set("badgeText", v)} />}
      </Section>

      <Section title="Buttons">
        <TextField label="Primary Text" value={props.ctaText} onChange={(v) => set("ctaText", v)} />
        <TextField label="Primary Link" value={props.ctaHref} onChange={(v) => set("ctaHref", v)} placeholder="/products" />
        <SelectField label="Button Style" value={props.ctaStyle} onChange={(v) => set("ctaStyle", v as any)} options={[{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }]} />
        <Row>
          <ColorField label="Button BG" value={props.ctaBackground} onChange={(v) => set("ctaBackground", v)} />
          <ColorField label="Button Text" value={props.ctaColor} onChange={(v) => set("ctaColor", v)} />
        </Row>
        <TextField label="Secondary Text" value={props.secondCtaText} onChange={(v) => set("secondCtaText", v)} placeholder="Optional" />
        {props.secondCtaText && <TextField label="Secondary Link" value={props.secondCtaHref} onChange={(v) => set("secondCtaHref", v)} />}
      </Section>

      <Section title="Layout" defaultOpen={false}>
        <SelectField label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "full", label: "Full Width" }, { value: "split", label: "Split" }, { value: "minimal", label: "Minimal" }]} />
        <SelectField label="Content Position" value={props.contentPosition} onChange={(v) => set("contentPosition", v as any)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        <SliderField label="Min Height" value={props.minHeight} onChange={(v) => set("minHeight", v)} min={200} max={900} unit="px" />
        <Row>
          <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} max={120} unit="px" />
          <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} max={120} unit="px" />
        </Row>
        <SliderField label="Content Max Width" value={props.contentMaxWidth} onChange={(v) => set("contentMaxWidth", v)} min={400} max={1000} unit="px" />
      </Section>

      <Section title="Background" defaultOpen={false}>
        <ImageField label="Image" value={props.backgroundImage} onChange={(v) => set("backgroundImage", v)} />
        <ColorField label="Color" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <SelectField label="Image Position" value={props.backgroundPosition} onChange={(v) => set("backgroundPosition", v as any)} options={[{ value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }]} />
        {props.variant === "full" && (
          <SliderField label="Overlay" value={props.overlayOpacity} onChange={(v) => set("overlayOpacity", v)} max={90} unit="%" />
        )}
      </Section>

      <Section title="Typography" defaultOpen={false}>
        <SliderField label="Heading Size" value={props.headingSize} onChange={(v) => set("headingSize", v)} min={24} max={80} unit="px" />
        <SliderField label="Subheading Size" value={props.subheadingSize} onChange={(v) => set("subheadingSize", v)} min={12} max={32} unit="px" />
        <ColorField label="Text Color" value={props.textColor} onChange={(v) => set("textColor", v)} />
      </Section>
    </div>
  )
}

HeroBlock.craft = {
  displayName: "Hero",
  props: {
    _v: 1, variant: "full", heading: "Welcome to our store",
    subheading: "Discover amazing products crafted just for you",
    ctaText: "Shop Now", ctaHref: "/products", ctaStyle: "solid",
    ctaColor: "#ffffff", ctaBackground: "#000000",
    secondCtaText: "", secondCtaHref: "",
    backgroundImage: "", backgroundColor: "#1a1a2e",
    backgroundPosition: "center", textColor: "#ffffff",
    overlayOpacity: 40, minHeight: 500, contentPosition: "center",
    headingSize: 48, subheadingSize: 20, paddingTop: 64, paddingBottom: 64,
    contentMaxWidth: 600, showBadge: false, badgeText: "New",
  },
  rules: { canMoveIn: () => false },
  related: { settings: HeroSettings },
}
