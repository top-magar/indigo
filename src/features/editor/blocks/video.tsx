"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface VideoProps {
  url: string; variant: "embed" | "background"
  aspectRatio: "16/9" | "4/3" | "1/1"
  autoplay: boolean; muted: boolean; loop: boolean
  borderRadius: number; shadow: "none" | "sm" | "md" | "lg"
  caption: string; maxWidth: number; alignment: "left" | "center" | "right"
  paddingTop: number; paddingBottom: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const shadowMap: Record<string, string> = { none: "none", sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 25px rgba(0,0,0,0.15)" }

const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export const VideoBlock = (props: VideoProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { url, aspectRatio, borderRadius, shadow, caption, maxWidth, alignment, paddingTop, paddingBottom } = props

  return (
    <div ref={craftRef(connect, drag)} style={{ padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: alignment }}>
      <div style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined, display: "inline-block", width: "100%" }}>
        {url ? (
          <div style={{ position: "relative", aspectRatio, borderRadius, overflow: "hidden", boxShadow: shadowMap[shadow], backgroundColor: "#000" }}>
            <iframe src={getEmbedUrl(url)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen" />
          </div>
        ) : (
          <div style={{ aspectRatio, borderRadius, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>Paste a YouTube or Vimeo URL</div>
        )}
        {caption && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, textAlign: "center" }}>{caption}</p>}
      </div>
    </div>
  )
}

const VideoSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as VideoProps }))
  const set = <K extends keyof VideoProps>(k: K, v: VideoProps[K]) => setProp((p: VideoProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Video</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>URL<input type="url" value={props.url} onChange={(e) => set("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className={I} /></label>
        <label className={F}>Caption<input type="text" value={props.caption} onChange={(e) => set("caption", e.target.value)} placeholder="Optional" className={I} /></label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Aspect Ratio<select value={props.aspectRatio} onChange={(e) => set("aspectRatio", e.target.value as any)} className={I}><option value="16/9">16:9</option><option value="4/3">4:3</option><option value="1/1">Square</option></select></label>
        <label className={F}>Max Width ({props.maxWidth}px)<input type="range" min={300} max={1200} value={props.maxWidth} onChange={(e) => set("maxWidth", +e.target.value)} /></label>
        <label className={F}>Alignment<select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={I}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Style</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Corner Radius ({props.borderRadius}px)<input type="range" min={0} max={24} value={props.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} /></label>
        <label className={F}>Shadow<select value={props.shadow} onChange={(e) => set("shadow", e.target.value as any)} className={I}><option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></label>
      </div></details>
    </div>
  )
}

VideoBlock.craft = {
  displayName: "Video",
  props: { _v: 1, url: "", variant: "embed", aspectRatio: "16/9", autoplay: false, muted: true, loop: false, borderRadius: 8, shadow: "none", caption: "", maxWidth: 800, alignment: "center", paddingTop: 24, paddingBottom: 24 },
  rules: { canMoveIn: () => false },
  related: { settings: VideoSettings },
}
