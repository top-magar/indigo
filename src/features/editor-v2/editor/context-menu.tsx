"use client"

import { useEffect, useState } from "react"
import { useEditorStore } from "./store"
import { getNode } from "../core/document"

interface MenuPos { x: number; y: number }

export function ContextMenu() {
  const [pos, setPos] = useState<MenuPos | null>(null)
  const selectedId = useEditorStore((s) => s.selectedId)
  const apply = useEditorStore((s) => s.apply)
  const select = useEditorStore((s) => s.select)
  const doc = useEditorStore((s) => s.document)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nodeEl = (e.target as HTMLElement).closest("[data-v2-node]")
      if (!nodeEl) { setPos(null); return }
      e.preventDefault()
      select(nodeEl.getAttribute("data-v2-node")!)
      setPos({ x: e.clientX, y: e.clientY })
    }
    const close = () => setPos(null)
    window.addEventListener("contextmenu", handler)
    window.addEventListener("click", close)
    return () => { window.removeEventListener("contextmenu", handler); window.removeEventListener("click", close) }
  }, [select])

  if (!pos || !selectedId) return null
  const node = (() => { try { return getNode(doc, selectedId) } catch { return null } })()
  if (!node || !node.parent) return null

  const parent = getNode(doc, node.parent)
  const idx = parent.children.indexOf(selectedId)

  const swap = (i: number, j: number) => {
    const arr = [...parent.children]; [arr[i], arr[j]] = [arr[j], arr[i]]
    return arr
  }

  const actions = [
    { label: "Duplicate", action: () => apply({ type: "add_node", nodeType: node.type, props: { ...node.props }, parentId: node.parent!, index: idx + 1 }) },
    { label: "Move Up", action: () => apply({ type: "reorder_children", parentId: node.parent!, childIds: swap(idx, idx - 1) }), disabled: idx === 0 },
    { label: "Move Down", action: () => apply({ type: "reorder_children", parentId: node.parent!, childIds: swap(idx, idx + 1) }), disabled: idx >= parent.children.length - 1 },
    { label: "Delete", action: () => { apply({ type: "delete_node", nodeId: selectedId }); select(null) } },
  ]

  return (
    <div style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 100, minWidth: 140, backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 4 }}>
      {actions.map((a) => (
        <button key={a.label} onClick={() => { a.action(); setPos(null) }} disabled={a.disabled}
          className="w-full text-left px-3 py-1.5 text-[12px] rounded hover:bg-accent disabled:opacity-30 transition-colors">
          {a.label}
        </button>
      ))}
    </div>
  )
}
