"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

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
          <UniversalStyleControls />
    </div>
  )
}

const VideoSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as VideoProps }))
  if (!props) return null
  const set = <K extends keyof VideoProps>(k: K, v: VideoProps[K]) => setProp((p: VideoProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Video">
        <label className={F}>URL<input type="url" value={props.url} onChange={(e) => set("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className={I} /></label>
                <TextField label="Caption" value={props.caption} onChange={(v) => set("caption", v)} placeholder="Optional" />
      </Section>
      <Section title="Layout">
                <SelectField label="Aspect Ratio" value={props.aspectRatio} onChange={(v) => set("aspectRatio", v as any)} options={[{ value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "1/1", label: "Square" }]} />
                <SliderField label="Max Width" value={props.maxWidth} onChange={(v) => set("maxWidth", v)} min={300} max={1200} />
                <SelectField label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
        <div className="grid grid-cols-2 gap-2">
                  <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                  <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
        </div>
      </Section>
      <Section title="Style">
                <SliderField label="Corner Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={24} />
                <SelectField label="Shadow" value={props.shadow} onChange={(v) => set("shadow", v as any)} options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

VideoBlock.craft = {
  displayName: "Video",
  props: { _v: 1, url: "", variant: "embed", aspectRatio: "16/9", autoplay: false, muted: true, loop: false, borderRadius: 8, shadow: "none", caption: "", maxWidth: 800, alignment: "center", paddingTop: 24, paddingBottom: 24 },
  rules: { canMoveIn: () => false },
  related: { settings: VideoSettings },
}
