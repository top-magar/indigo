"use client"

import { useEditor } from "@craftjs/core"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Keyboard } from "lucide-react"
import { saveDraftAction } from "../actions"
import { toast } from "sonner"
import { zoomIn, zoomOut } from "../zoom-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const shortcuts = [
  { keys: ["⌘", "S"], desc: "Save draft" },
  { keys: ["⌘", "Z"], desc: "Undo" },
  { keys: ["⌘", "⇧", "Z"], desc: "Redo" },
  { keys: ["⌘", "C"], desc: "Copy selected block" },
  { keys: ["⌘", "V"], desc: "Paste block" },
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
  const clipboardRef = useRef<{ tree: any; parentId: string } | null>(null)
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

    // ⌘C — copy selected block
    if (mod && e.key === "c" && !e.shiftKey && !isInput) {
      const selected = query.getEvent("selected").first()
      if (!selected || selected === "ROOT") return
      try {
        const node = query.node(selected).get()
        clipboardRef.current = { tree: query.node(selected).toNodeTree(), parentId: node.data.parent! }
        toast.success("Block copied")
      } catch { /* ignore */ }
      return
    }

    // ⌘V — paste copied block
    if (mod && e.key === "v" && !e.shiftKey && !isInput) {
      if (!clipboardRef.current) return
      e.preventDefault()
      try {
        const { tree, parentId } = clipboardRef.current
        // Re-serialize and re-parse to get fresh node IDs
        const freshTree = query.node(Object.keys(tree.nodes)[0]).toNodeTree()
        actions.addNodeTree(freshTree || tree, parentId)
        toast.success("Block pasted")
      } catch {
        // Fallback: paste into ROOT's first canvas child
        try {
          actions.addNodeTree(clipboardRef.current.tree, "ROOT")
          toast.success("Block pasted")
        } catch { toast.error("Cannot paste here") }
      }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton className="editor-panel-scope max-w-[340px] p-5 !bg-[var(--editor-surface)] !border-[var(--editor-border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[13px]">
            <Keyboard className="h-4 w-4" style={{ color: "var(--editor-icon-secondary)" }} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between py-1">
              <span className="text-xs" style={{ color: "var(--editor-text-secondary)" }}>{s.desc}</span>
              <div className="flex items-center gap-0.5">
                {s.keys.map((key, i) => (
                  <kbd key={i} className="flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium"
                    style={{ borderColor: "var(--editor-border)", background: "var(--editor-surface-secondary)", color: "var(--editor-text)" }}>
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--editor-text-disabled)" }}>Press ? to toggle</p>
      </DialogContent>
    </Dialog>
  )
}
