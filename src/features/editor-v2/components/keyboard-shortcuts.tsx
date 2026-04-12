"use client"

import { useEffect } from "react"
import { useEditorStore } from "../store"

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function KeyboardShortcuts({ onSave, onFind, onShortcuts }: { onSave: () => void; onFind: () => void; onShortcuts: () => void }) {
  const selectedId = useEditorStore(s => s.selectedId)
  const selectedIds = useEditorStore(s => s.selectedIds)
  const duplicateSection = useEditorStore(s => s.duplicateSection)
  const removeSection = useEditorStore(s => s.removeSection)
  const selectSection = useEditorStore(s => s.selectSection)
  const selectAll = useEditorStore(s => s.selectAll)
  const copySection = useEditorStore(s => s.copySection)
  const pasteSection = useEditorStore(s => s.pasteSection)
  const copyStyle = useEditorStore(s => s.copyStyle)
  const pasteStyle = useEditorStore(s => s.pasteStyle)
  const zoom = useEditorStore(s => s.zoom)
  const setZoom = useEditorStore(s => s.setZoom)

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
      if (meta && e.key === "f" && !inInput) {
        e.preventDefault()
        onFind()
        return
      }
      if (meta && (e.key === "/" || e.key === "?")) {
        e.preventDefault()
        onShortcuts()
        return
      }
      if (meta && e.key === "a" && !inInput) {
        e.preventDefault()
        selectAll()
        return
      }
      if (meta && e.altKey && e.key === "c" && !inInput) {
        e.preventDefault()
        copyStyle()
        return
      }
      if (meta && e.altKey && e.key === "v" && !inInput) {
        e.preventDefault()
        pasteStyle()
        return
      }
      if (meta && e.key === "c" && !e.altKey && !inInput && selectedId) {
        e.preventDefault()
        copySection(selectedId)
        return
      }
      if (meta && e.key === "v" && !e.altKey && !inInput) {
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
      if ((e.key === "Delete" || e.key === "Backspace") && !inInput && selectedIds.length > 0) {
        e.preventDefault()
        for (const id of [...selectedIds]) removeSection(id)
        return
      }
      if (e.key === "Escape") {
        selectSection(null)
        return
      }
      // Alt+Arrow: nudge padding
      if (e.altKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && !inInput && selectedId) {
        e.preventDefault()
        const delta = e.shiftKey ? 10 : 1
        const propMap: Record<string, string> = { ArrowUp: "_paddingTop", ArrowDown: "_paddingBottom", ArrowLeft: "_paddingLeft", ArrowRight: "_paddingRight" }
        const prop = propMap[e.key]
        const sec = useEditorStore.getState().sections.find((s) => s.id === selectedId)
        if (!sec || !prop) return
        const cur = (sec.props[prop] as number) ?? 0
        const sign = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1
        useEditorStore.getState().updateProps(selectedId, { [prop]: Math.max(0, cur + sign * delta) })
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
  }, [selectedId, selectedIds, duplicateSection, removeSection, selectSection, selectAll, onSave, onFind, onShortcuts, copySection, pasteSection, copyStyle, pasteStyle, zoom, setZoom])

  return null
}
