"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useEffect, useCallback, useRef } from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, EyeOff, Eye } from "lucide-react"

interface MenuItem {
  label: string
  icon: typeof Copy
  action: () => void
  disabled?: boolean
  destructive?: boolean
}

export function ContextMenu() {
  const { actions, query } = useEditor()
  const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Clamp menu position to viewport after render
  useEffect(() => {
    if (!menu || !menuRef.current) return
    const el = menuRef.current
    const rect = el.getBoundingClientRect()
    let { x, y } = menu
    let changed = false
    if (x + rect.width > window.innerWidth - 8) { x = window.innerWidth - rect.width - 8; changed = true }
    if (y + rect.height > window.innerHeight - 8) { y = window.innerHeight - rect.height - 8; changed = true }
    if (changed) setMenu((m) => m ? { ...m, x, y } : null)
  }, [menu?.nodeId]) // only on new menu open, not on position correction

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // Find the closest craft node element
    const target = e.target as HTMLElement
    const nodeEl = target.closest("[data-craft-node-id]") as HTMLElement | null
    if (!nodeEl) return

    const nodeId = nodeEl.getAttribute("data-craft-node-id")
    if (!nodeId || nodeId === ROOT_NODE) return

    e.preventDefault()
    actions.selectNode(nodeId)
    setMenu({ x: e.clientX, y: e.clientY, nodeId })
  }, [actions])

  // Close on click outside or Escape
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopImmediatePropagation(); close() } }
    window.addEventListener("click", close)
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("click", close)
      window.removeEventListener("keydown", handleKey)
    }
  }, [menu])

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu)
    return () => window.removeEventListener("contextmenu", handleContextMenu)
  }, [handleContextMenu])

  if (!menu) return null

  let items: MenuItem[] = []
  try {
    const node = query.node(menu.nodeId).get()
    const parentId = node.data.parent
    const siblings = parentId ? query.node(parentId).get().data.nodes || [] : []
    const index = siblings.indexOf(menu.nodeId)
    const hidden = !!node.data.hidden

    items = [
      {
        label: "Duplicate",
        icon: Copy,
        action: () => {
          try {
            const tree = query.node(menu.nodeId).toNodeTree()
            if (parentId) actions.addNodeTree(tree, parentId, index + 1)
          } catch {}
        },
      },
      {
        label: hidden ? "Show" : "Hide",
        icon: hidden ? Eye : EyeOff,
        action: () => actions.setHidden(menu.nodeId, !hidden),
      },
      {
        label: "Move Up",
        icon: ArrowUp,
        action: () => { if (parentId && index > 0) actions.move(menu.nodeId, parentId, index - 1) },
        disabled: index <= 0,
      },
      {
        label: "Move Down",
        icon: ArrowDown,
        action: () => { if (parentId) actions.move(menu.nodeId, parentId, index + 2) },
        disabled: index >= siblings.length - 1,
      },
      {
        label: "Delete",
        icon: Trash2,
        action: () => actions.delete(menu.nodeId),
        destructive: true,
      },
    ]
  } catch {
    return null
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed', zIndex: 50, minWidth: 160,
        borderRadius: 'var(--editor-radius)',
        border: '1px solid var(--editor-border)',
        background: 'var(--editor-surface)',
        boxShadow: 'var(--editor-shadow-popover)',
        padding: 4,
        left: menu.x, top: menu.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); setMenu(null) }}
          disabled={item.disabled}
          aria-label={item.label}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '6px 10px', borderRadius: 6, border: 'none',
            background: 'none', cursor: item.disabled ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'all 0.1s',
            color: item.disabled ? 'var(--editor-text-disabled)' : item.destructive ? '#c70a24' : 'var(--editor-text)',
            opacity: item.disabled ? 0.4 : 1,
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) e.currentTarget.style.background = item.destructive ? '#fef2f2' : 'var(--editor-surface-hover)'
          }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
