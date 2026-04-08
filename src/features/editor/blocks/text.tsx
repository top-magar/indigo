"use client"

import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"

import { useNodeOptional as useNode } from "../hooks/use-node-safe"
import { useState, useEffect } from "react"
import { craftRef } from "../lib/craft-ref"
import { Section, TextAreaField, ColorField, SliderField, SegmentedControl } from "../controls/editor-fields"

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
  if (!props) return null
  const set = <K extends keyof TextBlockProps>(k: K, v: TextBlockProps[K]) => setProp((p: TextBlockProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextAreaField label="Text" value={props.text} onChange={(v) => set("text", v)} />
                <SegmentedControl label="Tag" value={props.tagName} onChange={(v) => set("tagName", v as any)} options={[{ value: "p", label: "Paragraph" }, { value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }, { value: "span", label: "Span" }]} />
      </Section>
      <Section title="Typography">
                <SliderField label="Size" value={props.fontSize} onChange={(v) => set("fontSize", v)} min={10} max={96} />
        <label className={F}>Weight<select value={props.fontWeight} onChange={(e) => set("fontWeight", +e.target.value as any)} className={I}>
          <option value={400}>Regular</option><option value={500}>Medium</option><option value={600}>Semibold</option><option value={700}>Bold</option><option value={800}>Extra Bold</option>
        </select></label>
        <label className={F}>Line Height ({props.lineHeight})<input type="range" min={1} max={2.5} step={0.1} value={props.lineHeight} onChange={(e) => set("lineHeight", +e.target.value)} /></label>
        <label className={F}>Letter Spacing ({props.letterSpacing}px)<input type="range" min={-2} max={8} step={0.5} value={props.letterSpacing} onChange={(e) => set("letterSpacing", +e.target.value)} /></label>
                <SegmentedControl label="Transform" value={props.textTransform} onChange={(v) => set("textTransform", v as any)} options={[{ value: "none", label: "None" }, { value: "uppercase", label: "UPPERCASE" }, { value: "capitalize", label: "Capitalize" }]} />
      </Section>
      <Section title="Layout">
                <SegmentedControl label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "left", label: "Left", icon: AlignLeft, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenter, iconOnly: true }, { value: "right", label: "Right", icon: AlignRight, iconOnly: true }]} />
        <label className={F}>Max Width ({props.maxWidth || "none"})<input type="range" min={0} max={1000} step={50} value={props.maxWidth} onChange={(e) => set("maxWidth", +e.target.value)} /></label>
                <SliderField label="Opacity" value={props.opacity} onChange={(v) => set("opacity", v)} min={10} max={100} />
      </Section>
      <Section title="Color">
                <ColorField label="Text Color" value={props.color} onChange={(v) => set("color", v)} />
      </Section>
    </div>
  )
}

TextBlock.craft = {
  displayName: "Text",
  props: { _v: 1, text: "Edit this text", fontSize: 16, fontWeight: 400, color: "#000000", alignment: "left", tagName: "p", lineHeight: 1.6, letterSpacing: 0, maxWidth: 0, textTransform: "none", opacity: 100 },
  rules: { canMoveIn: () => false },
  related: { settings: TextSettings },
}
