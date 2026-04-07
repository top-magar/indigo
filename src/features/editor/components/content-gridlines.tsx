"use client"

import { useEffect, useState, useCallback } from "react"

interface GridlineState {
  left: number
  right: number
  paddingLeft: number
  paddingRight: number
  canvasWidth: number
}

/**
 * Persistent content gridlines showing the safe area boundaries.
 * Reads --store-max-width and --store-section-gap-h from the canvas element.
 */
export function ContentGridlines({ visible }: { visible: boolean }) {
  const [state, setState] = useState<GridlineState | null>(null)

  const measure = useCallback(() => {
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return
    const frame = canvas.querySelector("[data-craft-node-id]")?.parentElement as HTMLElement | null
    if (!frame) return

    const cs = getComputedStyle(frame)
    const maxW = parseInt(cs.getPropertyValue("--store-max-width") || "1200", 10)
    const padH = parseInt(cs.getPropertyValue("--store-section-gap-h") || "24", 10)
    const cw = frame.clientWidth

    if (maxW <= 0 || maxW >= cw) {
      // Full width — gridlines at padding boundaries only
      setState({ left: padH, right: cw - padH, paddingLeft: padH, paddingRight: cw - padH, canvasWidth: cw })
    } else {
      const offset = (cw - maxW) / 2
      setState({ left: offset, right: cw - offset, paddingLeft: offset + padH, paddingRight: cw - offset - padH, canvasWidth: cw })
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    measure()
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    const frame = canvas?.querySelector("[data-craft-node-id]")?.parentElement as HTMLElement | null
    if (!frame) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(frame)
    window.addEventListener("resize", measure)
    return () => { ro.disconnect(); window.removeEventListener("resize", measure) }
  }, [visible, measure])

  if (!visible || !state) return null

  const { left, right, paddingLeft, paddingRight, canvasWidth } = state

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 overflow-visible" style={{ width: "100%", height: "100%" }}>
      {/* Content boundary lines (outer) */}
      <line x1={left} y1={0} x2={left} y2="100%" stroke="#e5e7eb" strokeWidth={1} opacity={0.6} />
      <line x1={right} y1={0} x2={right} y2="100%" stroke="#e5e7eb" strokeWidth={1} opacity={0.6} />
      {/* Padding inset lines (inner safe area) */}
      {paddingLeft !== left && (
        <>
          <line x1={paddingLeft} y1={0} x2={paddingLeft} y2="100%" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
          <line x1={paddingRight} y1={0} x2={paddingRight} y2="100%" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
        </>
      )}
      {/* Shaded margins */}
      <rect x={0} y={0} width={left} height="100%" fill="#f3f4f6" opacity={0.15} />
      <rect x={right} y={0} width={canvasWidth - right} height="100%" fill="#f3f4f6" opacity={0.15} />
    </svg>
  )
}
