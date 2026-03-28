"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface RichTextProps {
  content: string; maxWidth: number; alignment: "left" | "center" | "right"
  backgroundColor: string; textColor: string; fontSize: number; lineHeight: number
  paddingTop: number; paddingBottom: number; paddingX: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const RichTextBlock = (props: RichTextProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { content, maxWidth, alignment, backgroundColor, textColor, fontSize, lineHeight, paddingTop, paddingBottom, paddingX } = props
  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`, textAlign: alignment }}>
      <div style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined, fontSize, lineHeight }} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

const RichTextSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as RichTextProps }))
  const set = <K extends keyof RichTextProps>(k: K, v: RichTextProps[K]) => setProp((p: RichTextProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>HTML Content<textarea value={props.content} onChange={(e) => set("content", e.target.value)} className={`${I} font-mono`} rows={8} /></label>
      </div></details>
      <details><summary className={S}>Typography</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Font Size ({props.fontSize}px)<input type="range" min={12} max={24} value={props.fontSize} onChange={(e) => set("fontSize", +e.target.value)} /></label>
        <label className={F}>Line Height ({props.lineHeight})<input type="range" min={1.2} max={2.2} step={0.1} value={props.lineHeight} onChange={(e) => set("lineHeight", +e.target.value)} /></label>
        <label className={F}>Alignment<select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={I}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Max Width ({props.maxWidth}px)<input type="range" min={400} max={1200} value={props.maxWidth} onChange={(e) => set("maxWidth", +e.target.value)} /></label>
        <label className={F}>Horizontal Padding ({props.paddingX}px)<input type="range" min={0} max={80} value={props.paddingX} onChange={(e) => set("paddingX", +e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

RichTextBlock.craft = {
  displayName: "Rich Text",
  props: { _v: 1, content: "<h2>About Us</h2><p>Write your story here. This block supports <strong>bold</strong>, <em>italic</em>, and <a href='#'>links</a>.</p>", maxWidth: 700, alignment: "left", backgroundColor: "#ffffff", textColor: "#111827", fontSize: 16, lineHeight: 1.7, paddingTop: 32, paddingBottom: 32, paddingX: 24 },
  rules: { canMoveIn: () => false },
  related: { settings: RichTextSettings },
}
