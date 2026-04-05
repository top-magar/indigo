"use client"

import { useNode } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "./editor-fields"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Universal style controls rendered inside each block's settings.
 * Auto-detects which props exist and shows relevant sections.
 */
export function UniversalStyleControls() {
  const { props, actions: { setProp } } = useNode((n) => ({ props: n.data.props }))
  if (!props) return null

  const has = (key: string) => key in props
  const set = (key: string, val: unknown) => setProp((p: Record<string, unknown>) => { p[key] = val })

  const hasStyle = has("backgroundColor") || has("textColor")
  const hasSpacing = has("paddingTop") || has("paddingBottom")
  const hasVisibility = has("hideOnDesktop")

  if (!hasStyle && !hasSpacing && !hasVisibility) return null

  return (
    <>
      {hasStyle && (
        <Section title="Style" defaultOpen={false}>
          {has("backgroundColor") && (
            <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
          )}
          {has("textColor") && (
            <ColorField label="Text Color" value={props.textColor} onChange={(v) => set("textColor", v)} />
          )}
        </Section>
      )}

      {hasSpacing && (
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

      {hasVisibility && (
        <Section title="Visibility" defaultOpen={false}>
          <BreakpointToggles
            hideOnDesktop={props.hideOnDesktop}
            hideOnTablet={props.hideOnTablet}
            hideOnMobile={props.hideOnMobile}
            onChange={(key, val) => set(key, val)}
          />
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
          <Icon className="w-4 h-4" style={{ color: hidden ? 'var(--editor-text-disabled)' : 'var(--editor-accent)' }} />
          <span className="text-[10px] font-medium" style={{ color: hidden ? 'var(--editor-text-disabled)' : 'var(--editor-text)' }}>
            {label}
          </span>
        </Button>
      ))}
    </div>
  )
}
