"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { useResponsiveStyles } from "../use-responsive"
import { InlineEdit } from "../components/inline-edit"
import { Section, TextField, TextAreaField, ColorField, SliderField, SegmentedControl, ToggleField, ImageField, Row } from "../components/editor-fields"
import { PaddingControl } from "../components/padding-control"

import { UniversalStyleControls } from "../components/universal-style-controls"
import { AlignCenter, AlignCenterVertical, AlignEndVertical, AlignLeft, AlignRight, AlignStartVertical, RectangleHorizontal, SquareDashed } from "lucide-react"

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

const ctaBtnStyle = (style: string, bg: string, color: string, radius: string) =>
  style === "outline"
    ? { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: "transparent", color: bg, border: `2px solid ${bg}`, borderRadius: radius, cursor: "pointer" }
    : { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: bg, color, border: "none", borderRadius: radius, cursor: "pointer" }

export const HeroBlock = (props: HeroProps) => {
  const { connectors: { connect, drag }, isSelected, actions: { setProp } } = useNode((n) => ({ isSelected: n.events.selected }))
  const { scale, isMobile } = useResponsiveStyles()

  const {
    variant, heading, subheading, ctaText, ctaHref: _ctaHref, ctaStyle, ctaColor, ctaBackground,
    secondCtaText, backgroundImage, backgroundColor, backgroundPosition, textColor,
    overlayOpacity, minHeight, contentPosition, headingSize, subheadingSize,
    paddingTop, paddingBottom, contentMaxWidth, showBadge, badgeText,
  } = props
  const rHeadingSize = scale(headingSize)
  const rSubheadingSize = scale(subheadingSize)
  const rMinHeight = scale(minHeight)
  const rPaddingTop = scale(paddingTop)
  const rPaddingBottom = scale(paddingBottom)
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
      <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: rMinHeight, backgroundColor }}>
        <div style={{ padding: `${rPaddingTop}px ${isMobile ? 24 : 48}px ${rPaddingBottom}px`, display: "flex", flexDirection: "column", justifyContent: "center", color: textColor }}>
          {badge}
          <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: rHeadingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }} />
          <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: rSubheadingSize, marginTop: 16, opacity: 0.8 }} />
          {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
        </div>
        <div style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: "cover", backgroundPosition,
          backgroundColor: backgroundImage ? undefined : "var(--store-placeholder-bg, #e5e7eb)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-placeholder-text, #9ca3af)", fontSize: 14,
        }}>
          {!backgroundImage && "Add image →"}
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div ref={craftRef(connect, drag)} style={{ padding: `${rPaddingTop}px ${isMobile ? 24 : 48}px ${rPaddingBottom}px`, textAlign, backgroundColor, color: textColor, minHeight: rMinHeight, display: "flex", flexDirection: "column", alignItems: align, justifyContent: "center" }}>
        {badge}
        <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: rHeadingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, maxWidth: contentMaxWidth, fontFamily: "var(--store-font-heading)" }} />
        <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: rSubheadingSize, marginTop: 16, opacity: 0.8, maxWidth: contentMaxWidth }} />
        {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
      </div>
    )
  }

  // full variant
  return (
    <div ref={craftRef(connect, drag)} style={{
      position: "relative", minHeight: rMinHeight,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: "cover", backgroundPosition, backgroundColor,
      display: "flex", alignItems: align, justifyContent: "center", textAlign,
    }}>
      {backgroundImage && <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }} />}
      <div style={{ position: "relative", zIndex: 1, padding: `${rPaddingTop}px ${isMobile ? 24 : 48}px ${rPaddingBottom}px`, color: textColor, maxWidth: contentMaxWidth + 96, display: "flex", flexDirection: "column", alignItems: align }}>
        {badge}
        <InlineEdit tag="h1" value={heading} onChange={(v) => setProp((p: HeroProps) => { p.heading = v })} enabled={isSelected} style={{ fontSize: rHeadingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }} />
        <InlineEdit tag="p" value={subheading} onChange={(v) => setProp((p: HeroProps) => { p.subheading = v })} enabled={isSelected} style={{ fontSize: rSubheadingSize, marginTop: 16, opacity: 0.9, maxWidth: contentMaxWidth }} />
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
        <SegmentedControl label="Button Style" value={props.ctaStyle} onChange={(v) => set("ctaStyle", v as any)} options={[{ value: "solid", label: "Solid", icon: RectangleHorizontal, iconOnly: true }, { value: "outline", label: "Outline", icon: SquareDashed, iconOnly: true }]} />
        <Row>
          <ColorField label="Button BG" value={props.ctaBackground} onChange={(v) => set("ctaBackground", v)} />
          <ColorField label="Button Text" value={props.ctaColor} onChange={(v) => set("ctaColor", v)} />
        </Row>
        <TextField label="Secondary Text" value={props.secondCtaText} onChange={(v) => set("secondCtaText", v)} placeholder="Optional" />
        {props.secondCtaText && <TextField label="Secondary Link" value={props.secondCtaHref} onChange={(v) => set("secondCtaHref", v)} />}
      </Section>

      <Section title="Layout" defaultOpen={false}>
        <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "full", label: "Full" }, { value: "split", label: "Split" }, { value: "minimal", label: "Minimal" }]} />
        <SegmentedControl label="Content Position" value={props.contentPosition} onChange={(v) => set("contentPosition", v as any)} options={[{ value: "left", label: "Left", icon: AlignLeft, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenter, iconOnly: true }, { value: "right", label: "Right", icon: AlignRight, iconOnly: true }]} />
        <SliderField label="Min Height" value={props.minHeight} onChange={(v) => set("minHeight", v)} min={200} max={900} unit="px" />
        <PaddingControl top={props.paddingTop} bottom={props.paddingBottom} onTop={(v) => set("paddingTop", v)} onBottom={(v) => set("paddingBottom", v)} max={120} />
        <SliderField label="Content Max Width" value={props.contentMaxWidth} onChange={(v) => set("contentMaxWidth", v)} min={400} max={1000} unit="px" />
      </Section>

      <Section title="Background" defaultOpen={false}>
        <ImageField label="Image" value={props.backgroundImage} onChange={(v) => set("backgroundImage", v)} />
        <ColorField label="Color" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <SegmentedControl label="Image Position" value={props.backgroundPosition} onChange={(v) => set("backgroundPosition", v as any)} options={[{ value: "top", label: "Top", icon: AlignStartVertical, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenterVertical, iconOnly: true }, { value: "bottom", label: "Bottom", icon: AlignEndVertical, iconOnly: true }]} />
        {props.variant === "full" && (
          <SliderField label="Overlay" value={props.overlayOpacity} onChange={(v) => set("overlayOpacity", v)} max={90} unit="%" />
        )}
      </Section>

      <Section title="Typography" defaultOpen={false}>
        <SliderField label="Heading Size" value={props.headingSize} onChange={(v) => set("headingSize", v)} min={24} max={80} unit="px" />
        <SliderField label="Subheading Size" value={props.subheadingSize} onChange={(v) => set("subheadingSize", v)} min={12} max={32} unit="px" />
        <ColorField label="Text Color" value={props.textColor} onChange={(v) => set("textColor", v)} />
      </Section>
      <UniversalStyleControls skip={["style", "spacing"]} />
    </div>
  )
}

HeroBlock.craft = {
  displayName: "Hero",
  props: {
    hideOnDesktop: false, _scrollEffect: "none", hideOnTablet: false, hideOnMobile: false,
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
