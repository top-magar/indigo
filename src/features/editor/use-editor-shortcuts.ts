"use client"

import { useEffect, useCallback } from "react"
import { useEditor } from "@craftjs/core"
import { useStyleClipboard } from "./use-style-clipboard"

/**
 * Central keyboard shortcuts for the editor.
 * Must be rendered inside <Editor>.
 */
export function useEditorShortcuts(callbacks: {
  onAddSection?: () => void
}) {
  const { actions, query } = useEditor()
  const { copy, paste } = useStyleClipboard()

  const handler = useCallback((e: KeyboardEvent) => {
    // Don't intercept when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return

    const mod = e.metaKey || e.ctrlKey

    // Undo: Cmd+Z
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault()
      if (query.history.canUndo()) actions.history.undo()
      return
    }

    // Redo: Cmd+Shift+Z
    if (mod && e.key === "z" && e.shiftKey) {
      e.preventDefault()
      if (query.history.canRedo()) actions.history.redo()
      return
    }

    // Copy style: Cmd+Shift+C
    if (mod && e.shiftKey && e.key === "c") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") {
        e.preventDefault()
        const props = query.node(selected).get().data.props ?? {}
        copy(props)
      }
      return
    }

    // Paste style: Cmd+Shift+V
    if (mod && e.shiftKey && e.key === "v") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") {
        e.preventDefault()
        paste((cb) => actions.setProp(selected, cb))
      }
      return
    }

    // Delete: Backspace or Delete
    if (e.key === "Backspace" || e.key === "Delete") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") {
        e.preventDefault()
        actions.delete(selected)
      }
      return
    }

    // Deselect: Escape
    if (e.key === "Escape") {
      actions.selectNode(undefined as unknown as string)
      return
    }

    // Duplicate: Cmd+D
    if (mod && e.key === "d") {
      const selected = query.getEvent("selected").first()
      if (selected && selected !== "ROOT") {
        e.preventDefault()
        const tree = query.node(selected).toNodeTree()
        const parent = query.node(selected).get().data.parent
        if (parent) {
          const siblings = query.node(parent).get().data.nodes
          const idx = siblings.indexOf(selected)
          actions.addNodeTree(tree, parent, idx + 1)
        }
      }
      return
    }

    // Add section: Cmd+/
    if (mod && e.key === "/") {
      e.preventDefault()
      callbacks.onAddSection?.()
      return
    }
  }, [actions, query, callbacks])

  useEffect(() => {
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handler])
}
