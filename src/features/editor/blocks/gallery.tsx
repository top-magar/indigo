"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { useState } from "react"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, SegmentedControl, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface GalleryProps {
  images: string; columns: 2 | 3 | 4; gap: number
  imageRatio: "square" | "portrait" | "landscape" | "auto"
  borderRadius: number; hoverEffect: "none" | "zoom" | "brighten"
  variant: "grid" | "masonry"; backgroundColor: string
  paddingTop: number; paddingBottom: number; heading: string
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const ratioMap: Record<string, string> = { square: "1/1", portrait: "3/4", landscape: "4/3", auto: "auto" }
const defaultImages = JSON.stringify([{ url: "", alt: "Image 1" }, { url: "", alt: "Image 2" }, { url: "", alt: "Image 3" }, { url: "", alt: "Image 4" }, { url: "", alt: "Image 5" }, { url: "", alt: "Image 6" }])
const parse = (s: string): { url: string; alt: string }[] => { try { return JSON.parse(s) } catch { return [] } }

export const GalleryBlock = (props: GalleryProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { images, columns, gap, imageRatio, borderRadius, backgroundColor, paddingTop, paddingBottom, heading } = props
  const parsed = parse(images)
  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 24, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {parsed.map((img, i) => (
            <div key={i} style={{ aspectRatio: ratioMap[imageRatio], borderRadius, overflow: "hidden", backgroundColor: "#f3f4f6" }}>
              {img.url ? <img src={img.url} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>{img.alt}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const GallerySettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as GalleryProps }))
  if (!props) return null
  const set = <K extends keyof GalleryProps>(k: K, v: GalleryProps[K]) => setProp((p: GalleryProps) => { (p as any)[k] = v })
  const [localImages, setLocalImages] = useState(() => parse(props.images))
  const updateImages = (n: { url: string; alt: string }[]) => { setLocalImages(n); setProp((p: GalleryProps) => { p.images = JSON.stringify(n) }) }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} placeholder="Optional" />
      </Section>
      <Section title="Images ({localImages.length})">
        {localImages.map((img, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <input value={img.url} onChange={(e) => { const n = [...localImages]; n[i] = { ...n[i], url: e.target.value }; updateImages(n) }} placeholder="Image URL" className={`${I} flex-1`} />
            <button onClick={() => updateImages(localImages.filter((_, j) => j !== i))} className="text-[10px] text-red-500 px-1">✕</button>
          </div>
        ))}
        <button onClick={() => updateImages([...localImages, { url: "", alt: `Image ${localImages.length + 1}` }])} className="rounded border border-dashed border-border/50 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40">+ Add Image</button>
      </Section>
      <Section title="Grid">
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
                <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={0} max={24} />
                <SegmentedControl label="Image Ratio" value={props.imageRatio} onChange={(v) => set("imageRatio", v as any)} options={[{ value: "square", label: "Square" }, { value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }, { value: "auto", label: "Auto" }]} />
      </Section>
      <Section title="Style">
                <SliderField label="Corner Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={24} />
                <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <div className="grid grid-cols-2 gap-2">
                  <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                  <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
        </div>
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

GalleryBlock.craft = {
  displayName: "Gallery",
  props: { _v: 1, images: defaultImages, columns: 3, gap: 8, imageRatio: "square", borderRadius: 8, hoverEffect: "zoom", variant: "grid", backgroundColor: "", paddingTop: 24, paddingBottom: 24, heading: "" },
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: GallerySettings },
}
