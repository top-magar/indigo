"use client"

import { useNode } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "./editor-fields"
import { GradientPicker } from "./gradient-picker"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Universal style controls rendered inside each block's settings.
 * Auto-detects which props exist and shows relevant sections.
 */
export function UniversalStyleControls({ skip = [] }: { skip?: ("style" | "spacing" | "visibility")[] } = {}) {
  const { props, actions: { setProp } } = useNode((n) => ({ props: n.data.props }))
  if (!props) return null

  const has = (key: string) => key in props
  const set = (key: string, val: unknown) => setProp((p: Record<string, unknown>) => { p[key] = val })

  const hasStyle = has("backgroundColor") || has("textColor")
  const hasSpacing = has("paddingTop") || has("paddingBottom")
  const hasVisibility = has("hideOnDesktop")
  const hasScrollEffect = "_scrollEffect" in props
  const hasDesign = "_shadow" in props
  const hasSticky = "_sticky" in props

  if (!hasStyle && !hasSpacing && !hasVisibility && !hasScrollEffect && !hasDesign) return null

  return (
    <>
      {hasDesign && (
        <Section title="Design" defaultOpen={false}>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">Shadow</span>
              <select value={props._shadow ?? "none"} onChange={(e) => set("_shadow", e.target.value)}
                className="h-7 px-2 text-[13px] rounded-md border border-input bg-background">
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </label>
            <SliderField label="Opacity" value={props._opacity ?? 100} onChange={(v) => set("_opacity", v)} min={0} max={100} />
            <SliderField label="Blur" value={props._blur ?? 0} onChange={(v) => set("_blur", v)} min={0} max={20} />
            <SliderField label="Border Radius" value={props._borderRadius ?? 0} onChange={(v) => set("_borderRadius", v)} min={0} max={48} />
          </div>
        </Section>
      )}

      {hasStyle && !skip.includes("style") && (
        <Section title="Style" defaultOpen={false}>
          {has("backgroundColor") && (
            <GradientPicker label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
          )}
          {has("textColor") && (
            <ColorField label="Text Color" value={props.textColor} onChange={(v) => set("textColor", v)} />
          )}
        </Section>
      )}

      {hasSpacing && !skip.includes("spacing") && (
        <Section title="Spacing" defaultOpen={false}>
          <Row>
            {has("paddingTop") && (
              <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={120} />
            )}
            {has("paddingBottom") && (
              <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={120} />
            )}
          </Row>
        </Section>
      )}

      {hasVisibility && !skip.includes("visibility") && (
        <Section title="Visibility" defaultOpen={false}>
          <BreakpointToggles
            hideOnDesktop={props.hideOnDesktop}
            hideOnTablet={props.hideOnTablet}
            hideOnMobile={props.hideOnMobile}
            onChange={(key, val) => set(key, val)}
          />
        </Section>
      )}

      {hasScrollEffect && (
        <Section title="Scroll Effect" defaultOpen={false}>
          <select value={props._scrollEffect ?? "none"} onChange={(e) => set("_scrollEffect", e.target.value)}
            className="h-8 w-full px-2 text-[13px] rounded-md border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30">
            <option value="none">None</option>
            <option value="fadeIn">Fade In</option>
            <option value="fadeOut">Fade Out</option>
            <option value="parallax">Parallax</option>
            <option value="zoomIn">Zoom In</option>
          </select>
        </Section>
      )}

      {hasSticky && (
        <Section title="Position" defaultOpen={false}>
          <select value={props._sticky ?? "none"} onChange={(e) => set("_sticky", e.target.value)}
            className="h-8 w-full px-2 text-[13px] rounded-md border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30">
            <option value="none">Default</option>
            <option value="top">Sticky Top</option>
            <option value="bottom">Sticky Bottom</option>
          </select>
        </Section>
      )}
    </>
  )
}

/** Compact breakpoint visibility toggles */
function BreakpointToggles({ hideOnDesktop, hideOnTablet, hideOnMobile, onChange }: {
  hideOnDesktop: boolean; hideOnTablet: boolean; hideOnMobile: boolean
  onChange: (key: string, val: boolean) => void
}) {
  const devices = [
    { key: "hideOnDesktop", label: "Desktop", icon: Monitor, hidden: hideOnDesktop },
    { key: "hideOnTablet", label: "Tablet", icon: Tablet, hidden: hideOnTablet },
    { key: "hideOnMobile", label: "Mobile", icon: Smartphone, hidden: hideOnMobile },
  ] as const

  return (
    <div className="flex gap-1">
      {devices.map(({ key, label, icon: Icon, hidden }) => (
        <Button key={key} variant="outline" onClick={() => onChange(key, !hidden)}
          title={hidden ? `Hidden on ${label}` : `Visible on ${label}`}
          className="flex-1 flex-col h-auto gap-1 py-2 px-1"
          style={{
            borderColor: 'var(--editor-border)',
            background: hidden ? 'var(--editor-surface-secondary)' : 'var(--editor-accent-light)',
            opacity: hidden ? 0.5 : 1,
          }}>
          <Icon className={`w-4 h-4 ${hidden ? "text-muted-foreground/60" : "text-blue-600"}`} />
          <span className={`text-[10px] font-medium ${hidden ? "text-muted-foreground/60" : "text-foreground"}`} >
            {label}
          </span>
        </Button>
      ))}
    </div>
  )
}
