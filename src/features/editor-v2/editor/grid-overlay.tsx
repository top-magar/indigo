"use client"

import { GRID } from "../core/tokens"
import { useEditorStore } from "./store"

export function GridOverlay() {
  const show = useEditorStore((s) => s.showGridlines)
  const viewport = useEditorStore((s) => s.viewport)
  if (!show) return null

  const cols = GRID.columns[viewport]
  const gutter = GRID.gutter[viewport]

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "var(--v2-max-width, 1200px)", padding: `0 var(--v2-section-gap-h, 24px)`, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gutter }}>
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} style={{ backgroundColor: "rgba(99, 102, 241, 0.07)", height: "100%" }} />
        ))}
      </div>
    </div>
  )
}
