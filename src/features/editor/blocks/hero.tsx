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
  backgroundImage: string
  backgroundColor: string
  textColor: string
  overlayOpacity: number
  minHeight: number
}

export const HeroBlock = ({
  variant, heading, subheading, ctaText, ctaHref,
  backgroundImage, backgroundColor, textColor, overlayOpacity, minHeight,
}: HeroProps) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((n) => ({ isSelected: n.events.selected }))

  if (variant === "split") {
    return (
      <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight, backgroundColor }}>
        <div style={{ padding: 48, display: "flex", flexDirection: "column", justifyContent: "center", color: textColor }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{heading}</h1>
          <p style={{ fontSize: 18, marginTop: 16, opacity: 0.8 }}>{subheading}</p>
          {ctaText && (
            <button style={{ marginTop: 24, padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: textColor, color: backgroundColor, border: "none", borderRadius: 8, cursor: "pointer", alignSelf: "flex-start" }}>
              {ctaText}
            </button>
          )}
        </div>
        <div style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: backgroundImage ? undefined : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9ca3af", fontSize: 14,
        }}>
          {!backgroundImage && "Add image URL →"}
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div ref={craftRef(connect, drag)} style={{ padding: "64px 48px", textAlign: "center", backgroundColor, color: textColor, minHeight }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{heading}</h1>
        <p style={{ fontSize: 20, marginTop: 16, opacity: 0.8, maxWidth: 600, marginInline: "auto" }}>{subheading}</p>
        {ctaText && (
          <button style={{ marginTop: 32, padding: "14px 40px", fontSize: 16, fontWeight: 600, backgroundColor: textColor, color: backgroundColor, border: "none", borderRadius: 8, cursor: "pointer" }}>
            {ctaText}
          </button>
        )}
      </div>
    )
  }

  // full variant (default)
  return (
    <div ref={craftRef(connect, drag)} style={{
      position: "relative", minHeight,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: "cover", backgroundPosition: "center", backgroundColor,
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
    }}>
      {backgroundImage && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }} />
      )}
      <div style={{ position: "relative", zIndex: 1, padding: 48, color: textColor }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{heading}</h1>
        <p style={{ fontSize: 20, marginTop: 16, opacity: 0.9, maxWidth: 600, marginInline: "auto" }}>{subheading}</p>
        {ctaText && (
          <button style={{ marginTop: 32, padding: "14px 40px", fontSize: 16, fontWeight: 600, backgroundColor: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer" }}>
            {ctaText}
          </button>
        )}
      </div>
    </div>
  )
}

const HeroSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as HeroProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Variant
        <select
          value={props.variant}
          onChange={(e) => setProp((p: HeroProps) => (p.variant = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="full">Full Width</option>
          <option value="split">Split (Text + Image)</option>
          <option value="minimal">Minimal</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Heading
        <input
          type="text"
          value={props.heading}
          onChange={(e) => setProp((p: HeroProps) => (p.heading = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Subheading
        <textarea
          value={props.subheading}
          onChange={(e) => setProp((p: HeroProps) => (p.subheading = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          rows={2}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        CTA Text
        <input
          type="text"
          value={props.ctaText}
          onChange={(e) => setProp((p: HeroProps) => (p.ctaText = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        CTA Link
        <input
          type="text"
          value={props.ctaHref}
          onChange={(e) => setProp((p: HeroProps) => (p.ctaHref = e.target.value))}
          placeholder="/products"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <ImagePickerField label="Background Image" value={props.backgroundImage} onChange={(url) => setProp((p: HeroProps) => (p.backgroundImage = url))} />
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background Color
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((p: HeroProps) => (p.backgroundColor = e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text Color
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((p: HeroProps) => (p.textColor = e.target.value))}
        />
      </label>
      {props.variant === "full" && (
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Overlay Opacity ({props.overlayOpacity}%)
          <input
            type="range"
            min={0}
            max={90}
            value={props.overlayOpacity}
            onChange={(e) => setProp((p: HeroProps) => (p.overlayOpacity = +e.target.value))}
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Min Height ({props.minHeight}px)
        <input
          type="range"
          min={200}
          max={800}
          value={props.minHeight}
          onChange={(e) => setProp((p: HeroProps) => (p.minHeight = +e.target.value))}
        />
      </label>
    </div>
  )
}

HeroBlock.craft = {
  displayName: "Hero",
  props: { _v: 1,
    variant: "full",
    heading: "Welcome to our store",
    subheading: "Discover amazing products crafted just for you",
    ctaText: "Shop Now",
    ctaHref: "/products",
    backgroundImage: "",
    backgroundColor: "#1a1a2e",
    textColor: "#ffffff",
    overlayOpacity: 40,
    minHeight: 500,
  },
  related: { settings: HeroSettings },
}
