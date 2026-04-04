"use client"

import { Minus, Plus } from "lucide-react"
import { ZOOM_MIN, ZOOM_MAX, zoomIn, zoomOut } from "../zoom-utils"

interface ZoomControlProps {
  zoom: number
  onZoomChange: (z: number) => void
}

export function ZoomControl({ zoom, onZoomChange }: ZoomControlProps) {
  const pct = Math.round(zoom * 100)

  const btn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: 4,
    border: 'none', background: 'none', cursor: 'pointer',
    color: 'var(--editor-icon-secondary)', transition: 'background 0.1s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 1, padding: 2,
      borderRadius: 6, border: '1px solid var(--editor-border)',
      background: 'var(--editor-surface-secondary)',
    }}>
      <button onClick={() => onZoomChange(zoomOut(zoom))} disabled={zoom <= ZOOM_MIN} title="Zoom out (⌘−)" style={{ ...btn, opacity: zoom <= ZOOM_MIN ? 0.3 : 1 }}>
        <Minus style={{ width: 14, height: 14 }} />
      </button>
      <button onClick={() => onZoomChange(1)} title="Reset zoom (⌘0)" style={{ ...btn, width: 40, fontSize: 11, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>
        {pct}%
      </button>
      <button onClick={() => onZoomChange(zoomIn(zoom))} disabled={zoom >= ZOOM_MAX} title="Zoom in (⌘+)" style={{ ...btn, opacity: zoom >= ZOOM_MAX ? 0.3 : 1 }}>
        <Plus style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}
