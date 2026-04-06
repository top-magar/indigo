"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { Section, TextField, SliderField, SegmentedControl } from "../components/editor-fields"

interface CollageProps {
  _v: number
  layout: "left-large" | "right-large" | "top-large"
  image1: string
  image2: string
  image3: string
  caption1: string
  caption2: string
  caption3: string
  gap: number
  padding: number
  borderRadius: number
}

export const CollageBlock = (props: CollageProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { layout, image1, image2, image3, caption1, caption2, caption3, gap, padding, borderRadius } = props

  const imgStyle = (src: string): React.CSSProperties => ({
    width: "100%", height: "100%", objectFit: "cover" as const, borderRadius,
  })

  const placeholder = (caption: string) => (
    <div style={{ width: "100%", height: "100%", backgroundColor: "var(--store-placeholder-bg, #e5e7eb)", borderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-placeholder-text, #9ca3af)", fontSize: 13 }}>
      {caption || "Add image"}
    </div>
  )

  const renderImage = (src: string, caption: string) => (
    <div style={{ position: "relative", overflow: "hidden", borderRadius, width: "100%", height: "100%" }}>
      {src ? <img src={src} alt={caption} style={imgStyle(src)} /> : placeholder(caption)}
      {caption && src && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.5))", color: "#fff", fontSize: 13, fontWeight: 500 }}>
          {caption}
        </div>
      )}
    </div>
  )

  const gridStyle: React.CSSProperties = layout === "top-large"
    ? { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "2fr 1fr", gap, padding }
    : { display: "grid", gridTemplateColumns: layout === "left-large" ? "2fr 1fr" : "1fr 2fr", gridTemplateRows: "1fr 1fr", gap, padding }

  if (layout === "top-large") {
    return (
      <div ref={craftRef(connect, drag)} style={gridStyle}>
        <div style={{ gridColumn: "1 / -1" }}>{renderImage(image1, caption1)}</div>
        <div>{renderImage(image2, caption2)}</div>
        <div>{renderImage(image3, caption3)}</div>
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={gridStyle}>
      <div style={{ gridRow: "1 / -1", order: layout === "right-large" ? 2 : 1 }}>{renderImage(image1, caption1)}</div>
      <div style={{ order: layout === "right-large" ? 1 : 2 }}>{renderImage(image2, caption2)}</div>
      <div style={{ order: layout === "right-large" ? 1 : 2 }}>{renderImage(image3, caption3)}</div>
    </div>
  )
}

const CollageSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as CollageProps }))
  if (!props) return null
  const set = <K extends keyof CollageProps>(k: K, v: CollageProps[K]) => setProp((p: CollageProps) => { (p as unknown as Record<string, unknown>)[k] = v })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Layout">
        <SegmentedControl label="Layout" value={props.layout} onChange={(v) => set("layout", v as CollageProps["layout"])} options={[{ value: "left-large", label: "Large Left" }, { value: "right-large", label: "Large Right" }, { value: "top-large", label: "Large Top" }]} />
        <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={0} max={24}  step={4} />
        <SliderField label="Padding" value={props.padding} onChange={(v) => set("padding", v)} min={0} max={80}  step={4} />
        <SliderField label="Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={24} />
      </Section>
      <Section title="Image 1 (Large)">
        <ImagePickerField label="Image" value={props.image1} onChange={(v) => set("image1", v)} />
        <TextField label="Caption" value={props.caption1} onChange={(v) => set("caption1", v)} />
      </Section>
      <Section title="Image 2">
        <ImagePickerField label="Image" value={props.image2} onChange={(v) => set("image2", v)} />
        <TextField label="Caption" value={props.caption2} onChange={(v) => set("caption2", v)} />
      </Section>
      <Section title="Image 3">
        <ImagePickerField label="Image" value={props.image3} onChange={(v) => set("image3", v)} />
        <TextField label="Caption" value={props.caption3} onChange={(v) => set("caption3", v)} />
      </Section>
    </div>
  )
}

CollageBlock.craft = {
  displayName: "Collage",
  props: { _v: 1, layout: "left-large", image1: "", image2: "", image3: "", caption1: "", caption2: "", caption3: "", gap: 8, padding: 0, borderRadius: 8 } as CollageProps,
  rules: { canMoveIn: () => false },
  related: { settings: CollageSettings },
}
