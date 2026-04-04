"use client"

import { useCallback, useRef } from "react"

type Edge = "right" | "bottom" | "bottom-right"

interface ResizeHandlesProps {
  onResize: (dw: number, dh: number, edge: Edge) => void
  onResizeEnd: () => void
}

export function ResizeHandles({ onResize, onResizeEnd }: ResizeHandlesProps) {
  const startRef = useRef<{ x: number; y: number; edge: Edge } | null>(null)

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
      onResize(
        edge === "bottom" ? 0 : dx,
        edge === "right" ? 0 : dy,
        edge
      )
    }

    const onUp = () => {
      startRef.current = null
      onResizeEnd()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }, [onResize, onResizeEnd])

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
