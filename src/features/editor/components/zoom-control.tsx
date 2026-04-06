"use client"

import { Minus, Plus } from "lucide-react"
import { ZOOM_MIN, ZOOM_MAX, zoomIn, zoomOut } from "../zoom-utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function ZoomControl({ zoom, onZoomChange }: { zoom: number; onZoomChange: (z: number) => void }) {
  const pct = Math.round(zoom * 100)

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border" style={{ borderColor: 'var(--editor-border)' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onZoomChange(zoomOut(zoom))} disabled={zoom <= ZOOM_MIN}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom out (⌘−)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-10 text-[11px] font-medium" onClick={() => onZoomChange(1)}>
            {pct}%
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset zoom (⌘0)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onZoomChange(zoomIn(zoom))} disabled={zoom >= ZOOM_MAX}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom in (⌘+)</TooltipContent>
      </Tooltip>
    </div>
  )
}
