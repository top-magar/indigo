"use client"

import { Minus, Plus } from "lucide-react"
import { ZOOM_MIN, ZOOM_MAX, zoomIn, zoomOut } from "../zoom-utils"

interface ZoomControlProps {
  zoom: number
  onZoomChange: (z: number) => void
}

export function ZoomControl({ zoom, onZoomChange }: ZoomControlProps) {
  const pct = Math.round(zoom * 100)

  return (
    <div className="flex items-center gap-0.5 rounded border border-border/50 bg-muted/40 p-0.5">
      <button
        onClick={() => onZoomChange(zoomOut(zoom))}
        disabled={zoom <= ZOOM_MIN}
        className="rounded p-1.5 text-foreground/70 transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/30"
        title="Zoom out (⌘−)"
        aria-label="Zoom out"
      >
        <Minus className="h-3 w-3" />
      </button>
      <button
        onClick={() => onZoomChange(1)}
        className="min-w-[40px] rounded px-1.5 py-1 text-center text-[10px] font-medium text-foreground/70 transition-colors hover:bg-background hover:text-foreground"
        title="Reset zoom (⌘0)"
        aria-label={`Zoom ${pct}%, click to reset`}
      >
        {pct}%
      </button>
      <button
        onClick={() => onZoomChange(zoomIn(zoom))}
        disabled={zoom >= ZOOM_MAX}
        className="rounded p-1.5 text-foreground/70 transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/30"
        title="Zoom in (⌘+)"
        aria-label="Zoom in"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
