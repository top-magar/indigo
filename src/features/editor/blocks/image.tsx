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
          <div style={{ height: 200, backgroundColor: "#f3f4f6", borderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, aspectRatio: aspectRatio || undefined }}>Add image</div>
        )}
        {caption && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, textAlign: "center" }}>{caption}</p>}
      </div>
    </div>
  )
}

const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ImageBlockProps }))
  const set = <K extends keyof ImageBlockProps>(k: K, v: ImageBlockProps[K]) => setProp((p: ImageBlockProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Image</summary><div className="flex flex-col gap-2.5 pb-3">
        <ImagePickerField label="Source" value={props.src} onChange={(url) => set("src", url)} />
        <label className={F}>Alt Text<input type="text" value={props.alt} onChange={(e) => set("alt", e.target.value)} className={I} /></label>
        <label className={F}>Caption<input type="text" value={props.caption} onChange={(e) => set("caption", e.target.value)} placeholder="Optional" className={I} /></label>
        <label className={F}>Link URL<input type="text" value={props.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="Optional" className={I} /></label>
      </div></details>
      <details open><summary className={S}>Size & Fit</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Width<select value={props.width} onChange={(e) => set("width", e.target.value as any)} className={I}><option value="full">Full</option><option value="contained">Contained (80%)</option><option value="auto">Auto</option></select></label>
        <label className={F}>Aspect Ratio<select value={props.aspectRatio} onChange={(e) => set("aspectRatio", e.target.value as any)} className={I}><option value="">Auto</option><option value="1/1">Square</option><option value="16/9">16:9</option><option value="4/3">4:3</option><option value="3/2">3:2</option></select></label>
        <label className={F}>Object Fit<select value={props.objectFit} onChange={(e) => set("objectFit", e.target.value as any)} className={I}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option></select></label>
        <label className={F}>Max Height ({props.maxHeight || "none"})<input type="range" min={0} max={800} step={50} value={props.maxHeight} onChange={(e) => set("maxHeight", +e.target.value)} /></label>
        <label className={F}>Alignment<select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={I}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
      </div></details>
      <details><summary className={S}>Style</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Corner Radius ({props.borderRadius}px)<input type="range" min={0} max={32} value={props.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} /></label>
        <label className={F}>Shadow<select value={props.shadow} onChange={(e) => set("shadow", e.target.value as any)} className={I}><option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></label>
        <label className={F}>Hover Effect<select value={props.hoverEffect} onChange={(e) => set("hoverEffect", e.target.value as any)} className={I}><option value="none">None</option><option value="zoom">Zoom</option><option value="brighten">Brighten</option></select></label>
      </div></details>
    </div>
  )
}

ImageBlock.craft = {
  displayName: "Image",
  props: { _v: 1, src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400, width: "full", alignment: "center", shadow: "none", hoverEffect: "none", caption: "", linkUrl: "", aspectRatio: "" },
  rules: { canMoveIn: () => false },
  related: { settings: ImageSettings },
}
