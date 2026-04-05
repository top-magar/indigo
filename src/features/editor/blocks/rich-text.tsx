"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, SliderField, SegmentedControl } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface RichTextProps {
  content: string; maxWidth: number; alignment: "left" | "center" | "right"
  backgroundColor: string; textColor: string; fontSize: number; lineHeight: number
  paddingTop: number; paddingBottom: number; paddingX: number
}

const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const RichTextBlock = (props: RichTextProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { content, maxWidth, alignment, backgroundColor, textColor, fontSize, lineHeight, paddingTop, paddingBottom, paddingX } = props
  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`, textAlign: alignment, fontFamily: "var(--store-font-body, inherit)" }}>
      <style>{`[data-rich-text] h1,[data-rich-text] h2,[data-rich-text] h3,[data-rich-text] h4,[data-rich-text] h5,[data-rich-text] h6{font-family:var(--store-font-heading,inherit)}`}</style>
      <div data-rich-text style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined, fontSize, lineHeight }} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

const RichTextSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as RichTextProps }))
  if (!props) return null
  const set = <K extends keyof RichTextProps>(k: K, v: RichTextProps[K]) => setProp((p: RichTextProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
        <label className={F}>HTML Content<textarea value={props.content} onChange={(e) => set("content", e.target.value)} className={`${I} font-mono`} rows={8} /></label>
      </Section>
      <Section title="Typography">
                <SliderField label="Font Size" value={props.fontSize} onChange={(v) => set("fontSize", v)} min={12} max={24} />
        <label className={F}>Line Height ({props.lineHeight})<input type="range" min={1.2} max={2.2} step={0.1} value={props.lineHeight} onChange={(e) => set("lineHeight", +e.target.value)} /></label>
                <SegmentedControl label="Alignment" value={props.alignment} onChange={(v) => set("alignment", v as any)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      </Section>
      <Section title="Layout">
                <SliderField label="Max Width" value={props.maxWidth} onChange={(v) => set("maxWidth", v)} min={400} max={1200} />
                <SliderField label="Horizontal Padding" value={props.paddingX} onChange={(v) => set("paddingX", v)} min={0} max={80} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

RichTextBlock.craft = {
  displayName: "Rich Text",
  props: { _v: 1, content: "<h2>About Us</h2><p>Write your story here. This block supports <strong>bold</strong>, <em>italic</em>, and <a href='#'>links</a>.</p>", maxWidth: 700, alignment: "left", backgroundColor: "", textColor: "", fontSize: 16, lineHeight: 1.7, paddingTop: 32, paddingBottom: 32, paddingX: 24 },
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: RichTextSettings },
}
