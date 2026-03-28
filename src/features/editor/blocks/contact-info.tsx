"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface ContactInfoProps {
  heading: string; address: string; phone: string; email: string; hours: string
  variant: "card" | "inline" | "split"
  showMap: boolean; mapEmbed: string
  backgroundColor: string; textColor: string; accentColor: string
  paddingTop: number; paddingBottom: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const InfoItem = ({ label, value, color }: { label: string; value: string; color: string }) => value ? (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color, opacity: 0.6, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</div>
  </div>
) : null

export const ContactInfoBlock = (props: ContactInfoProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, address, phone, email, hours, variant, showMap, mapEmbed, backgroundColor, textColor, accentColor, paddingTop, paddingBottom } = props
  const info = <><InfoItem label="Address" value={address} color={accentColor} /><InfoItem label="Phone" value={phone} color={accentColor} /><InfoItem label="Email" value={email} color={accentColor} /><InfoItem label="Hours" value={hours} color={accentColor} /></>

  if (variant === "split" && showMap && mapEmbed) {
    return (
      <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px", textAlign: "center" }}>{heading}</h2>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            <div>{info}</div>
            <div style={{ borderRadius: 12, overflow: "hidden", minHeight: 300 }} dangerouslySetInnerHTML={{ __html: mapEmbed }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: variant === "inline" ? 1200 : 600, margin: "0 auto", textAlign: variant === "card" ? "center" : "left" }}>
        {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>}
        {variant === "inline" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>{info}</div> : info}
        {showMap && mapEmbed && <div style={{ marginTop: 32, borderRadius: 12, overflow: "hidden", minHeight: 300 }} dangerouslySetInnerHTML={{ __html: mapEmbed }} />}
      </div>
    </div>
  )
}

const ContactInfoSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ContactInfoProps }))
  const set = <K extends keyof ContactInfoProps>(k: K, v: ContactInfoProps[K]) => setProp((p: ContactInfoProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Content</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} className={I} /></label>
        <label className={F}>Address<textarea value={props.address} onChange={(e) => set("address", e.target.value)} className={I} rows={2} /></label>
        <label className={F}>Phone<input type="text" value={props.phone} onChange={(e) => set("phone", e.target.value)} className={I} /></label>
        <label className={F}>Email<input type="text" value={props.email} onChange={(e) => set("email", e.target.value)} className={I} /></label>
        <label className={F}>Hours<textarea value={props.hours} onChange={(e) => set("hours", e.target.value)} className={I} rows={2} /></label>
      </div></details>
      <details><summary className={S}>Map</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showMap} onChange={(e) => set("showMap", e.target.checked)} />Show Map</label>
        {props.showMap && <label className={F}>Map Embed (iframe HTML)<textarea value={props.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value)} className={`${I} font-mono`} rows={3} placeholder='<iframe src="https://maps.google.com/..." />' /></label>}
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Variant<select value={props.variant} onChange={(e) => set("variant", e.target.value as any)} className={I}><option value="card">Card (centered)</option><option value="inline">Inline (4-col)</option><option value="split">Split (info + map)</option></select></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
        <label className={F}>Accent<input type="color" value={props.accentColor} onChange={(e) => set("accentColor", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

ContactInfoBlock.craft = {
  displayName: "Contact Info",
  props: { _v: 1, heading: "Get in Touch", address: "Kathmandu, Nepal", phone: "+977-1-XXXXXXX", email: "hello@store.com", hours: "Mon-Fri: 10am-6pm\nSat: 10am-2pm", variant: "card", showMap: false, mapEmbed: "", backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#3b82f6", paddingTop: 48, paddingBottom: 48 },
  rules: { canMoveIn: () => false },
  related: { settings: ContactInfoSettings },
}
