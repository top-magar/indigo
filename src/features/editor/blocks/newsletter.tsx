"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, ColorField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { PaddingControl } from "../components/padding-control"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface NewsletterProps {
  heading: string; subheading: string; buttonText: string
  variant: "inline" | "stacked" | "card"
  backgroundColor: string; textColor: string; buttonColor: string; buttonTextColor: string
  paddingTop: number; paddingBottom: number; maxWidth: number
  showName: boolean; placeholderText: string
}

export const NewsletterBlock = (props: NewsletterProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, subheading, buttonText, variant, backgroundColor, textColor, buttonColor, buttonTextColor, paddingTop, paddingBottom, maxWidth, showName, placeholderText } = props
  const radius = "var(--store-radius, 8px)"
  const inputStyle: React.CSSProperties = { padding: "10px 14px", borderRadius: radius, border: "1px solid #d1d5db", fontSize: 14, flex: 1, minWidth: 0 }
  const btnStyle: React.CSSProperties = { padding: "10px 24px", borderRadius: radius, backgroundColor: buttonColor, color: buttonTextColor, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }

  const form = variant === "inline" ? (
    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
      {showName && <input placeholder="Name" style={inputStyle} />}
      <input placeholder={placeholderText} style={inputStyle} />
      <button style={btnStyle}>{buttonText}</button>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, maxWidth: 400, marginInline: variant === "stacked" ? "auto" : undefined }}>
      {showName && <input placeholder="Name" style={inputStyle} />}
      <input placeholder={placeholderText} style={inputStyle} />
      <button style={btnStyle}>{buttonText}</button>
    </div>
  )

  const content = (
    <>
      {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--store-font-heading)" }}>{heading}</h2>}
      {subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}
      {form}
    </>
  )

  if (variant === "card") {
    return (
      <div ref={craftRef(connect, drag)} style={{ padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        <div style={{ maxWidth, margin: "0 auto", backgroundColor: backgroundColor || undefined, color: textColor || undefined, padding: 48, borderRadius: 16, textAlign: "center" }}>{content}</div>
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: variant === "stacked" ? "center" : "left" }}>
      <div style={{ maxWidth, margin: "0 auto" }}>{content}</div>
    </div>
  )
}

const NewsletterSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as NewsletterProps }))
  if (!props) return null
  const set = <K extends keyof NewsletterProps>(k: K, v: NewsletterProps[K]) => setProp((p: NewsletterProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
                <TextField label="Subheading" value={props.subheading} onChange={(v) => set("subheading", v)} />
                <TextField label="Button Text" value={props.buttonText} onChange={(v) => set("buttonText", v)} />
                <TextField label="Placeholder" value={props.placeholderText} onChange={(v) => set("placeholderText", v)} />
                <ToggleField label="Show Name Field" checked={props.showName} onChange={(v) => set("showName", v)} />
      </Section>
      <Section title="Layout">
                <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "inline", label: "Inline" }, { value: "stacked", label: "Stacked" }, { value: "card", label: "Card" }]} />
                <SliderField label="Max Width" value={props.maxWidth} onChange={(v) => set("maxWidth", v)} min={400} max={1200} />
        <div className="grid grid-cols-2 gap-2">
                  <PaddingControl top={props.paddingTop} bottom={props.paddingBottom} onTop={(v) => set("paddingTop", v)} onBottom={(v) => set("paddingBottom", v)} max={96} />
        </div>
      </Section>
      <Section title="Colors">
        <div className="grid grid-cols-2 gap-2">
                  <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
                  <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
                  <ColorField label="Button BG" value={props.buttonColor} onChange={(v) => set("buttonColor", v)} />
                  <ColorField label="Button Text" value={props.buttonTextColor} onChange={(v) => set("buttonTextColor", v)} />
        </div>
      </Section>
          <UniversalStyleControls skip={["style", "spacing"]} />
    </div>
  )
}

NewsletterBlock.craft = {
  displayName: "Newsletter",
  props: { _v: 1, heading: "Stay in the loop", subheading: "Get updates on new products and exclusive offers.", buttonText: "Subscribe", variant: "stacked", backgroundColor: "", textColor: "", buttonColor: "#000000", buttonTextColor: "#ffffff", paddingTop: 48, paddingBottom: 48, maxWidth: 600, showName: false, placeholderText: "Enter your email" },
    hideOnDesktop: false, _scrollEffect: "none", hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: NewsletterSettings },
}
