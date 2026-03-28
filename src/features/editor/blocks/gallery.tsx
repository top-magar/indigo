"use client"
import { useNode } from "@craftjs/core"
import { useState } from "react"
import { craftRef } from "../craft-ref"

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
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>}
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
  const set = <K extends keyof GalleryProps>(k: K, v: GalleryProps[K]) => setProp((p: GalleryProps) => { (p as any)[k] = v })
  const [localImages, setLocalImages] = useState(() => parse(props.images))
  const updateImages = (n: { url: string; alt: string }[]) => { setLocalImages(n); setProp((p: GalleryProps) => { p.images = JSON.stringify(n) }) }
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} placeholder="Optional" className={I} /></label>
      </div></details>
      <details open><summary className={S}>Images ({localImages.length})</summary><div className="flex flex-col gap-2 pb-3">
        {localImages.map((img, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <input value={img.url} onChange={(e) => { const n = [...localImages]; n[i] = { ...n[i], url: e.target.value }; updateImages(n) }} placeholder="Image URL" className={`${I} flex-1`} />
            <button onClick={() => updateImages(localImages.filter((_, j) => j !== i))} className="text-[10px] text-red-500 px-1">✕</button>
          </div>
        ))}
        <button onClick={() => updateImages([...localImages, { url: "", alt: `Image ${localImages.length + 1}` }])} className="rounded border border-dashed border-border/50 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40">+ Add Image</button>
      </div></details>
      <details><summary className={S}>Grid</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
        <label className={F}>Gap ({props.gap}px)<input type="range" min={0} max={24} value={props.gap} onChange={(e) => set("gap", +e.target.value)} /></label>
        <label className={F}>Image Ratio<select value={props.imageRatio} onChange={(e) => set("imageRatio", e.target.value as any)} className={I}><option value="square">Square</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="auto">Auto</option></select></label>
      </div></details>
      <details><summary className={S}>Style</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Corner Radius ({props.borderRadius}px)<input type="range" min={0} max={24} value={props.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} /></label>
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
    </div>
  )
}

GalleryBlock.craft = {
  displayName: "Gallery",
  props: { _v: 1, images: defaultImages, columns: 3, gap: 8, imageRatio: "square", borderRadius: 8, hoverEffect: "zoom", variant: "grid", backgroundColor: "#ffffff", paddingTop: 24, paddingBottom: 24, heading: "" },
  rules: { canMoveIn: () => false },
  related: { settings: GallerySettings },
}
