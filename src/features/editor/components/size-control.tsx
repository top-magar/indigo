"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useBreakpoint } from "../breakpoint-context"
import { Input } from "@/components/ui/input"

export function SizeControl() {
  const breakpoint = useBreakpoint()

  const { selectedId, width, height, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, width: "" as number | "", height: "" as number | "" }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    return { selectedId: nodeId, width: bp._width ?? props._width ?? "" as number | "", height: bp._height ?? props._height ?? "" as number | "" }
  })

  if (!selectedId) return null

  const set = (key: "_width" | "_height", val: string) => {
    const num = val === "" ? undefined : Math.max(0, parseInt(val, 10) || 0)
    if (breakpoint !== "desktop") {
      actions.setProp(selectedId, (p: Record<string, unknown>) => {
        if (!p._responsive) p._responsive = {}
        const r = p._responsive as Record<string, Record<string, unknown>>
        if (!r[breakpoint]) r[breakpoint] = {}
        if (num === undefined) delete r[breakpoint][key]; else r[breakpoint][key] = num
      })
    } else {
      actions.setProp(selectedId, (p: Record<string, unknown>) => { if (num === undefined) delete p[key]; else p[key] = num })
    }
  }

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground/60">Size</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground pointer-events-none">W</span>
          <Input type="number" placeholder="auto" value={width} onChange={(e) => set("_width", e.target.value)} className="h-7 pl-7 text-[12px] font-mono" />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground pointer-events-none">H</span>
          <Input type="number" placeholder="auto" value={height} onChange={(e) => set("_height", e.target.value)} className="h-7 pl-7 text-[12px] font-mono" />
        </div>
      </div>
    </div>
  )
}
