"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface PopupProps {
  trigger: "delay" | "exitIntent" | "click"
  delay: number
  heading: string
  body: string
  ctaText: string
  ctaHref: string
  image: string
  showClose: boolean
  overlayColor: string
  overlayOpacity: number
  backgroundColor: string
  textColor: string
  accentColor: string
  animation: "fadeIn" | "slideUp" | "scaleUp"
  variant: "centered" | "sidebar" | "fullscreen"
}

const animMap = {
  fadeIn: "indigo-popup-fadeIn",
  slideUp: "indigo-popup-slideUp",
  scaleUp: "indigo-popup-scaleUp",
}

const POPUP_CSS = `
@keyframes indigo-popup-fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes indigo-popup-slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes indigo-popup-scaleUp { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
@keyframes indigo-popup-overlay { from { opacity:0 } to { opacity:1 } }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return
  cssInjected = true
  const s = document.createElement("style")
  s.textContent = POPUP_CSS
  document.head.appendChild(s)
}

function PopupModal({ props, onClose }: { props: PopupProps; onClose: () => void }) {
  injectCSS()
  const { heading, body, ctaText, image, showClose, overlayColor, overlayOpacity, backgroundColor, textColor, accentColor, animation, variant } = props

  const maxW = variant === "fullscreen" ? "100vw" : variant === "sidebar" ? 400 : 520
  const radius = variant === "fullscreen" ? 0 : 16

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: variant === "sidebar" ? "stretch" : "center", justifyContent: variant === "sidebar" ? "flex-end" : "center", animation: "indigo-popup-overlay 0.3s ease" }}>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: overlayColor, opacity: overlayOpacity / 100 }} />
      {/* Modal */}
      <div style={{ position: "relative", maxWidth: maxW, width: "90%", maxHeight: variant === "fullscreen" ? "100vh" : "85vh", overflow: "auto", backgroundColor, color: textColor, borderRadius: radius, padding: 32, animation: `${animMap[animation]} 0.35s ease`, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        {showClose && (
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: textColor, opacity: 0.6, padding: 4 }} aria-label="Close">
            <X size={20} />
          </button>
        )}
        {image && <img src={image} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 16, maxHeight: 200, objectFit: "cover" }} />}
        {heading && <h3 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--store-font-heading, inherit)" }}>{heading}</h3>}
        {body && <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 20px", opacity: 0.8 }}>{body}</p>}
        {ctaText && <button style={{ padding: "12px 28px", borderRadius: 8, backgroundColor: accentColor, color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" }}>{ctaText}</button>}
      </div>
    </div>,
    document.body
  )
}

export const PopupBlock = (props: PopupProps) => {
  const { connectors: { connect, drag } } = useNode()
  const [showPreview, setShowPreview] = useState(false)

  // In editor: show inline preview card + "Preview" button
  return (
    <div ref={craftRef(connect, drag)} style={{ padding: 16, border: "2px dashed #d4d4d8", borderRadius: 12, background: "#fafafa", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#71717a", marginBottom: 8 }}>
        💬 Popup — Trigger: {props.trigger}{props.trigger === "delay" ? ` (${props.delay}s)` : ""}
      </div>
      <div style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12 }}>{props.heading || "No heading"}</div>
      <button onClick={() => setShowPreview(true)} style={{ padding: "6px 16px", borderRadius: 6, backgroundColor: "#3b82f6", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        Preview Popup
      </button>
      {showPreview && <PopupModal props={props} onClose={() => setShowPreview(false)} />}
    </div>
  )
}

/** Storefront runtime — handles actual triggers */
export function PopupRuntime(props: PopupProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (props.trigger === "delay") {
      const t = setTimeout(() => setOpen(true), props.delay * 1000)
      return () => clearTimeout(t)
    }
    if (props.trigger === "exitIntent") {
      const handler = (e: MouseEvent) => { if (e.clientY < 10) { setOpen(true); document.removeEventListener("mouseleave", handler) } }
      document.addEventListener("mouseleave", handler)
      return () => document.removeEventListener("mouseleave", handler)
    }
  }, [props.trigger, props.delay])

  if (!open) return null
  return <PopupModal props={props} onClose={close} />
}

const PopupSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as PopupProps }))
  if (!props) return null
  const set = <K extends keyof PopupProps>(k: K, v: PopupProps[K]) => setProp((p: PopupProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Trigger">
        <SegmentedControl label="When to show" value={props.trigger} onChange={(v) => set("trigger", v as PopupProps["trigger"])} options={[{ value: "delay", label: "After delay" }, { value: "exitIntent", label: "Exit intent" }, { value: "click", label: "On click" }]} />
        {props.trigger === "delay" && <SliderField label="Delay (seconds)" value={props.delay} onChange={(v) => set("delay", v)} min={1} max={30} />}
      </Section>
      <Section title="Content">
        <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
        <TextAreaField label="Body" value={props.body} onChange={(v) => set("body", v)} />
        <TextField label="CTA Text" value={props.ctaText} onChange={(v) => set("ctaText", v)} />
        <TextField label="CTA Link" value={props.ctaHref} onChange={(v) => set("ctaHref", v)} />
        <TextField label="Image URL" value={props.image} onChange={(v) => set("image", v)} />
      </Section>
      <Section title="Layout">
        <SegmentedControl label="Variant" value={props.variant} onChange={(v) => set("variant", v as PopupProps["variant"])} options={[{ value: "centered", label: "Center" }, { value: "sidebar", label: "Sidebar" }, { value: "fullscreen", label: "Full" }]} />
        <SegmentedControl label="Animation" value={props.animation} onChange={(v) => set("animation", v as PopupProps["animation"])} options={[{ value: "fadeIn", label: "Fade" }, { value: "slideUp", label: "Slide" }, { value: "scaleUp", label: "Scale" }]} />
        <ToggleField label="Show close button" checked={props.showClose} onChange={(v) => set("showClose", v)} />
      </Section>
      <Section title="Colors">
        <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
        <ColorField label="CTA / Accent" value={props.accentColor} onChange={(v) => set("accentColor", v)} />
        <ColorField label="Overlay" value={props.overlayColor} onChange={(v) => set("overlayColor", v)} />
        <SliderField label="Overlay Opacity" value={props.overlayOpacity} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} />
      </Section>
      <UniversalStyleControls skip={["style", "spacing"]} />
    </div>
  )
}

PopupBlock.craft = {
  displayName: "Popup",
  props: { _v: 1, trigger: "delay" as const, delay: 5, heading: "Don't Miss Out!", body: "Sign up for exclusive deals and early access to new products.", ctaText: "Get 10% Off", ctaHref: "#", image: "", showClose: true, overlayColor: "#000000", overlayOpacity: 50, backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#3b82f6", animation: "scaleUp" as const, variant: "centered" as const, hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  rules: { canMoveIn: () => false },
  related: { settings: PopupSettings },
}
