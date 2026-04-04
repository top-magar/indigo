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
    <div className="flex flex-col" style={{ color: 'var(--editor-text)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--editor-border)',
        background: 'var(--editor-surface)',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'var(--editor-accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--editor-accent)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 650 }}>{selectedName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Block-specific props — always visible, top priority */}
        {settingsComponent && (
          <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
            {React.createElement(settingsComponent)}
          </div>
        )}

        {/* Layout & Spacing — collapsible */}
        <CollapsibleSection icon={Box} title="Layout & Spacing" defaultOpen={false}>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SizeControl />
            <SpacingControl />
          </div>
        </CollapsibleSection>

        {/* Animation — collapsible */}
        <CollapsibleSection icon={Zap} title="Animation" defaultOpen={false}>
          <div style={{ padding: '12px 16px' }}>
            <AnimationControl />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  )
}

function CollapsibleSection({
  icon: Icon,
  title,
  defaultOpen,
  children,
}: {
  icon: typeof Box
  title: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="settings-section-header"
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          fontSize: 13, fontWeight: 600,
          color: 'var(--editor-text)',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
      >
        {open
          ? <ChevronDown className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
        }
        <Icon className="h-3.5 w-3.5" style={{ color: 'var(--editor-icon-secondary)' }} />
        {title}
      </button>
      {open && children}
    </div>
  )
}
