"use client"

import { useCallback, useRef } from "react"
import { useNodeRects, type NodeRect } from "../use-node-rects"
import { useOverlayStore, type GuideLine } from "../overlay-store"

type Edge = "right" | "bottom" | "bottom-right"

const SNAP_THRESHOLD = 5

interface ResizeHandlesProps {
  onResize: (dw: number, dh: number, edge: Edge) => void
  onResizeEnd: () => void
  nodeId: string
}

function findSnapGuides(resizingRect: NodeRect, others: NodeRect[]): GuideLine[] {
  const guides: GuideLine[] = []
  const seen = new Set<string>()

  for (const other of others) {
    // Vertical guides (x-axis alignment)
    const xPairs: [number, number][] = [
      [resizingRect.right, other.right],
      [resizingRect.right, other.left],
      [resizingRect.left, other.left],
      [resizingRect.left, other.right],
      [resizingRect.centerX, other.centerX],
    ]
    for (const [a, b] of xPairs) {
      if (Math.abs(a - b) < SNAP_THRESHOLD) {
        const key = `x:${Math.round(b)}`
        if (!seen.has(key)) { seen.add(key); guides.push({ axis: "x", position: b }) }
      }
    }

    // Horizontal guides (y-axis alignment)
    const yPairs: [number, number][] = [
      [resizingRect.bottom, other.bottom],
      [resizingRect.bottom, other.top],
      [resizingRect.top, other.top],
      [resizingRect.top, other.bottom],
      [resizingRect.centerY, other.centerY],
    ]
    for (const [a, b] of yPairs) {
      if (Math.abs(a - b) < SNAP_THRESHOLD) {
        const key = `y:${Math.round(b)}`
        if (!seen.has(key)) { seen.add(key); guides.push({ axis: "y", position: b }) }
      }
    }
  }

  return guides
}

export function ResizeHandles({ onResize, onResizeEnd, nodeId }: ResizeHandlesProps) {
  const startRef = useRef<{ x: number; y: number; edge: Edge } | null>(null)
  const getRects = useNodeRects()
  const store = useOverlayStore()

  const handlePointerDown = useCallback((edge: Edge) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startRef.current = { x: e.clientX, y: e.clientY, edge }

    const onMove = (ev: PointerEvent) => {
      if (!startRef.current) return
      const dx = ev.clientX - startRef.current.x
      const dy = ev.clientY - startRef.current.y
      startRef.current.x = ev.clientX
      startRef.current.y = ev.clientY
      onResize(edge === "bottom" ? 0 : dx, edge === "right" ? 0 : dy, edge)

      // Compute snap guides
      const others = getRects(nodeId)
      const el = document.querySelector(`[data-craft-node-id="${nodeId}"]`) as HTMLElement | null
      const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
      if (el && canvas) {
        let zoom = 1
        const zoomed = canvas.querySelector("[style*='zoom']") as HTMLElement | null
        if (zoomed) { const z = parseFloat(zoomed.style.zoom || "1"); if (z > 0) zoom = z }
        const r = el.getBoundingClientRect()
        const cr = canvas.getBoundingClientRect()
        const current: NodeRect = {
          id: nodeId,
          top: (r.top - cr.top + canvas.scrollTop) / zoom,
          left: (r.left - cr.left + canvas.scrollLeft) / zoom,
          width: r.width / zoom,
          height: r.height / zoom,
          right: (r.left - cr.left + canvas.scrollLeft + r.width) / zoom,
          bottom: (r.top - cr.top + canvas.scrollTop + r.height) / zoom,
          centerX: (r.left - cr.left + canvas.scrollLeft + r.width / 2) / zoom,
          centerY: (r.top - cr.top + canvas.scrollTop + r.height / 2) / zoom,
        }
        store.setGuides(findSnapGuides(current, others))
      }
    }

    const onUp = () => {
      startRef.current = null
      store.setGuides([])
      onResizeEnd()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }, [onResize, onResizeEnd, nodeId, getRects, store])

  const base = "absolute z-30 opacity-0 hover:opacity-100 transition-opacity"
  const handleColor = { background: 'var(--editor-accent, #005bd3)' }

  return (
    <>
      <div className={`${base} top-2 -right-1 w-2 cursor-ew-resize rounded-full`} style={{ bottom: 16, ...handleColor }} onPointerDown={handlePointerDown("right")} />
      <div className={`${base} -bottom-1 left-2 h-2 cursor-ns-resize rounded-full`} style={{ right: 16, ...handleColor }} onPointerDown={handlePointerDown("bottom")} />
      <div className={`${base} -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded`} style={handleColor} onPointerDown={handlePointerDown("bottom-right")} />
    </>
  )
}
