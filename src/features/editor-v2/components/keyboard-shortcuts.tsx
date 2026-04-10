"use client"

import { useEffect } from "react"
import { useEditorStore } from "../store"

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function KeyboardShortcuts({ onSave }: { onSave: () => void }) {
  const { selectedId, duplicateSection, removeSection, selectSection, copySection, pasteSection, zoom, setZoom } = useEditorStore()

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
      if (meta && e.key === "c" && !inInput && selectedId) {
        e.preventDefault()
        copySection(selectedId)
        return
      }
      if (meta && e.key === "v" && !inInput) {
        e.preventDefault()
        pasteSection()
        return
      }
      if (meta && (e.key === "=" || e.key === "+")) {
        e.preventDefault()
        setZoom(zoom + 10)
        return
      }
      if (meta && e.key === "-") {
        e.preventDefault()
        setZoom(zoom - 10)
        return
      }
      if (meta && e.key === "0") {
        e.preventDefault()
        setZoom(100)
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
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !inInput && selectedId) {
        e.preventDefault()
        const { sections } = useEditorStore.getState()
        const idx = sections.findIndex((s) => s.id === selectedId)
        if (idx === -1) return
        const next = e.key === "ArrowUp" ? idx - 1 : idx + 1
        if (next >= 0 && next < sections.length) selectSection(sections[next].id)
        return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, duplicateSection, removeSection, selectSection, onSave, copySection, pasteSection, zoom, setZoom])

  return null
}
