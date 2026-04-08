"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useBreakpoint } from "../breakpoint-context"
import { Input } from "@/components/ui/input"
import { Maximize2, Minimize2, Ruler } from "lucide-react"

type WidthMode = "fixed" | "fill" | "hug"

export function SizeControl() {
  const breakpoint = useBreakpoint()

  const { selectedId, width, height, widthMode, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, width: "" as number | "", height: "" as number | "", widthMode: "fixed" as WidthMode }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    return {
      selectedId: nodeId,
      width: bp._width ?? props._width ?? "" as number | "",
      height: bp._height ?? props._height ?? "" as number | "",
      widthMode: (bp._widthMode ?? props._widthMode ?? "fixed") as WidthMode,
    }
  })

  if (!selectedId) return null

  const set = (key: string, val: unknown) => {
    if (breakpoint !== "desktop") {
      actions.setProp(selectedId, (p: Record<string, unknown>) => {
        if (!p._responsive) p._responsive = {}
        const r = p._responsive as Record<string, Record<string, unknown>>
        if (!r[breakpoint]) r[breakpoint] = {}
        if (val === undefined) delete r[breakpoint][key]; else r[breakpoint][key] = val
      })
    } else {
      actions.setProp(selectedId, (p: Record<string, unknown>) => { if (val === undefined) delete p[key]; else p[key] = val })
    }
  }

  const setSize = (key: "_width" | "_height", val: string) => {
    const num = val === "" ? undefined : Math.max(0, parseInt(val, 10) || 0)
    set(key, num)
  }

  const modes: Array<{ value: WidthMode; icon: typeof Ruler; label: string }> = [
    { value: "fixed", icon: Ruler, label: "Fixed" },
    { value: "fill", icon: Maximize2, label: "Fill" },
    { value: "hug", icon: Minimize2, label: "Hug" },
  ]

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground/60">Size</p>

      {/* Width mode selector */}
      <div className="flex gap-1 mb-2">
        {modes.map(({ value, icon: Icon, label }) => (
          <button key={value} onClick={() => set("_widthMode", value)}
            className="flex-1 flex items-center justify-center gap-1 h-7 text-[11px] font-medium rounded border transition-colors"
            style={{
              borderColor: widthMode === value ? "var(--editor-accent, #005bd3)" : "var(--editor-border)",
              background: widthMode === value ? "var(--editor-accent-light, #e8f0fe)" : "transparent",
              color: widthMode === value ? "var(--editor-accent, #005bd3)" : "var(--editor-text-secondary)",
            }}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground pointer-events-none">W</span>
          <Input type="number" placeholder={widthMode === "fill" ? "100%" : widthMode === "hug" ? "auto" : "auto"} value={widthMode === "fixed" ? width : ""} disabled={widthMode !== "fixed"} onChange={(e) => setSize("_width", e.target.value)} className="h-7 pl-7 text-[12px] font-mono" />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground pointer-events-none">H</span>
          <Input type="number" placeholder="auto" value={height} onChange={(e) => setSize("_height", e.target.value)} className="h-7 pl-7 text-[12px] font-mono" />
        </div>
      </div>
    </div>
  )
}
