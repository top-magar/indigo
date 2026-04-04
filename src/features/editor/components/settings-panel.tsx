"use client"

import React from "react"
import { useEditor } from "@craftjs/core"

export function SettingsPanel() {
  const { selected, selectedName, settingsComponent } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: false }

    let settings: React.ElementType | undefined
    try {
      const node = query.node(currentNodeId).get()
      settings = node.related?.settings
    } catch {}

    const stateNode = state.nodes[currentNodeId]
    return {
      selected: true,
      selectedName: stateNode?.data?.displayName || stateNode?.data?.name,
      settingsComponent: settings,
    }
  })

  if (!selected) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--editor-text)', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px',
        borderBottom: '1px solid var(--editor-border)', flexShrink: 0,
      }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--editor-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--editor-accent)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedName}</span>
      </div>

      {/* Block-specific settings only */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {settingsComponent
          ? React.createElement(settingsComponent)
          : <p style={{ padding: '16px 12px', fontSize: 12, color: 'var(--editor-text-disabled)' }}>No settings for this block.</p>
        }
      </div>
    </div>
  )
}
