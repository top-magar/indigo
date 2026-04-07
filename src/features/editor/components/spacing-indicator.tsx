"use client"

import { useEditor } from "@craftjs/core"
import { useEffect, useState, useCallback } from "react"
import { useOverlayStore, type SpacingLine } from "../overlay-store"

/** Shows pixel distance measurements between selected and hovered nodes when Alt is held. */
export function SpacingIndicator() {
  const [altHeld, setAltHeld] = useState(false)
  const store = useOverlayStore()

  const { selectedId, hoveredId } = useEditor((state) => {
    const [sel] = state.events.selected
    const [hov] = state.events.hovered
    return { selectedId: sel || null, hoveredId: hov || null }
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Alt") setAltHeld(true) }
    const up = (e: KeyboardEvent) => { if (e.key === "Alt") { setAltHeld(false); store.setSpacing([]) } }
    const blur = () => { setAltHeld(false); store.setSpacing([]) }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", blur)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur) }
  }, [store])

  const compute = useCallback(() => {
    if (!altHeld || !selectedId || !hoveredId || selectedId === hoveredId) {
      store.setSpacing([])
      return
    }

    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    const selEl = document.querySelector(`[data-craft-node-id="${selectedId}"]`) as HTMLElement | null
    const hovEl = document.querySelector(`[data-craft-node-id="${hoveredId}"]`) as HTMLElement | null
    if (!canvas || !selEl || !hovEl) { store.setSpacing([]); return }

    let zoom = 1
    const scaled = canvas.querySelector("[style*='scale']") as HTMLElement | null
    if (scaled) {
      const t = getComputedStyle(scaled).transform
      if (t && t !== "none") { const m = t.match(/matrix\(([^,]+)/); if (m) zoom = parseFloat(m[1]) }
    }

    const cr = canvas.getBoundingClientRect()
    const toCanvas = (r: DOMRect) => ({
      top: (r.top - cr.top + canvas.scrollTop) / zoom,
      left: (r.left - cr.left + canvas.scrollLeft) / zoom,
      right: (r.right - cr.left + canvas.scrollLeft) / zoom,
      bottom: (r.bottom - cr.top + canvas.scrollTop) / zoom,
      centerX: (r.left + r.width / 2 - cr.left + canvas.scrollLeft) / zoom,
      centerY: (r.top + r.height / 2 - cr.top + canvas.scrollTop) / zoom,
    })

    const s = toCanvas(selEl.getBoundingClientRect())
    const h = toCanvas(hovEl.getBoundingClientRect())
    const lines: SpacingLine[] = []

    // Vertical gap (above or below)
    if (s.bottom <= h.top) {
      const x = Math.round((Math.max(s.left, h.left) + Math.min(s.right, h.right)) / 2)
      const gap = Math.round(h.top - s.bottom)
      if (gap > 0) lines.push({ x1: x, y1: s.bottom, x2: x, y2: h.top, label: `${gap}` })
    } else if (h.bottom <= s.top) {
      const x = Math.round((Math.max(s.left, h.left) + Math.min(s.right, h.right)) / 2)
      const gap = Math.round(s.top - h.bottom)
      if (gap > 0) lines.push({ x1: x, y1: h.bottom, x2: x, y2: s.top, label: `${gap}` })
    }

    // Horizontal gap (left or right)
    if (s.right <= h.left) {
      const y = Math.round((Math.max(s.top, h.top) + Math.min(s.bottom, h.bottom)) / 2)
      const gap = Math.round(h.left - s.right)
      if (gap > 0) lines.push({ x1: s.right, y1: y, x2: h.left, y2: y, label: `${gap}` })
    } else if (h.right <= s.left) {
      const y = Math.round((Math.max(s.top, h.top) + Math.min(s.bottom, h.bottom)) / 2)
      const gap = Math.round(s.left - h.right)
      if (gap > 0) lines.push({ x1: h.right, y1: y, x2: s.left, y2: y, label: `${gap}` })
    }

    store.setSpacing(lines)
  }, [altHeld, selectedId, hoveredId, store])

  useEffect(() => { compute() }, [compute])

  return null
}
