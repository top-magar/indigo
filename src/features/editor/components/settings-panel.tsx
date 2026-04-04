"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Copy, ClipboardPaste } from "lucide-react"
import { useStyleClipboard } from "../use-style-clipboard"
import { SizeControl } from "./size-control"
import { SpacingControl } from "./spacing-control"

function CopyPasteButtons({ nodeId }: { nodeId: string }) {
  const { actions, query } = useEditor()
  const { copy, paste, hasClipboard } = useStyleClipboard()

  return (
    <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
      <button
        title="Copy style (⌘⇧C)"
        onClick={() => {
          const props = query.node(nodeId).get().data.props ?? {}
          copy(props)
        }}
        style={{ padding: 4, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)' }}
      >
        <Copy style={{ width: 14, height: 14 }} />
      </button>
      <button
        title="Paste style (⌘⇧V)"
        onClick={() => paste((cb) => actions.setProp(nodeId, cb))}
        disabled={!hasClipboard}
        style={{ padding: 4, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: hasClipboard ? 'var(--editor-icon-secondary)' : 'var(--editor-text-disabled)', opacity: hasClipboard ? 1 : 0.4 }}
      >
        <ClipboardPaste style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}

export function SettingsPanel() {
  const { selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: null }
    const node = state.nodes[currentNodeId]
    return {
      selected: {
        id: currentNodeId,
        name: node.data.displayName || node.data.name,
        settings: node.related && node.related.settings,
      },
    }
  })

  if (!selected) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--editor-text)', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px',
        borderBottom: '1px solid var(--editor-border)', flexShrink: 0,
      }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--editor-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--editor-accent)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</span>
        <CopyPasteButtons nodeId={selected.id} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {selected.settings
          ? React.createElement(selected.settings)
          : <p style={{ padding: '16px 12px', fontSize: 12, color: 'var(--editor-text-disabled)' }}>No settings for this block.</p>
        }
        <SizeControl />
        <SpacingControl />
      </div>
    </div>
  )
}
