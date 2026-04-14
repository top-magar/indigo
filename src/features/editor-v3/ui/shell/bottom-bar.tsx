"use client"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Maximize2 } from "lucide-react"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

export function BottomBar() {
  const s = useStore()
  const selected = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId) : null

  return (
    <div className="h-10 border-t bg-muted/30 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <SelectionBreadcrumb />
        {!s.selectedInstanceId && (
          <span className="text-[11px] text-muted-foreground/60 font-medium">{s.instances.size} elements</span>
        )}
        {selected && (
          <span className="text-[11px] text-muted-foreground/40 truncate max-w-[120px]">{selected.component}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">⌘ scroll to zoom</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 rounded-md focus-visible:ring-2 focus-visible:ring-ring" onClick={() => useEditorV3Store.getState().setZoom(100)}>
              <Maximize2 className="size-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">Fit to canvas (100%)</TooltipContent>
        </Tooltip>
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0">
          <Button variant="ghost" size="icon" className="size-7 rounded-md hover:bg-background focus-visible:ring-2 focus-visible:ring-ring" onClick={() => useEditorV3Store.getState().setZoom(s.zoom - 10)}>
            <span className="text-[12px] font-medium text-muted-foreground">−</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-[11px] font-medium text-foreground min-w-[48px] hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => useEditorV3Store.getState().setZoom(100)}>
            {s.zoom}%
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-md hover:bg-background focus-visible:ring-2 focus-visible:ring-ring" onClick={() => useEditorV3Store.getState().setZoom(s.zoom + 10)}>
            <span className="text-[12px] font-medium text-muted-foreground">+</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
