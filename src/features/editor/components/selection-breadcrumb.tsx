"use client"

import { useEditor } from "@craftjs/core"
import { ChevronRight } from "lucide-react"

/**
 * Bottom breadcrumb showing selection path: Page > Section > Block
 * Like Wix's "Page > Section Grid" at the bottom of the canvas.
 */
export function SelectionBreadcrumb() {
  const { path, actions } = useEditor((state) => {
    const selected = [...state.events.selected]
    if (selected.length !== 1) return { path: [] }

    const nodeId = selected[0]
    const trail: { id: string; name: string }[] = []
    let current: string | undefined = nodeId

    while (current && current !== "ROOT") {
      try {
        const node = state.nodes[current] as { data: { displayName?: string; name?: string; parent?: string } } | undefined
        if (!node) break
        trail.unshift({ id: current, name: node.data.displayName || node.data.name || current })
        current = node.data.parent ?? undefined
      } catch { break }
    }

    return { path: [{ id: "ROOT", name: "Page" }, ...trail] }
  })

  if (path.length === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, height: 28,
      padding: '0 12px', borderTop: '1px solid var(--editor-border)',
      background: 'var(--editor-surface)', fontSize: 12, flexShrink: 0,
    }}>
      {path.map((item, i) => (
        <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <ChevronRight style={{ width: 10, height: 10, color: 'var(--editor-text-disabled)' }} />}
          <button
            onClick={() => { if (item.id !== "ROOT") actions.selectNode(item.id) }}
            style={{
              border: 'none', background: 'none', cursor: item.id !== "ROOT" ? 'pointer' : 'default',
              padding: '2px 4px', borderRadius: 3, fontSize: 12,
              color: i === path.length - 1 ? 'var(--editor-text)' : 'var(--editor-text-secondary)',
              fontWeight: i === path.length - 1 ? 500 : 400,
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { if (item.id !== "ROOT") e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            {item.name}
          </button>
        </span>
      ))}
    </div>
  )
}
