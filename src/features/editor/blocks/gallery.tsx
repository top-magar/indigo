"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface GalleryProps {
  images: string // JSON array of {src, alt}
  columns: 2 | 3 | 4
  gap: number
  borderRadius: number
  aspectRatio: "auto" | "1/1" | "4/3" | "16/9"
}

const defaultImages = JSON.stringify([
  { src: "", alt: "Image 1" },
  { src: "", alt: "Image 2" },
  { src: "", alt: "Image 3" },
  { src: "", alt: "Image 4" },
  { src: "", alt: "Image 5" },
  { src: "", alt: "Image 6" },
])

export const GalleryBlock = ({ images, columns, gap, borderRadius, aspectRatio }: GalleryProps) => {
  const { connectors: { connect, drag } } = useNode()
  let parsed: any[] = []
  try { parsed = JSON.parse(images) } catch {}

  return (
    <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap, padding: 24 }}>
      {parsed.map((img, i) => (
        <div key={i} style={{ borderRadius, overflow: "hidden", aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio }}>
          {img.src ? (
            <img src={img.src} alt={img.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", minHeight: 120, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>
              {img.alt || `Image ${i + 1}`}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const GallerySettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as GalleryProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Columns
        <select value={props.columns} onChange={(e) => setProp((p: GalleryProps) => (p.columns = +e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Aspect Ratio
        <select value={props.aspectRatio} onChange={(e) => setProp((p: GalleryProps) => (p.aspectRatio = e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="auto">Auto</option><option value="1/1">Square</option><option value="4/3">4:3</option><option value="16/9">16:9</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Gap ({props.gap}px)
        <input type="range" min={0} max={24} value={props.gap} onChange={(e) => setProp((p: GalleryProps) => (p.gap = +e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Border Radius ({props.borderRadius}px)
        <input type="range" min={0} max={24} value={props.borderRadius} onChange={(e) => setProp((p: GalleryProps) => (p.borderRadius = +e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Images (JSON)
        <textarea value={props.images} onChange={(e) => setProp((p: GalleryProps) => (p.images = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono" rows={8} />
      </label>
    </div>
  )
}

GalleryBlock.craft = {
  displayName: "Gallery",
  props: { images: defaultImages, columns: 3, gap: 8, borderRadius: 8, aspectRatio: "1/1" } satisfies GalleryProps,
  related: { settings: GallerySettings },
}
