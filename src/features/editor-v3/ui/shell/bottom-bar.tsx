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
    <div className="h-8 border-t bg-muted/30 flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <SelectionBreadcrumb />
        {!s.selectedInstanceId && (
          <span className="text-[10px] text-muted-foreground/70 font-medium">{s.instances.size} elements</span>
        )}
        {selected && (
          <span className="text-[10px] text-muted-foreground/50 truncate max-w-[120px]">{selected.component}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted-foreground/40 hidden sm:inline">⌘ scroll to zoom</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(100)}>
              <Maximize2 className="size-3 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px]">Fit to canvas (100%)</TooltipContent>
        </Tooltip>
        <div className="flex items-center bg-muted rounded-md p-0.5 gap-0">
          <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom - 10)}>
            <span className="text-[11px] font-medium text-muted-foreground">−</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2.5 rounded-sm text-[11px] font-medium text-foreground min-w-[48px] hover:bg-background"
            onClick={() => useEditorV3Store.getState().setZoom(100)}>
            {s.zoom}%
          </Button>
          <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom + 10)}>
            <span className="text-[11px] font-medium text-muted-foreground">+</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
