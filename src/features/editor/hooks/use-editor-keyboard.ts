"use client"

/**
 * Visual editor keyboard shortcuts — extracted from visual-editor.tsx.
 * 
 * Technique: Separating Data & Instructions (Ch. 4) — shortcut definitions
 * are data, handler logic is instructions.
 */

import { useEffect } from "react"
import { useEditorStore } from "@/features/editor/store"
import type { EditorMode } from "@/features/editor/types"
import { toast } from "sonner"

interface UseEditorKeyboardOptions {
  onSave: () => void
  onAiDialog: () => void
  canCopy: boolean
  canPaste: boolean
  clipboardCopy: () => Promise<void>
  clipboardPaste: () => Promise<void>
  editorMode: EditorMode
}

export function useEditorKeyboard({
  onSave,
  onAiDialog,
  canCopy,
  canPaste,
  clipboardCopy,
  clipboardPaste,
  editorMode,
}: UseEditorKeyboardOptions) {
  const blocks = useEditorStore((s) => s.blocks)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const { selectBlock, updateBlock, removeBlock, duplicateBlock, undo, redo, setViewport, setEditorMode, toggleSnapping } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const mod = e.metaKey || e.ctrlKey

      // ⌘Z / ⌘⇧Z — Undo/Redo
      if (mod && e.key === "z") {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
        return
      }
      // ⌘S — Save
      if (mod && e.key === "s") { e.preventDefault(); onSave(); return }
      // ⌘⇧G — AI Generate
      if (mod && e.shiftKey && e.key === "g") { e.preventDefault(); onAiDialog(); return }
      // ⌘C — Copy
      if (mod && e.key === "c" && canCopy) {
        e.preventDefault()
        clipboardCopy().then(() => toast.success("Copied", { duration: 2000 }))
        return
      }
      // ⌘V — Paste
      if (mod && e.key === "v" && canPaste) {
        e.preventDefault()
        clipboardPaste().then(() => toast.success("Pasted", { duration: 2000 }))
        return
      }
      // ⌘D — Duplicate
      if (mod && e.key === "d" && selectedBlockId) {
        const block = blocks.find((b) => b.id === selectedBlockId)
        if (block && block.type !== "header" && block.type !== "footer") {
          e.preventDefault()
          duplicateBlock(selectedBlockId)
          toast.success("Duplicated", { duration: 2000 })
        }
        return
      }
      // ⌘H — Toggle visibility
      if (mod && e.key === "h" && selectedBlockId) {
        e.preventDefault()
        const block = blocks.find((b) => b.id === selectedBlockId)
        if (block) updateBlock(selectedBlockId, { visible: !block.visible })
        return
      }
      // ⌘G — Toggle snapping
      if (mod && e.key === "g") {
        e.preventDefault()
        toggleSnapping()
        toast.info("Snapping toggled", { duration: 1500 })
        return
      }
      // Delete/Backspace
      if ((e.key === "Backspace" || e.key === "Delete") && selectedBlockId) {
        const block = blocks.find((b) => b.id === selectedBlockId)
        if (block && block.type !== "header" && block.type !== "footer") {
          e.preventDefault()
          removeBlock(selectedBlockId)
          toast.success("Deleted", { duration: 2000 })
        }
        return
      }
      // Unmodified keys
      if (!mod && !e.altKey) {
        if (e.key === "1") { e.preventDefault(); setViewport("desktop") }
        if (e.key === "2") { e.preventDefault(); setViewport("tablet") }
        if (e.key === "3") { e.preventDefault(); setViewport("mobile") }
        if (e.key === "p" || e.key === "P") {
          e.preventDefault()
          setEditorMode(editorMode === "edit" ? "preview" : "edit")
        }
      }
      if (e.key === "Escape") selectBlock(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, selectBlock, clipboardCopy, clipboardPaste, canCopy, canPaste, selectedBlockId, blocks, duplicateBlock, updateBlock, removeBlock, setViewport, editorMode, setEditorMode, toggleSnapping, onSave, onAiDialog])
}
