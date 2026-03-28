"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"

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
  const { connectors: { connect, drag } } = useNode()
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
          <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }}>{heading}</h1>
          <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8 }}>{subheading}</p>
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
        <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, maxWidth: contentMaxWidth, fontFamily: "var(--store-font-heading)" }}>{heading}</h1>
        <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8, maxWidth: contentMaxWidth }}>{subheading}</p>
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
        <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }}>{heading}</h1>
        <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.9, maxWidth: contentMaxWidth }}>{subheading}</p>
        {(primaryBtn || secondaryBtn) && <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div>}
      </div>
    </div>
  )
}

const HeroSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as HeroProps }))
  const set = <K extends keyof HeroProps>(key: K, val: HeroProps[K]) => setProp((p: HeroProps) => { (p as any)[key] = val })

  return (
    <div className="flex flex-col gap-1 p-1">
      {/* Content */}
      <details open>
        <summary className={summaryClass}>Content</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} className={inputClass} /></label>
          <label className={fieldClass}>Subheading<textarea value={props.subheading} onChange={(e) => set("subheading", e.target.value)} className={inputClass} rows={2} /></label>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <input type="checkbox" checked={props.showBadge} onChange={(e) => set("showBadge", e.target.checked)} />Show Badge
          </label>
          {props.showBadge && <label className={fieldClass}>Badge Text<input type="text" value={props.badgeText} onChange={(e) => set("badgeText", e.target.value)} className={inputClass} /></label>}
        </div>
      </details>

      {/* Buttons */}
      <details open>
        <summary className={summaryClass}>Buttons</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Primary Text<input type="text" value={props.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={inputClass} /></label>
          <label className={fieldClass}>Primary Link<input type="text" value={props.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/products" className={inputClass} /></label>
          <label className={fieldClass}>Button Style
            <select value={props.ctaStyle} onChange={(e) => set("ctaStyle", e.target.value as any)} className={inputClass}>
              <option value="solid">Solid</option><option value="outline">Outline</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={fieldClass}>Button BG<input type="color" value={props.ctaBackground} onChange={(e) => set("ctaBackground", e.target.value)} /></label>
            <label className={fieldClass}>Button Text<input type="color" value={props.ctaColor} onChange={(e) => set("ctaColor", e.target.value)} /></label>
          </div>
          <label className={fieldClass}>Secondary Text<input type="text" value={props.secondCtaText} onChange={(e) => set("secondCtaText", e.target.value)} placeholder="Optional" className={inputClass} /></label>
          {props.secondCtaText && <label className={fieldClass}>Secondary Link<input type="text" value={props.secondCtaHref} onChange={(e) => set("secondCtaHref", e.target.value)} className={inputClass} /></label>}
        </div>
      </details>

      {/* Layout */}
      <details>
        <summary className={summaryClass}>Layout</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Variant
            <select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={inputClass}>
              <option value="full">Full Width</option><option value="split">Split</option><option value="minimal">Minimal</option>
            </select>
          </label>
          <label className={fieldClass}>Content Position
            <select value={props.contentPosition} onChange={(e) => set("contentPosition", e.target.value as any)} className={inputClass}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </label>
          <label className={fieldClass}>Min Height ({props.minHeight}px)<input type="range" min={200} max={900} value={props.minHeight} onChange={(e) => set("minHeight", +e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className={fieldClass}>Pad Top ({props.paddingTop})<input type="range" min={0} max={120} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
            <label className={fieldClass}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={120} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
          </div>
          <label className={fieldClass}>Content Max Width ({props.contentMaxWidth}px)<input type="range" min={400} max={1000} value={props.contentMaxWidth} onChange={(e) => set("contentMaxWidth", +e.target.value)} /></label>
        </div>
      </details>

      {/* Background */}
      <details>
        <summary className={summaryClass}>Background</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <ImagePickerField label="Image" value={props.backgroundImage} onChange={(url) => set("backgroundImage", url)} />
          <label className={fieldClass}>Color<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <label className={fieldClass}>Image Position
            <select value={props.backgroundPosition} onChange={(e) => set("backgroundPosition", e.target.value as any)} className={inputClass}>
              <option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option>
            </select>
          </label>
          {props.variant === "full" && (
            <label className={fieldClass}>Overlay ({props.overlayOpacity}%)<input type="range" min={0} max={90} value={props.overlayOpacity} onChange={(e) => set("overlayOpacity", +e.target.value)} /></label>
          )}
        </div>
      </details>

      {/* Typography */}
      <details>
        <summary className={summaryClass}>Typography</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Heading Size ({props.headingSize}px)<input type="range" min={24} max={80} value={props.headingSize} onChange={(e) => set("headingSize", +e.target.value)} /></label>
          <label className={fieldClass}>Subheading Size ({props.subheadingSize}px)<input type="range" min={12} max={32} value={props.subheadingSize} onChange={(e) => set("subheadingSize", +e.target.value)} /></label>
          <label className={fieldClass}>Text Color<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
        </div>
      </details>
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
