"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, SegmentedControl, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"

interface ImageBlockProps {
  src: string
  alt: string
  objectFit: "cover" | "contain" | "fill"
  borderRadius: number
  maxHeight: number
  width: "full" | "contained" | "auto"
  alignment: "left" | "center" | "right"
  shadow: "none" | "sm" | "md" | "lg"
  hoverEffect: "none" | "zoom" | "brighten"
  caption: string
  linkUrl: string
  aspectRatio: "" | "1/1" | "16/9" | "4/3" | "3/2"
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const shadowMap: Record<string, string> = { none: "none", sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 25px rgba(0,0,0,0.15)" }
const widthMap: Record<string, string> = { full: "100%", contained: "80%", auto: "auto" }
const hoverMap: Record<string, string> = { none: "", zoom: "transform: scale(1.03)", brighten: "filter: brightness(1.1)" }

export const ImageBlock = (props: ImageBlockProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { src, alt, objectFit, borderRadius, maxHeight, width, alignment, shadow, caption, aspectRatio } = props

  return (
    <div ref={craftRef(connect, drag)} style={{ textAlign: alignment }}>
      <div style={{ display: "inline-block", width: widthMap[width], maxWidth: "100%" }}>
        {src ? (
          <img src={src} alt={alt} style={{ width: "100%", maxHeight: maxHeight || undefined, objectFit, borderRadius, boxShadow: shadowMap[shadow], aspectRatio: aspectRatio || undefined, transition: "transform 0.3s, filter 0.3s" }} />
        ) : (
          <div style={{ height: 200, backgroundColor: "var(--store-placeholder-bg, #f3f4f6)", borderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-placeholder-text, #9ca3af)", fontSize: 14, aspectRatio: aspectRatio || undefined }}>Add image</div>
        )}
        {caption && <p style={{ fontSize: 13, color: "var(--store-secondary, #6b7280)", marginTop: 8, textAlign: "center" }}>{caption}</p>}
      </div>
    </div>
  )
}

const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ImageBlockProps }))
  if (!props) return null
  const set = <K extends keyof ImageBlockProps>(k: K, v: ImageBlockProps[K]) => setProp((p: ImageBlockProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Image">
        <ImagePickerField label="Source" value={props.src} onChange={(url) => set("src", url)} />
                <TextField label="Alt Text" value={props.alt} onChange={(v) => set("alt", v)} />
                <TextField label="Caption" value={props.caption} onChange={(v) => set("caption", v)} placeholder="Optional" />
                <TextField label="Link URL" value={props.linkUrl} onChange={(v) => set("linkUrl", v)} placeholder="Optional" />
      </Section>
      <Section title="Size & Fit">
                <SegmentedControl label="Width" value={props.width} onChange={(v) => set("width", v as any)} options={[{ value: "full", label: "Full" }, { value: "contained", label: "Contained (80%)" }, { value: "auto", label: "Auto" }]} />
                <SegmentedControl label="Aspect Ratio" value={props.aspectRatio} onChange={(v) => set("aspectRatio", v as any)} options={[{ value: "1/1", label: "Square" }, { value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "3/2", label: "3:2" }]} />
                <SegmentedControl label="Object Fit" value={props.objectFit} onChange={(v) => set("objectFit", v as any)} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }]} />
        <label className={F}>Max Height ({props.maxHeight || "none"})<input type="range" min={0} max={800} step={50} value={props.maxHeight} onChange={(e) => set("maxHeight", +e.target.value)} /></label>
                <SegmentedControl label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      </Section>
      <Section title="Style">
                <SliderField label="Corner Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={32} />
                <SegmentedControl label="Shadow" value={props.shadow} onChange={(v) => set("shadow", v as any)} options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
                <SegmentedControl label="Hover Effect" value={props.hoverEffect} onChange={(v) => set("hoverEffect", v as any)} options={[{ value: "none", label: "None" }, { value: "zoom", label: "Zoom" }, { value: "brighten", label: "Brighten" }]} />
      </Section>
    </div>
  )
}

ImageBlock.craft = {
  displayName: "Image",
  props: { _v: 1, src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400, width: "full", alignment: "center", shadow: "none", hoverEffect: "none", caption: "", linkUrl: "", aspectRatio: "" },
  rules: { canMoveIn: () => false },
  related: { settings: ImageSettings },
}
