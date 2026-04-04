"use client"

import { Minus, Plus } from "lucide-react"
import { ZOOM_MIN, ZOOM_MAX, zoomIn, zoomOut } from "../zoom-utils"

interface ZoomControlProps {
  zoom: number
  onZoomChange: (z: number) => void
}

export function ZoomControl({ zoom, onZoomChange }: ZoomControlProps) {
  const pct = Math.round(zoom * 100)

  const btnStyle: React.CSSProperties = {
    padding: 6, borderRadius: 6, border: 'none', background: 'none',
    cursor: 'pointer', color: 'var(--editor-icon-secondary)',
    transition: 'all 0.1s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: 2,
      borderRadius: 'var(--editor-radius)',
      border: '1px solid var(--editor-border)',
      background: 'var(--editor-surface-secondary)',
    }}>
      <button
        onClick={() => onZoomChange(zoomOut(zoom))}
        disabled={zoom <= ZOOM_MIN}
        title="Zoom out (⌘−)"
        style={{ ...btnStyle, opacity: zoom <= ZOOM_MIN ? 0.3 : 1 }}
      >
        <Minus className="h-3 w-3" />
      </button>
      <button
        onClick={() => onZoomChange(1)}
        title="Reset zoom (⌘0)"
        style={{
          ...btnStyle, minWidth: 40, textAlign: 'center',
          fontSize: 11, fontWeight: 500, color: 'var(--editor-text-secondary)',
        }}
      >
        {pct}%
      </button>
      <button
        onClick={() => onZoomChange(zoomIn(zoom))}
        disabled={zoom >= ZOOM_MAX}
        title="Zoom in (⌘+)"
        style={{ ...btnStyle, opacity: zoom >= ZOOM_MAX ? 0.3 : 1 }}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
