"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface NewsletterProps {
  heading: string; subheading: string; buttonText: string
  variant: "inline" | "stacked" | "card"
  backgroundColor: string; textColor: string; buttonColor: string; buttonTextColor: string
  paddingTop: number; paddingBottom: number; maxWidth: number
  showName: boolean; placeholderText: string
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

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
        <div style={{ maxWidth, margin: "0 auto", backgroundColor, color: textColor, padding: 48, borderRadius: 16, textAlign: "center" }}>{content}</div>
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: variant === "stacked" ? "center" : "left" }}>
      <div style={{ maxWidth, margin: "0 auto" }}>{content}</div>
    </div>
  )
}

const NewsletterSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as NewsletterProps }))
  const set = <K extends keyof NewsletterProps>(k: K, v: NewsletterProps[K]) => setProp((p: NewsletterProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} className={I} /></label>
        <label className={F}>Subheading<input type="text" value={props.subheading} onChange={(e) => set("subheading", e.target.value)} className={I} /></label>
        <label className={F}>Button Text<input type="text" value={props.buttonText} onChange={(e) => set("buttonText", e.target.value)} className={I} /></label>
        <label className={F}>Placeholder<input type="text" value={props.placeholderText} onChange={(e) => set("placeholderText", e.target.value)} className={I} /></label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showName} onChange={(e) => set("showName", e.target.checked)} />Show Name Field</label>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Variant<select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={I}><option value="inline">Inline</option><option value="stacked">Stacked</option><option value="card">Card</option></select></label>
        <label className={F}>Max Width ({props.maxWidth}px)<input type="range" min={400} max={1200} value={props.maxWidth} onChange={(e) => set("maxWidth", +e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
          <label className={F}>Button BG<input type="color" value={props.buttonColor} onChange={(e) => set("buttonColor", e.target.value)} /></label>
          <label className={F}>Button Text<input type="color" value={props.buttonTextColor} onChange={(e) => set("buttonTextColor", e.target.value)} /></label>
        </div>
      </div></details>
    </div>
  )
}

NewsletterBlock.craft = {
  displayName: "Newsletter",
  props: { _v: 1, heading: "Stay in the loop", subheading: "Get updates on new products and exclusive offers.", buttonText: "Subscribe", variant: "stacked", backgroundColor: "#f9fafb", textColor: "#111827", buttonColor: "#000000", buttonTextColor: "#ffffff", paddingTop: 48, paddingBottom: 48, maxWidth: 600, showName: false, placeholderText: "Enter your email" },
  rules: { canMoveIn: () => false },
  related: { settings: NewsletterSettings },
}
