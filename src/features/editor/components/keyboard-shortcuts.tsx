"use client"

import { useEditor } from "@craftjs/core"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Keyboard } from "lucide-react"
import { useSaveStore } from "../save-store"
import { useCommandStore } from "../command-store"
import { useEditorContext } from "../editor-context"
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
  onAddSection?: () => void
}

export function KeyboardShortcuts({ zoom, onZoomChange, onAddSection }: KeyboardShortcutsProps) {
  const { tenantId, pageId } = useEditorContext()
  const [open, setOpen] = useState(false)
  const clipboardRef = useRef<{ tree: any; parentId: string } | null>(null)
  const styleClipboardRef = useRef<Record<string, unknown> | null>(null)
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
      useSaveStore.getState().save().then(() => {
        const { error } = useSaveStore.getState()
        if (error) toast.error(error); else toast.success("Draft saved")
      })
      return
    }

    // ⌘Z / ⌘⇧Z — unified undo/redo via interleaved timeline
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault()
      const cmd = useCommandStore.getState()
      const source = cmd.popTimeline()
      if (source === "command") { cmd.undo() }
      else if (source === "craft") { if (query.history.canUndo()) actions.history.undo() }
      return
    }
    if (mod && e.key === "z" && e.shiftKey) {
      e.preventDefault()
      const cmd = useCommandStore.getState()
      // Try redo on both stacks — push back to timeline
      if (cmd.canRedo()) { cmd.redo(); cmd.pushTimeline("command") }
      else if (query.history.canRedo()) { actions.history.redo(); cmd.pushTimeline("craft") }
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

    // ⌘⇧C — copy style
    if (mod && e.shiftKey && e.key === "c") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") {
        e.preventDefault()
        styleClipboardRef.current = query.node(selected).get().data.props ?? {}
        toast.success("Style copied")
      }
      return
    }

    // ⌘⇧V — paste style
    if (mod && e.shiftKey && e.key === "v") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT" && styleClipboardRef.current) {
        e.preventDefault()
        const style = styleClipboardRef.current
        actions.setProp(selected, (p: Record<string, unknown>) => {
          for (const k of ["backgroundColor", "textColor", "padding", "margin", "borderRadius"]) {
            if (style[k] !== undefined) p[k] = style[k]
          }
        })
        toast.success("Style pasted")
      }
      return
    }

    // ⌘/ — add section
    if (mod && e.key === "/") {
      e.preventDefault()
      onAddSection?.()
      return
    }
  }, [actions, query, zoom, onZoomChange, tenantId, pageId, onAddSection])

  useEffect(() => {
    window.addEventListener("keydown", handleShortcuts)
    return () => window.removeEventListener("keydown", handleShortcuts)
  }, [handleShortcuts])

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton className="max-w-[340px] p-5 !bg-background !border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[13px]">
            <Keyboard className="h-4 w-4" style={{ color: "var(--editor-icon-secondary)" }} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">{s.desc}</span>
              <div className="flex items-center gap-0.5">
                {s.keys.map((key, i) => (
                  <kbd key={i} className="flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium border-border bg-muted text-foreground">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">Press ? to toggle</p>
      </DialogContent>
    </Dialog>
  )
}
