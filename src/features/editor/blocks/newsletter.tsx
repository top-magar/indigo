"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface NewsletterProps {
  heading: string
  subheading: string
  buttonText: string
  backgroundColor: string
  textColor: string
  inputPlaceholder: string
}

export const NewsletterBlock = ({
  heading, subheading, buttonText, backgroundColor, textColor, inputPlaceholder,
}: NewsletterProps) => {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: "48px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>
        <p style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>{subheading}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <input
            type="email"
            placeholder={inputPlaceholder}
            onClick={(e) => e.preventDefault()}
            readOnly
            style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, backgroundColor: "#fff", color: "#111" }}
          />
          <button style={{ padding: "12px 24px", borderRadius: 8, border: "none", backgroundColor: textColor, color: backgroundColor, fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

const NewsletterSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as NewsletterProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Heading
        <input type="text" value={props.heading} onChange={(e) => setProp((p: NewsletterProps) => (p.heading = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Subheading
        <input type="text" value={props.subheading} onChange={(e) => setProp((p: NewsletterProps) => (p.subheading = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Button Text
        <input type="text" value={props.buttonText} onChange={(e) => setProp((p: NewsletterProps) => (p.buttonText = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Placeholder
        <input type="text" value={props.inputPlaceholder} onChange={(e) => setProp((p: NewsletterProps) => (p.inputPlaceholder = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: NewsletterProps) => (p.backgroundColor = e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text Color
        <input type="color" value={props.textColor} onChange={(e) => setProp((p: NewsletterProps) => (p.textColor = e.target.value))} />
      </label>
    </div>
  )
}

NewsletterBlock.craft = {
  displayName: "Newsletter",
  props: { _v: 1, heading: "Stay in the Loop", subheading: "Get updates on new products and exclusive offers", buttonText: "Subscribe", backgroundColor: "#1a1a2e", textColor: "#ffffff", inputPlaceholder: "Enter your email" },
  related: { settings: NewsletterSettings },
}
