"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useBreakpoint } from "../breakpoint-context"
import { Ruler } from "lucide-react"

export function SizeControl() {
  const breakpoint = useBreakpoint()

  const { selectedId, width, height, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, width: "" as number | "", height: "" as number | "" }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    return {
      selectedId: nodeId,
      width: bp._width ?? props._width ?? "" as number | "",
      height: bp._height ?? props._height ?? "" as number | "",
    }
  })

  if (!selectedId) return null

  const set = (key: "_width" | "_height", val: string) => {
    const num = val === "" ? undefined : Math.max(0, parseInt(val, 10) || 0)
    if (breakpoint !== "desktop") {
      actions.setProp(selectedId, (p: any) => {
        if (!p._responsive) p._responsive = {}
        if (!p._responsive[breakpoint]) p._responsive[breakpoint] = {}
        if (num === undefined) delete p._responsive[breakpoint][key]
        else p._responsive[breakpoint][key] = num
      })
    } else {
      actions.setProp(selectedId, (p: any) => {
        if (num === undefined) delete p[key]
        else p[key] = num
      })
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Ruler className="h-3 w-3" /> Size
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground/70">W</span>
          <input
            type="number"
            placeholder="auto"
            value={width}
            onChange={(e) => set("_width", e.target.value)}
            className="h-7 w-full rounded border border-border/50 bg-muted/30 px-2 text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground/70">H</span>
          <input
            type="number"
            placeholder="auto"
            value={height}
            onChange={(e) => set("_height", e.target.value)}
            className="h-7 w-full rounded border border-border/50 bg-muted/30 px-2 text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </label>
      </div>
    </div>
  )
}
