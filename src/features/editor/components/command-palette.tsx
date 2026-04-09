"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useEditor } from "@craftjs/core"
import { Search, Plus, Undo2, Redo2, Save, Eye, Layers, Palette, Zap } from "lucide-react"
import { saveDraftAction } from "../actions/actions"
import { useEditorContext } from "../editor-context"
import { toast } from "sonner"

interface Command {
  id: string
  label: string
  category: string
  icon: typeof Plus
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onAddSection?: () => void
  onOpenTheme?: () => void
}

export function CommandPalette({ open, onClose, onAddSection, onOpenTheme }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { actions, query: editorQuery } = useEditor()
  const { tenantId, pageId } = useEditorContext()

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const commands: Command[] = [
    { id: "add-section", label: "Add Section", category: "Create", icon: Plus, action: () => { onAddSection?.(); onClose() } },
    { id: "undo", label: "Undo", category: "Edit", icon: Undo2, action: () => { if (editorQuery.history.canUndo()) actions.history.undo(); onClose() } },
    { id: "redo", label: "Redo", category: "Edit", icon: Redo2, action: () => { if (editorQuery.history.canRedo()) actions.history.redo(); onClose() } },
    { id: "save", label: "Save Draft", category: "File", icon: Save, action: () => {
      const json = editorQuery.serialize()
      saveDraftAction(tenantId, json, pageId ?? undefined).then((r) => { if (r.success) toast.success("Saved"); else toast.error(r.error || "Failed") })
      onClose()
    }},
    { id: "deselect", label: "Deselect All", category: "Edit", icon: Layers, action: () => { actions.clearEvents(); onClose() } },
    { id: "theme", label: "Open Site Styles", category: "Navigate", icon: Palette, action: () => { onOpenTheme?.(); onClose() } },
  ]

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : commands

  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => { setSelectedIdx(0) }, [query])

  const run = useCallback((idx: number) => {
    const cmd = filtered[idx]
    if (cmd) cmd.action()
  }, [filtered])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); run(selectedIdx) }
    else if (e.key === "Escape") onClose()
  }, [filtered.length, selectedIdx, run, onClose])

  if (!open) return null

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20vh" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", width: 480, maxHeight: 400, background: "#fff", borderRadius: 12, boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Type a command…" autoFocus
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent" }} />
          <kbd style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "#f3f4f6", color: "#6b7280" }}>esc</kbd>
        </div>
        <div style={{ overflowY: "auto", maxHeight: 340 }}>
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No matching commands</div>}
          {filtered.map((cmd, i) => (
            <button key={cmd.id} onClick={() => run(i)} onMouseEnter={() => setSelectedIdx(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, background: i === selectedIdx ? "#f3f4f6" : "transparent", color: "#111827" }}>
              <cmd.icon className="size-4 text-muted-foreground shrink-0" />
              <span style={{ flex: 1 }}>{cmd.label}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{cmd.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
