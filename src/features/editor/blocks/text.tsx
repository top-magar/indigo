"use client"

import { useNode } from "@craftjs/core"
import { useState, useEffect } from "react"
import { craftRef } from "../craft-ref"

interface TextBlockProps {
  text: string
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800
  color: string
  alignment: "left" | "center" | "right"
  tagName: "p" | "h1" | "h2" | "h3" | "h4" | "span"
  lineHeight: number
  letterSpacing: number
  maxWidth: number
  textTransform: "none" | "uppercase" | "capitalize"
  opacity: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const TextBlock = (props: TextBlockProps) => {
  const { connectors: { connect, drag }, isSelected, actions: { setProp } } = useNode((n) => ({ isSelected: n.events.selected }))
  const { text, fontSize, fontWeight, color, alignment, tagName, lineHeight, letterSpacing, maxWidth, textTransform, opacity } = props
  const [editable, setEditable] = useState(false)
  useEffect(() => { if (!isSelected) setEditable(false) }, [isSelected])
  const Tag = tagName
  const isHeading = tagName.startsWith("h")

  return (
    <div ref={craftRef(connect, drag)} className="cursor-pointer" onClick={() => isSelected && setEditable(true)} style={{ textAlign: alignment }}>
      <Tag
        contentEditable={editable} suppressContentEditableWarning
        onBlur={(e) => setProp((p: TextBlockProps) => (p.text = e.currentTarget.innerText))}
        style={{ fontSize, fontWeight, color, textAlign: alignment, outline: "none", margin: 0, lineHeight, letterSpacing, maxWidth: maxWidth || undefined, textTransform, opacity: opacity / 100, fontFamily: isHeading ? "var(--store-font-heading)" : "var(--store-font-body)" }}
      >{text}</Tag>
    </div>
  )
}

const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TextBlockProps }))
  const set = <K extends keyof TextBlockProps>(k: K, v: TextBlockProps[K]) => setProp((p: TextBlockProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Text<textarea value={props.text} onChange={(e) => set("text", e.target.value)} className={I} rows={3} /></label>
        <label className={F}>Tag<select value={props.tagName} onChange={(e) => set("tagName", e.target.value as any)} className={I}>
          <option value="p">Paragraph</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="span">Span</option>
        </select></label>
      </div></details>
      <details open><summary className={S}>Typography</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Size ({props.fontSize}px)<input type="range" min={10} max={96} value={props.fontSize} onChange={(e) => set("fontSize", +e.target.value)} /></label>
        <label className={F}>Weight<select value={props.fontWeight} onChange={(e) => set("fontWeight", +e.target.value as any)} className={I}>
          <option value={400}>Regular</option><option value={500}>Medium</option><option value={600}>Semibold</option><option value={700}>Bold</option><option value={800}>Extra Bold</option>
        </select></label>
        <label className={F}>Line Height ({props.lineHeight})<input type="range" min={1} max={2.5} step={0.1} value={props.lineHeight} onChange={(e) => set("lineHeight", +e.target.value)} /></label>
        <label className={F}>Letter Spacing ({props.letterSpacing}px)<input type="range" min={-2} max={8} step={0.5} value={props.letterSpacing} onChange={(e) => set("letterSpacing", +e.target.value)} /></label>
        <label className={F}>Transform<select value={props.textTransform} onChange={(e) => set("textTransform", e.target.value as any)} className={I}>
          <option value="none">None</option><option value="uppercase">UPPERCASE</option><option value="capitalize">Capitalize</option>
        </select></label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Alignment<select value={props.alignment} onChange={(e) => set("alignment", e.target.value as any)} className={I}>
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
        </select></label>
        <label className={F}>Max Width ({props.maxWidth || "none"})<input type="range" min={0} max={1000} step={50} value={props.maxWidth} onChange={(e) => set("maxWidth", +e.target.value)} /></label>
        <label className={F}>Opacity ({props.opacity}%)<input type="range" min={10} max={100} value={props.opacity} onChange={(e) => set("opacity", +e.target.value)} /></label>
      </div></details>
      <details><summary className={S}>Color</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Text Color<input type="color" value={props.color} onChange={(e) => set("color", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

TextBlock.craft = {
  displayName: "Text",
  props: { _v: 1, text: "Edit this text", fontSize: 16, fontWeight: 400, color: "#000000", alignment: "left", tagName: "p", lineHeight: 1.6, letterSpacing: 0, maxWidth: 0, textTransform: "none", opacity: 100 },
  rules: { canMoveIn: () => false },
  related: { settings: TextSettings },
}
