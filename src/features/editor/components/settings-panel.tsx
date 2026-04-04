"use client"

import React, { useState } from "react"
import { useEditor } from "@craftjs/core"
import { ChevronDown, ChevronRight, Box, Zap } from "lucide-react"
import { SpacingControl } from "./spacing-control"
import { SizeControl } from "./size-control"
import { AnimationControl } from "./animation-control"

export function SettingsPanel() {
  const { selected, selectedName, settingsComponent } = useEditor((state) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: false }
    const node = state.nodes[currentNodeId]
    return {
      selected: true,
      selectedName: node.data.displayName || node.data.name,
      settingsComponent: node.related?.settings,
    }
  })

  if (!selected) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--editor-text)' }}>
      {/* Header — 44px to match top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px',
        borderBottom: '1px solid var(--editor-border)',
      }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--editor-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--editor-accent)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedName}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Block-specific props */}
        {settingsComponent && (
          <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
            {React.createElement(settingsComponent)}
          </div>
        )}

        <CollapsibleSection icon={Box} title="Layout & Spacing" defaultOpen={false}>
          <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SizeControl />
            <SpacingControl />
          </div>
        </CollapsibleSection>

        <CollapsibleSection icon={Zap} title="Animation" defaultOpen={false}>
          <div style={{ padding: '8px 12px 12px' }}>
            <AnimationControl />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  )
}

function CollapsibleSection({ icon: Icon, title, defaultOpen, children }: {
  icon: typeof Box; title: string; defaultOpen: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, width: '100%',
          height: 36, padding: '0 12px',
          fontSize: 12, fontWeight: 600, color: 'var(--editor-text-secondary)',
          background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
      >
        {open
          ? <ChevronDown style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
        }
        <Icon style={{ width: 14, height: 14, color: 'var(--editor-icon-secondary)' }} />
        {title}
      </button>
      {open && children}
    </div>
  )
}
