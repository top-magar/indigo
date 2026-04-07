"use client"

import { useMemo } from "react"
import { GRID } from "../grid-tokens"
import { useGridMeasure } from "../use-grid-measure"

export function ColumnGridOverlay({ visible }: { visible: boolean }) {
  const g = useGridMeasure(visible)

  const cols = useMemo(() => {
    if (!g) return null
    const { frameLeft, frameWidth, maxW, padH, zoom } = g
    const scaledPad = padH * zoom
    const contentW = maxW > 0 && maxW * zoom < frameWidth ? maxW * zoom : frameWidth
    const contentLeft = maxW > 0 && maxW * zoom < frameWidth
      ? frameLeft + (frameWidth - maxW * zoom) / 2 + scaledPad
      : frameLeft + scaledPad
    const usable = contentW - scaledPad * 2

    // Responsive column count based on visual frame width
    const numCols = frameWidth <= 375 ? 4 : frameWidth <= 768 ? 8 : GRID.columns
    const gutter = (frameWidth <= 375 ? 16 : frameWidth <= 768 ? 20 : GRID.gutter) * zoom
    const colWidth = (usable - gutter * (numCols - 1)) / numCols

    return Array.from({ length: numCols }, (_, i) => ({
      x: contentLeft + i * (colWidth + gutter),
      width: colWidth,
    }))
  }, [g])

  if (!visible || !cols || !g) return null

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 overflow-visible" style={{ width: "100%", height: g.canvasScrollHeight }}>
      {cols.map((c, i) => (
        <rect key={i} x={c.x} y={0} width={c.width} height="100%" fill="#8b5cf6" opacity={0.04} />
      ))}
    </svg>
  )
}
