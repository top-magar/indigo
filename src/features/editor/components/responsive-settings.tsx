"use client"

import { useEditor } from "@craftjs/core"
import { useBreakpoint, type Breakpoint } from "../breakpoint-context"
import { Monitor, Tablet, Smartphone, RotateCcw } from "lucide-react"
import { cn } from "@/shared/utils"

const breakpointMeta: Record<Breakpoint, { icon: typeof Monitor; label: string; color: string }> = {
  desktop: { icon: Monitor, label: "Desktop", color: "text-foreground" },
  tablet: { icon: Tablet, label: "Tablet", color: "text-blue-500" },
  mobile: { icon: Smartphone, label: "Mobile", color: "text-violet-500" },
}

/**
 * Shows which breakpoint is active and provides a "reset overrides" button.
 * Displayed at the top of the settings panel when tablet/mobile is selected.
 */
export function BreakpointIndicator() {
  const breakpoint = useBreakpoint()

  const { selectedId, hasOverrides, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, hasOverrides: false }
    const props = state.nodes[nodeId]?.data.props ?? {}
    return {
      selectedId: nodeId,
      hasOverrides: !!props._responsive?.[breakpoint] &&
        Object.keys(props._responsive[breakpoint]).length > 0,
    }
  })

  if (breakpoint === "desktop" || !selectedId) return null

  const meta = breakpointMeta[breakpoint]
  const Icon = meta.icon

  return (
    <div className={cn(
      "flex items-center justify-between rounded border px-3 py-2",
      breakpoint === "tablet" ? "border-blue-200/50 bg-blue-50/30" : "border-violet-200/50 bg-violet-50/30"
    )}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", meta.color)} />
        <span className={cn("text-[11px] font-semibold", meta.color)}>
          Editing {meta.label} overrides
        </span>
      </div>
      {hasOverrides && (
        <button
          onClick={() => actions.setProp(selectedId, (p: any) => {
            if (p._responsive) delete p._responsive[breakpoint]
          })}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-background hover:text-foreground"
          title={`Reset ${meta.label} overrides to inherit from Desktop`}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  )
}

/**
 * Hook for settings panels to read/write props on the selected node.
 * On desktop: writes to base props directly.
 * On tablet/mobile: writes to _responsive[breakpoint].
 */
export function useResponsiveProp<T>(propKey: string): [T, (value: T) => void] {
  const breakpoint = useBreakpoint()

  const { selectedId, effectiveValue, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, effectiveValue: undefined }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const base = props[propKey]
    const override = props._responsive?.[breakpoint]?.[propKey]
    return {
      selectedId: nodeId,
      effectiveValue: (breakpoint !== "desktop" && override !== undefined) ? override : base,
    }
  })

  const setValue = (value: T) => {
    if (!selectedId) return
    if (breakpoint === "desktop") {
      actions.setProp(selectedId, (p: any) => { p[propKey] = value })
    } else {
      actions.setProp(selectedId, (p: any) => {
        if (!p._responsive) p._responsive = {}
        if (!p._responsive[breakpoint]) p._responsive[breakpoint] = {}
        p._responsive[breakpoint][propKey] = value
      })
    }
  }

  return [effectiveValue as T, setValue]
}
