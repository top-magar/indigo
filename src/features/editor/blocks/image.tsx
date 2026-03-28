"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"

interface ImageBlockProps {
  src: string
  alt: string
  objectFit: "cover" | "contain" | "fill"
  borderRadius: number
  maxHeight: number
}

export const ImageBlock = ({ src, alt, objectFit, borderRadius, maxHeight }: ImageBlockProps) => {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={craftRef(connect, drag)} className="cursor-pointer">
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", maxHeight, objectFit, borderRadius, display: "block" }} />
      ) : (
        <div
          className="flex items-center justify-center border-2 border-dashed border-muted-foreground/30 bg-muted text-sm text-muted-foreground"
          style={{ height: maxHeight || 200, borderRadius }}
        >
          Select an image in settings →
        </div>
      )}
    </div>
  )
}

const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ImageBlockProps }))

  return (
    <div className="flex flex-col gap-3">
      <ImagePickerField label="Image" value={props.src} onChange={(url) => setProp((p: ImageBlockProps) => (p.src = url))} />
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Alt Text
        <input type="text" value={props.alt} onChange={(e) => setProp((p: ImageBlockProps) => (p.alt = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Fit
        <select value={props.objectFit} onChange={(e) => setProp((p: ImageBlockProps) => (p.objectFit = e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Max Height ({props.maxHeight}px)
        <input type="range" min={100} max={800} value={props.maxHeight} onChange={(e) => setProp((p: ImageBlockProps) => (p.maxHeight = +e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Border Radius ({props.borderRadius}px)
        <input type="range" min={0} max={32} value={props.borderRadius} onChange={(e) => setProp((p: ImageBlockProps) => (p.borderRadius = +e.target.value))} />
      </label>
    </div>
  )
}

ImageBlock.craft = {
  displayName: "Image",
  props: { _v: 1, src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400 },
  rules: { canMoveIn: () => false },
  related: { settings: ImageSettings },
}
