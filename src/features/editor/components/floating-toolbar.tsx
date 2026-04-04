"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useCallback, useEffect, useState, useRef } from "react"
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/shared/utils"

/**
 * Floating toolbar that appears above the selected block on the canvas.
 * Provides quick actions: move up/down, duplicate, delete.
 */
export function FloatingToolbar() {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const { selectedId, selectedName, parentId, index, siblingCount, actions, query } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, selectedName: "", parentId: null, index: -1, siblingCount: 0 }

    const node = state.nodes[nodeId]
    const pid = node?.data.parent ?? null
    const siblings = pid ? state.nodes[pid]?.data.nodes ?? [] : []

    return {
      selectedId: nodeId,
      selectedName: node?.data.displayName || node?.data.name || "",
      parentId: pid,
      index: siblings.indexOf(nodeId),
      siblingCount: siblings.length,
    }
  })

  // Position the toolbar above the selected DOM element
  useEffect(() => {
    if (!selectedId) { setPos(null); return }

    const updatePosition = () => {
      const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`) as HTMLElement | null
      const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
      if (!el || !canvas) { setPos(null); return }

      const elRect = el.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()

      setPos({
        top: elRect.top - canvasRect.top - 40,
        left: elRect.left - canvasRect.left + elRect.width / 2,
      })
    }

    updatePosition()
    // Reposition on scroll/resize
    const canvas = document.querySelector("[data-editor-canvas]")
    canvas?.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)
    const observer = new MutationObserver(updatePosition)
    const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`)
    if (el) observer.observe(el, { attributes: true, childList: true, subtree: true })

    return () => {
      canvas?.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      observer.disconnect()
    }
  }, [selectedId])

  const handleMoveUp = useCallback(() => {
    if (!selectedId || !parentId || index <= 0) return
    try { actions.move(selectedId, parentId, index - 1) } catch {}
  }, [actions, selectedId, parentId, index])

  const handleMoveDown = useCallback(() => {
    if (!selectedId || !parentId || index >= siblingCount - 1) return
    try { actions.move(selectedId, parentId, index + 2) } catch {}
  }, [actions, selectedId, parentId, index, siblingCount])

  const handleDuplicate = useCallback(() => {
    if (!selectedId || !parentId) return
    try {
      const tree = query.node(selectedId).toNodeTree()
      actions.addNodeTree(tree, parentId, index + 1)
    } catch {}
  }, [actions, query, selectedId, parentId, index])

  const handleDelete = useCallback(() => {
    if (!selectedId) return
    actions.delete(selectedId)
  }, [actions, selectedId])

  if (!selectedId || !pos) return null

  return (
    <div
      ref={ref}
      className="floating-toolbar pointer-events-auto absolute z-50 flex items-center gap-0.5 rounded-lg px-1 py-0.5"
      style={{
        top: Math.max(4, pos.top),
        left: pos.left,
        transform: "translateX(-50%)",
        background: 'var(--editor-surface)',
        border: '1px solid var(--editor-border)',
        borderRadius: 6,
        boxShadow: 'var(--editor-shadow-popover)',
      }}
    >
      {/* Block name */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', fontSize: 11, fontWeight: 600, color: 'var(--editor-text-secondary)' }}>
        <GripVertical className="h-3 w-3" />
        {selectedName}
      </span>

      <div style={{ width: 1, height: 16, background: 'var(--editor-border)' }} />

      {/* Actions */}
      <ToolbarButton icon={ArrowUp} label="Move Up" onClick={handleMoveUp} disabled={index <= 0} />
      <ToolbarButton icon={ArrowDown} label="Move Down" onClick={handleMoveDown} disabled={index >= siblingCount - 1} />

      <div style={{ width: 1, height: 16, background: 'var(--editor-border)' }} />

      <ToolbarButton icon={Copy} label="Duplicate" onClick={handleDuplicate} />
      <ToolbarButton icon={Trash2} label="Delete" onClick={handleDelete} destructive />
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: typeof ArrowUp
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        padding: 4, borderRadius: 6, border: 'none',
        background: 'none', cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)',
        opacity: disabled ? 0.3 : 1, transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = destructive ? '#fef2f2' : 'var(--editor-surface-hover)'
          e.currentTarget.style.color = destructive ? '#dc2626' : 'var(--editor-text)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none'
        e.currentTarget.style.color = disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)'
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
