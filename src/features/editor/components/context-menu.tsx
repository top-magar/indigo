"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useEffect, useCallback, useRef } from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { moveNodeUp, moveNodeDown, duplicateNode, deleteNode, toggleHidden } from "../lib/node-actions"

interface MenuItem { label: string; icon: typeof Copy; action: () => void; disabled?: boolean; destructive?: boolean }

export function ContextMenu() {
  const { actions, query } = useEditor()
  const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu || !menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    let { x, y } = menu; let changed = false
    if (x + rect.width > window.innerWidth - 8) { x = window.innerWidth - rect.width - 8; changed = true }
    if (y + rect.height > window.innerHeight - 8) { y = window.innerHeight - rect.height - 8; changed = true }
    if (changed) setMenu((m) => m ? { ...m, x, y } : null)
    menuRef.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [menu?.nodeId])

  const handleContextMenu = useCallback((e: MouseEvent) => {
    const nodeEl = (e.target as HTMLElement).closest("[data-craft-node-id]") as HTMLElement | null
    if (!nodeEl) return
    const nodeId = nodeEl.getAttribute("data-craft-node-id")
    if (!nodeId || nodeId === ROOT_NODE) return
    e.preventDefault(); actions.selectNode(nodeId)
    setMenu({ x: e.clientX, y: e.clientY, nodeId })
  }, [actions])

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopImmediatePropagation(); close() } }
    window.addEventListener("click", close); window.addEventListener("keydown", handleKey)
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", handleKey) }
  }, [menu])

  useEffect(() => { window.addEventListener("contextmenu", handleContextMenu); return () => window.removeEventListener("contextmenu", handleContextMenu) }, [handleContextMenu])

  if (!menu) return null

  let items: MenuItem[] = []
  try {
    const node = query.node(menu.nodeId).get()
    const parentId = node.data.parent
    const siblings = parentId ? query.node(parentId).get().data.nodes || [] : []
    const index = siblings.indexOf(menu.nodeId)
    const hidden = !!node.data.hidden
    const nid = menu.nodeId
    items = [
      { label: "Duplicate", icon: Copy, action: () => { if (parentId) try { duplicateNode(actions, query, nid, parentId, index) } catch {} } },
      { label: hidden ? "Show" : "Hide", icon: hidden ? Eye : EyeOff, action: () => { try { toggleHidden(actions, nid, hidden) } catch {} } },
      { label: "Move Up", icon: ArrowUp, action: () => { if (parentId) try { moveNodeUp(actions, nid, parentId, index) } catch {} }, disabled: index <= 0 },
      { label: "Move Down", icon: ArrowDown, action: () => { if (parentId) try { moveNodeDown(actions, nid, parentId, index, siblings.length) } catch {} }, disabled: index >= siblings.length - 1 },
      { label: "Delete", icon: Trash2, action: () => { try { deleteNode(actions, nid) } catch {} }, destructive: true },
    ]
  } catch { return null }

  return (
    <div ref={menuRef} className="fixed z-50 min-w-[160px] rounded-md border p-1 shadow-md"
      role="menu" aria-label="Section actions"
      style={{ left: menu.x, top: menu.y, boxShadow: 'var(--editor-shadow-popover)' }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        const btns = menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
        if (!btns?.length) return
        const idx = [...btns].indexOf(document.activeElement as HTMLButtonElement)
        if (e.key === "ArrowDown") { e.preventDefault(); btns[(idx + 1) % btns.length].focus() }
        else if (e.key === "ArrowUp") { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus() }
      }}>
      {items.map((item) => (
        <div key={item.label}>
          {item.destructive && <Separator className="my-1" />}
          <Button variant="ghost" size="sm" role="menuitem"
            className={`w-full justify-start gap-2 h-8 text-[13px] font-medium ${item.destructive ? 'hover:bg-destructive/10 hover:text-destructive' : ''}`}
            disabled={item.disabled}
            onClick={() => { item.action(); setMenu(null) }}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        </div>
      ))}
    </div>
  )
}
