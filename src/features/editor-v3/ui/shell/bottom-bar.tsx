"use client"
import { Button } from "@/components/ui/button"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

export function BottomBar() {
  const s = useStore()

  return (
    <div className="h-8 border-t bg-muted/30 flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <SelectionBreadcrumb />
        {!s.selectedInstanceId && (
          <span className="text-[10px] text-muted-foreground/70 font-medium">{s.instances.size} elements</span>
        )}
      </div>
      <div className="flex items-center bg-muted rounded-md p-0.5 gap-0">
        <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom - 25)}>
          <span className="text-[11px] font-medium text-muted-foreground">−</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2.5 rounded-sm text-[11px] font-medium text-foreground min-w-[48px] hover:bg-background"
          onClick={() => useEditorV3Store.getState().setZoom(100)}>
          {s.zoom}%
        </Button>
        <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom + 25)}>
          <span className="text-[11px] font-medium text-muted-foreground">+</span>
        </Button>
      </div>
    </div>
  )
}
