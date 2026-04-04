"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface ImageWithTextProps {
  _v: number
  image: string
  heading: string
  text: string
  ctaText: string
  ctaHref: string
  imagePosition: "left" | "right"
  backgroundColor: string
  textColor: string
  imageRatio: "1:1" | "4:3" | "3:4" | "16:9"
  padding: number
  gap: number
  verticalAlign: "top" | "center" | "bottom"
}

export const ImageWithTextBlock = (props: ImageWithTextProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { image, heading, text, ctaText, ctaHref, imagePosition, backgroundColor, textColor, imageRatio, padding, gap, verticalAlign } = props

  const ratioMap: Record<string, string> = { "1:1": "1/1", "4:3": "4/3", "3:4": "3/4", "16:9": "16/9" }
  const alignMap: Record<string, string> = { top: "flex-start", center: "center", bottom: "flex-end" }

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap,
        padding,
        backgroundColor,
        color: textColor,
        alignItems: alignMap[verticalAlign],
      }}
    >
      {/* Image */}
      <div style={{ order: imagePosition === "right" ? 2 : 1 }}>
        <div style={{ aspectRatio: ratioMap[imageRatio], overflow: "hidden", borderRadius: "var(--store-radius, 8px)", backgroundColor: "#e5e7eb" }}>
          {image ? (
            <img src={image} alt={heading} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
              Add image →
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div style={{ order: imagePosition === "right" ? 1 : 2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.2, fontFamily: "var(--store-font-heading)" }}>{heading}</h2>
        <p style={{ fontSize: 16, marginTop: 16, opacity: 0.8, lineHeight: 1.6 }}>{text}</p>
        {ctaText && (
          <div style={{ marginTop: 24 }}>
            <button style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: "var(--store-radius, 8px)", backgroundColor: textColor, color: backgroundColor || "#fff", border: "none", cursor: "pointer" }}>
              {ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ImageWithTextSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ImageWithTextProps }))
  if (!props) return null
  const set = <K extends keyof ImageWithTextProps>(k: K, v: ImageWithTextProps[K]) => setProp((p: ImageWithTextProps) => { (p as unknown as Record<string, unknown>)[k] = v })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
        <ImagePickerField label="Image" value={props.image} onChange={(v) => set("image", v)} />
        <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
        <TextAreaField label="Text" value={props.text} onChange={(v) => set("text", v)} />
        <TextField label="Button Text" value={props.ctaText} onChange={(v) => set("ctaText", v)} />
        <TextField label="Button Link" value={props.ctaHref} onChange={(v) => set("ctaHref", v)} />
      </Section>
      <Section title="Layout">
        <SegmentedControl label="Image Position" value={props.imagePosition} onChange={(v) => set("imagePosition", v as "left" | "right")} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
        <SegmentedControl label="Image Ratio" value={props.imageRatio} onChange={(v) => set("imageRatio", v as ImageWithTextProps["imageRatio"])} options={[{ value: "1:1", label: "Square" }, { value: "4:3", label: "Landscape" }, { value: "3:4", label: "Portrait" }, { value: "16:9", label: "Wide" }]} />
        <SegmentedControl label="Vertical Align" value={props.verticalAlign} onChange={(v) => set("verticalAlign", v as "top" | "center" | "bottom")} options={[{ value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }]} />
        <SliderField label="Padding" value={props.padding} onChange={(v) => set("padding", v)} min={0} max={80} />
        <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={0} max={80} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

ImageWithTextBlock.craft = {
  displayName: "Image with Text",
  props: { _v: 1, image: "", heading: "Your Heading", text: "Add a description here to tell your story.", ctaText: "Learn More", ctaHref: "#", imagePosition: "left", backgroundColor: "#ffffff", textColor: "#000000", imageRatio: "1:1", padding: 48, gap: 32, verticalAlign: "center" } as ImageWithTextProps,
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: ImageWithTextSettings },
}
