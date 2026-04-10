"use client"

import { useEffect } from "react"
import { useEditorStore } from "../store"

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function KeyboardShortcuts({ onSave }: { onSave: () => void }) {
  const { selectedId, duplicateSection, removeSection, selectSection } = useEditorStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const inInput = INPUT_TAGS.has((e.target as HTMLElement).tagName)

      if (meta && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
        return
      }
      if (meta && e.key === "z" && e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
        return
      }
      if (meta && e.key === "s") {
        e.preventDefault()
        onSave()
        return
      }
      if (meta && e.key === "d" && selectedId) {
        e.preventDefault()
        duplicateSection(selectedId)
        return
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !inInput && selectedId) {
        e.preventDefault()
        removeSection(selectedId)
        return
      }
      if (e.key === "Escape") {
        selectSection(null)
        return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, duplicateSection, removeSection, selectSection, onSave])

  return null
}
