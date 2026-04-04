"use client"

import { useNode } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "./editor-fields"

/**
 * Universal style controls. Must be rendered inside a Craft.js NodeProvider
 * (i.e., inside a block's related.settings component context).
 * Only shows controls for props that exist on the block.
 */
export function UniversalStyleControls() {
  const { props, actions: { setProp } } = useNode((n) => ({ props: n.data.props }))
  if (!props) return null

  const has = (key: string) => key in props
  const set = (key: string, val: unknown) => setProp((p: Record<string, unknown>) => { p[key] = val })

  const hasStyle = has("backgroundColor") || has("textColor")
  const hasSpacing = has("paddingTop") || has("paddingBottom")

  if (!hasStyle && !hasSpacing) return null

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
    </>
  )
}
