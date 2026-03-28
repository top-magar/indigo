"use client"

import { useEditor } from "@craftjs/core"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Keyboard } from "lucide-react"
import { saveDraftAction } from "../actions"
import { toast } from "sonner"
import { zoomIn, zoomOut } from "../zoom-utils"

const shortcuts = [
  { keys: ["⌘", "S"], desc: "Save draft" },
  { keys: ["⌘", "Z"], desc: "Undo" },
  { keys: ["⌘", "⇧", "Z"], desc: "Redo" },
  { keys: ["⌘", "D"], desc: "Duplicate selected block" },
  { keys: ["⌫"], desc: "Delete selected block" },
  { keys: ["Esc"], desc: "Deselect" },
  { keys: ["⌘", "+"], desc: "Zoom in" },
  { keys: ["⌘", "−"], desc: "Zoom out" },
  { keys: ["⌘", "0"], desc: "Reset zoom" },
  { keys: ["?"], desc: "Toggle this panel" },
]

interface KeyboardShortcutsProps {
  zoom: number
  onZoomChange: (z: number) => void
  tenantId: string
  pageId: string | null
}

export function KeyboardShortcuts({ zoom, onZoomChange, tenantId, pageId }: KeyboardShortcutsProps) {
  const [open, setOpen] = useState(false)
  const savingRef = useRef(false)
  const { actions, query } = useEditor((_s, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const handleShortcuts = useCallback((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    const tag = (e.target as HTMLElement)?.tagName
    const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable

    // Zoom — works even when input is focused (like Figma)
    if (mod && (e.key === "+" || e.key === "=")) {
      e.preventDefault()
      onZoomChange(zoomIn(zoom))
      return
    }
    if (mod && e.key === "-") {
      e.preventDefault()
      onZoomChange(zoomOut(zoom))
      return
    }
    if (mod && e.key === "0") {
      e.preventDefault()
      onZoomChange(1)
      return
    }

    // ⌘S — save (works even in inputs, debounced)
    if (mod && e.key === "s") {
      e.preventDefault()
      if (savingRef.current) return
      savingRef.current = true
      const json = query.serialize()
      saveDraftAction(tenantId, json, pageId ?? undefined)
        .then((r) => { if (r.success) toast.success("Draft saved"); else toast.error(r.error || "Failed to save") })
        .catch(() => toast.error("Failed to save"))
        .finally(() => { savingRef.current = false })
      return
    }

    // ⌘Z / ⌘⇧Z — undo/redo (works even in inputs for consistency)
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault()
      if (query.history.canUndo()) actions.history.undo()
      return
    }
    if (mod && e.key === "z" && e.shiftKey) {
      e.preventDefault()
      if (query.history.canRedo()) actions.history.redo()
      return
    }

    // Everything below: skip if user is typing in an input
    if (isInput) return

    // ? to toggle shortcuts panel
    if (e.key === "?") {
      e.preventDefault()
      setOpen((o) => !o)
      return
    }

    // Escape to deselect
    if (e.key === "Escape") {
      actions.selectNode(undefined as any)
      return
    }

    // Delete / Backspace
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault()
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") actions.delete(selected)
      return
    }

    // ⌘D to duplicate
    if (mod && e.key === "d") {
      e.preventDefault()
      const selected = query.getEvent("selected").first()
      if (!selected || selected === "ROOT") return
      try {
        const node = query.node(selected).get()
        const parentId = node.data.parent
        if (!parentId) return
        const siblings = query.node(parentId).get().data.nodes || []
        const tree = query.node(selected).toNodeTree()
        actions.addNodeTree(tree, parentId, siblings.indexOf(selected) + 1)
      } catch { /* node may not be duplicable */ }
    }
  }, [actions, query, zoom, onZoomChange, tenantId, pageId])

  useEffect(() => {
    window.addEventListener("keydown", handleShortcuts)
    return () => window.removeEventListener("keydown", handleShortcuts)
  }, [handleShortcuts])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div
        className="w-[340px] rounded-lg border border-border/50 bg-background p-5 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[12px] font-semibold text-foreground">Keyboard Shortcuts</h3>
          </div>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-muted-foreground">{s.desc}</span>
              <div className="flex items-center gap-0.5">
                {s.keys.map((key, i) => (
                  <kbd
                    key={i}
                    className="flex h-6 min-w-[24px] items-center justify-center rounded border border-border/50 bg-muted/50 px-1.5 text-[10px] font-medium text-foreground/80 shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[10px] text-muted-foreground/50">
          Press ? to toggle
        </p>
      </div>
    </div>
  )
}
