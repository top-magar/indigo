"use client"

import { useNode } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "./editor-fields"
import { Monitor, Tablet, Smartphone } from "lucide-react"

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
    <div style={{ display: 'flex', gap: 4 }}>
      {devices.map(({ key, label, icon: Icon, hidden }) => (
        <button
          key={key}
          onClick={() => onChange(key, !hidden)}
          title={hidden ? `Hidden on ${label}` : `Visible on ${label}`}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 4px', borderRadius: 4, cursor: 'pointer',
            border: '1px solid var(--editor-border)',
            background: hidden ? 'var(--editor-surface-secondary)' : 'var(--editor-accent-light)',
            opacity: hidden ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          <Icon style={{ width: 16, height: 16, color: hidden ? 'var(--editor-text-disabled)' : 'var(--editor-accent)' }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: hidden ? 'var(--editor-text-disabled)' : 'var(--editor-text)' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
