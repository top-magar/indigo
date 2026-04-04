"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

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
  if (!props) return null
  const set = <K extends keyof ContactInfoProps>(k: K, v: ContactInfoProps[K]) => setProp((p: ContactInfoProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
                <TextAreaField label="Address" value={props.address} onChange={(v) => set("address", v)} />
                <TextField label="Phone" value={props.phone} onChange={(v) => set("phone", v)} />
                <TextField label="Email" value={props.email} onChange={(v) => set("email", v)} />
                <TextAreaField label="Hours" value={props.hours} onChange={(v) => set("hours", v)} />
      </Section>
      <Section title="Map">
                <ToggleField label="Show Map" checked={props.showMap} onChange={(v) => set("showMap", v)} />
        {props.showMap && <label className={F}>Map Embed (iframe HTML)<textarea value={props.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value)} className={`${I} font-mono`} rows={3} placeholder='<iframe src="https://maps.google.com/..." />' /></label>}
      </Section>
      <Section title="Layout">
                <SelectField label="Variant" value={props.variant} onChange={(v) => set("variant", v as any)} options={[{ value: "card", label: "Card (centered)" }, { value: "inline", label: "Inline (4-col)" }, { value: "split", label: "Split (info + map)" }]} />
        <div className="grid grid-cols-2 gap-2">
                  <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                  <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
        </div>
      </Section>
      <Section title="Colors">
                <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
                <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
                <ColorField label="Accent" value={props.accentColor} onChange={(v) => set("accentColor", v)} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

ContactInfoBlock.craft = {
  displayName: "Contact Info",
  props: { _v: 1, heading: "Get in Touch", address: "Kathmandu, Nepal", phone: "+977-1-XXXXXXX", email: "hello@store.com", hours: "Mon-Fri: 10am-6pm\nSat: 10am-2pm", variant: "card", showMap: false, mapEmbed: "", backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#3b82f6", paddingTop: 48, paddingBottom: 48 },
  rules: { canMoveIn: () => false },
  related: { settings: ContactInfoSettings },
}
