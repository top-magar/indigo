import { useEffect } from "react"
import { useEditorStore } from "@/features/editor/store"
import { toast } from "sonner"

interface UseEditorShortcutsOptions {
  onSave: () => void
  onOpenCommandPalette?: () => void
  onOpenBlockPalette?: () => void
  onOpenAiDialog?: () => void
}

export function useEditorShortcuts({
  onSave,
  onOpenCommandPalette,
  onOpenBlockPalette,
  onOpenAiDialog,
}: UseEditorShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const mod = e.metaKey || e.ctrlKey

      // Undo/Redo — Cmd+Z / Cmd+Shift+Z
      if (mod && e.key === "z") {
        e.preventDefault()
        const { undo, redo } = useEditorStore.getState()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      // Save — Cmd+S
      if (mod && e.key === "s") {
        e.preventDefault()
        onSave()
        return
      }

      // Command palette — Cmd+K
      if (mod && e.key === "k") {
        e.preventDefault()
        onOpenCommandPalette?.()
        return
      }

      // Block palette — Cmd+/
      if (mod && e.key === "/") {
        e.preventDefault()
        onOpenBlockPalette?.()
        return
      }

      // AI dialog — Cmd+Shift+G
      if (mod && e.shiftKey && e.key === "g") {
        e.preventDefault()
        onOpenAiDialog?.()
        return
      }

      // Copy — Cmd+C
      if (mod && e.key === "c") {
        const { selectedBlockId, copyBlock } = useEditorStore.getState()
        if (selectedBlockId) {
          e.preventDefault()
          copyBlock(selectedBlockId)
          toast.success("Copied", { duration: 2000 })
        }
        return
      }

      // Paste — Cmd+V
      if (mod && e.key === "v") {
        const { clipboardBlock, pasteBlock } = useEditorStore.getState()
        if (clipboardBlock) {
          e.preventDefault()
          pasteBlock()
          toast.success("Pasted", { duration: 2000 })
        }
        return
      }

      // Duplicate — Cmd+D
      if (mod && e.key === "d") {
        const { selectedBlockId, blocks, duplicateBlock } = useEditorStore.getState()
        if (selectedBlockId) {
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block && block.type !== "header" && block.type !== "footer") {
            e.preventDefault()
            duplicateBlock(selectedBlockId)
            toast.success("Duplicated", { duration: 2000 })
          }
        }
        return
      }

      // Toggle visibility — Cmd+H
      if (mod && e.key === "h") {
        const { selectedBlockId, blocks, updateBlock } = useEditorStore.getState()
        if (selectedBlockId) {
          e.preventDefault()
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block) {
            updateBlock(selectedBlockId, { visible: !block.visible })
            toast.success(block.visible ? "Hidden" : "Visible", { duration: 2000 })
          }
        }
        return
      }

      // Delete — Backspace/Delete
      if (e.key === "Backspace" || e.key === "Delete") {
        const { selectedBlockId, blocks, removeBlock } = useEditorStore.getState()
        if (selectedBlockId) {
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block && block.type !== "header" && block.type !== "footer") {
            e.preventDefault()
            removeBlock(selectedBlockId)
            toast.success("Deleted", { duration: 2000 })
          }
        }
        return
      }

      // Viewport switching — 1, 2, 3 (no modifier)
      if (!mod && !e.altKey) {
        const { setViewport } = useEditorStore.getState()
        if (e.key === "1") { e.preventDefault(); setViewport("desktop") }
        if (e.key === "2") { e.preventDefault(); setViewport("tablet") }
        if (e.key === "3") { e.preventDefault(); setViewport("mobile") }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSave, onOpenCommandPalette, onOpenBlockPalette, onOpenAiDialog])
}
