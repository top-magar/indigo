"use client"

import { useEditor } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "./editor-fields"
import { Layers } from "lucide-react"

/**
 * Batch editor shown when multiple blocks are selected.
 * Edits shared style props across all selected blocks.
 */
export function BatchEditor() {
  const { selectedIds, actions, query } = useEditor((state) => ({
    selectedIds: [...state.events.selected],
  }))

  if (selectedIds.length < 2) return null

  // Find shared props across all selected blocks
  const allProps = selectedIds.map((id) => {
    try { return query.node(id).get().data.props ?? {} }
    catch { return {} }
  })

  const has = (key: string) => allProps.every((p) => key in p)

  const setBatch = (key: string, val: unknown) => {
    for (const id of selectedIds) {
      actions.setProp(id, (p: Record<string, unknown>) => { p[key] = val })
    }
  }

  // Get first block's value as placeholder
  const first = (key: string) => allProps[0]?.[key] as string ?? ""

  const hasStyle = has("backgroundColor") || has("textColor")
  const hasSpacing = has("paddingTop") || has("paddingBottom")

  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--editor-text)', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px',
        borderBottom: '1px solid var(--editor-border)', flexShrink: 0,
      }}>
        <Layers style={{ width: 16, height: 16, color: 'var(--editor-accent)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.length} blocks selected</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 12, color: 'var(--editor-text-secondary)' }}>
          Edit shared properties across all selected blocks.
        </p>

        {hasStyle && (
          <Section title="Style">
            {has("backgroundColor") && (
              <ColorField label="Background" value={first("backgroundColor")} onChange={(v) => setBatch("backgroundColor", v)} />
            )}
            {has("textColor") && (
              <ColorField label="Text Color" value={first("textColor")} onChange={(v) => setBatch("textColor", v)} />
            )}
          </Section>
        )}

        {hasSpacing && (
          <Section title="Spacing">
            <Row>
              {has("paddingTop") && (
                <SliderField label="Pad Top" value={allProps[0]?.paddingTop as number ?? 0} onChange={(v) => setBatch("paddingTop", v)} min={0} max={120} />
              )}
              {has("paddingBottom") && (
                <SliderField label="Pad Bottom" value={allProps[0]?.paddingBottom as number ?? 0} onChange={(v) => setBatch("paddingBottom", v)} min={0} max={120} />
              )}
            </Row>
          </Section>
        )}

        {has("hideOnDesktop") && (
          <Section title="Visibility" defaultOpen={false}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setBatch("hideOnDesktop", false)} style={{ flex: 1, height: 28, borderRadius: 4, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)', cursor: 'pointer', fontSize: 11, color: 'var(--editor-text)' }}>Show All</button>
              <button onClick={() => setBatch("hideOnMobile", true)} style={{ flex: 1, height: 28, borderRadius: 4, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)', cursor: 'pointer', fontSize: 11, color: 'var(--editor-text)' }}>Hide Mobile</button>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
