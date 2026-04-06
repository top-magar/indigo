"use client"

import { useEffect, useState, useCallback } from "react"
import { GRID } from "../grid-tokens"

interface ColGrid {
  contentLeft: number
  colWidth: number
  gutter: number
}

/**
 * 12-column grid overlay (Figma-style).
 * Renders semi-transparent columns within the content safe area.
 * Toggle with ⌘G.
 */
export function ColumnGridOverlay({ visible }: { visible: boolean }) {
  const [grid, setGrid] = useState<ColGrid | null>(null)

  const measure = useCallback(() => {
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return
    const frame = canvas.querySelector("[data-craft-node-id]")?.parentElement as HTMLElement | null
    if (!frame) return

    const cs = getComputedStyle(frame)
    const maxW = parseInt(cs.getPropertyValue("--store-max-width") || "1200", 10)
    const padH = parseInt(cs.getPropertyValue("--store-section-gap-h") || "24", 10)
    const cw = frame.clientWidth

    const contentW = maxW > 0 && maxW < cw ? maxW : cw
    const contentLeft = maxW > 0 && maxW < cw ? (cw - maxW) / 2 + padH : padH
    const usable = contentW - padH * 2
    const gutter = GRID.gutter
    const colWidth = (usable - gutter * (GRID.columns - 1)) / GRID.columns

    setGrid({ contentLeft, colWidth, gutter })
  }, [])

  useEffect(() => {
    if (!visible) return
    measure()
    const id = setInterval(measure, 500)
    window.addEventListener("resize", measure)
    return () => { clearInterval(id); window.removeEventListener("resize", measure) }
  }, [visible, measure])

  if (!visible || !grid) return null

  const cols = Array.from({ length: GRID.columns }, (_, i) => i)

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 overflow-visible" style={{ width: "100%", height: "100%" }}>
      {cols.map((i) => {
        const x = grid.contentLeft + i * (grid.colWidth + grid.gutter)
        return (
          <rect key={i} x={x} y={0} width={grid.colWidth} height="100%" fill="#8b5cf6" opacity={0.04} />
        )
      })}
    </svg>
  )
}
