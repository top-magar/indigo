"use client"

import { useEffect, useState } from "react"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, ColorField, SegmentedControl } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface CountdownProps {
  targetDate: string
  heading: string
  expiredText: string
  variant: "bar" | "card" | "inline"
  backgroundColor: string
  textColor: string
  accentColor: string
  paddingTop: number
  paddingBottom: number
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function DigitBox({ value, label, accent, text }: { value: number; label: string; accent: string; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ background: accent, color: text, fontWeight: 700, fontSize: 28, lineHeight: 1, padding: "12px 16px", borderRadius: 8, minWidth: 56, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
        {String(value).padStart(2, "0")}
      </div>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>{label}</span>
    </div>
  )
}

function InlineDigits({ tl, accent }: { tl: TimeLeft; accent: string }) {
  const s = (n: number) => String(n).padStart(2, "0")
  return (
    <span style={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: "tabular-nums", color: accent }}>
      {tl.days > 0 && `${s(tl.days)}d `}{s(tl.hours)}:{s(tl.minutes)}:{s(tl.seconds)}
    </span>
  )
}

export const CountdownBlock = (props: CountdownProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { targetDate, heading, expiredText, variant, backgroundColor, textColor, accentColor, paddingTop, paddingBottom } = props
  const [tl, setTl] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTl(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const wrap: React.CSSProperties = { backgroundColor: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: "center" }

  if (!tl) {
    return <div ref={craftRef(connect, drag)} style={wrap}><p style={{ fontSize: 16, fontWeight: 600 }}>{expiredText}</p></div>
  }

  if (variant === "bar") {
    return (
      <div ref={craftRef(connect, drag)} style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: `12px 24px` }}>
        {heading && <span style={{ fontWeight: 600, fontSize: 15 }}>{heading}</span>}
        <InlineDigits tl={tl} accent={accentColor} />
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div ref={craftRef(connect, drag)} style={{ ...wrap, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
        {heading && <h3 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>{heading}</h3>}
        <InlineDigits tl={tl} accent={accentColor} />
      </div>
    )
  }

  // card variant (default)
  return (
    <div ref={craftRef(connect, drag)} style={wrap}>
      {heading && <h3 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>{heading}</h3>}
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <DigitBox value={tl.days} label="Days" accent={accentColor} text={textColor || "#fff"} />
        <DigitBox value={tl.hours} label="Hours" accent={accentColor} text={textColor || "#fff"} />
        <DigitBox value={tl.minutes} label="Min" accent={accentColor} text={textColor || "#fff"} />
        <DigitBox value={tl.seconds} label="Sec" accent={accentColor} text={textColor || "#fff"} />
      </div>
    </div>
  )
}

const CountdownSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as CountdownProps }))
  if (!props) return null
  const set = <K extends keyof CountdownProps>(k: K, v: CountdownProps[K]) => setProp((p: CountdownProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Timer">
        <TextField label="Target Date" value={props.targetDate} onChange={(v) => set("targetDate", v)} placeholder="2026-12-31T23:59:59" />
        <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
        <TextField label="Expired Text" value={props.expiredText} onChange={(v) => set("expiredText", v)} />
      </Section>
      <Section title="Layout">
        <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as CountdownProps["variant"])} options={[{ value: "card", label: "Card" }, { value: "bar", label: "Bar" }, { value: "inline", label: "Inline" }]} />
      </Section>
      <Section title="Colors">
        <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
        <ColorField label="Accent / Digits" value={props.accentColor} onChange={(v) => set("accentColor", v)} />
      </Section>
      <UniversalStyleControls skip={["style"]} />
    </div>
  )
}

// Default: 7 days from now
const defaultTarget = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19)

CountdownBlock.craft = {
  displayName: "Countdown Timer",
  props: { _v: 1, targetDate: defaultTarget(), heading: "Sale Ends In", expiredText: "This offer has expired", variant: "card" as const, backgroundColor: "#0f172a", textColor: "#ffffff", accentColor: "#ef4444", paddingTop: 40, paddingBottom: 40, hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  rules: { canMoveIn: () => false },
  related: { settings: CountdownSettings },
}
