"use client"

import { useEditor } from "@craftjs/core"
import { useState } from "react"
import { cn } from "@/shared/utils"
import { MoveVertical, MoveHorizontal, Move, Maximize, UnfoldVertical, UnfoldHorizontal, ArrowUpToLine, ArrowRightToLine, ArrowDownToLine, ArrowLeftToLine } from "lucide-react"
import { useBreakpoint } from "../breakpoint-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface SpacingProps {
  marginTop: number; marginRight: number; marginBottom: number; marginLeft: number
  paddingTop: number; paddingRight: number; paddingBottom: number; paddingLeft: number
}

const SPACING_KEYS: (keyof SpacingProps)[] = [
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
]

type LinkMode = "all" | "axis" | "individual"

const linkModes: { mode: LinkMode; icon: typeof Move; label: string }[] = [
  { mode: "all", icon: Maximize, label: "All sides linked" },
  { mode: "axis", icon: MoveVertical, label: "Horizontal & vertical linked" },
  { mode: "individual", icon: Move, label: "Individual sides" },
]

export function SpacingControl() {
  const breakpoint = useBreakpoint()
  const { selectedId, spacing, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, spacing: {} as SpacingProps }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    const s: Record<string, number> = {}
    for (const k of SPACING_KEYS) s[k] = (breakpoint !== "desktop" && bp[k] !== undefined) ? bp[k] : (props[k] ?? 0)
    return { selectedId: nodeId, spacing: s as unknown as SpacingProps }
  })

  const [padMode, setPadMode] = useState<LinkMode>("axis")
  const [marMode, setMarMode] = useState<LinkMode>("axis")

  if (!selectedId) return null

  const update = (key: keyof SpacingProps, value: number, mode: LinkMode) => {
    const v = Math.max(0, value)
    const prefix = key.startsWith("margin") ? "margin" : "padding"
    let keys: string[]
    if (mode === "all") {
      keys = [`${prefix}Top`, `${prefix}Right`, `${prefix}Bottom`, `${prefix}Left`]
    } else if (mode === "axis") {
      const isV = key.endsWith("Top") || key.endsWith("Bottom")
      keys = isV ? [`${prefix}Top`, `${prefix}Bottom`] : [`${prefix}Left`, `${prefix}Right`]
    } else {
      keys = [key]
    }
    actions.setProp(selectedId, (p: Record<string, unknown>) => {
      if (breakpoint === "desktop") {
        for (const k of keys) p[k] = v
      } else {
        if (!p._responsive) p._responsive = {}
        const r = p._responsive as Record<string, Record<string, unknown>>
        if (!r[breakpoint]) r[breakpoint] = {}
        for (const k of keys) r[breakpoint][k] = v
      }
    })
  }

  const cycleLinkMode = (current: LinkMode): LinkMode =>
    current === "individual" ? "axis" : current === "axis" ? "all" : "individual"

  return (
    <div className="px-3 py-2 flex flex-col gap-2.5">
      <SpacingGroup
        label="Padding"
        mode={padMode}
        onCycleMode={() => setPadMode(cycleLinkMode(padMode))}
        top={spacing.paddingTop} right={spacing.paddingRight}
        bottom={spacing.paddingBottom} left={spacing.paddingLeft}
        onTop={(v) => update("paddingTop", v, padMode)}
        onRight={(v) => update("paddingRight", v, padMode)}
        onBottom={(v) => update("paddingBottom", v, padMode)}
        onLeft={(v) => update("paddingLeft", v, padMode)}
        color="green"
        iconV={MoveVertical} iconH={MoveHorizontal}
      />
      <SpacingGroup
        label="Margin"
        mode={marMode}
        onCycleMode={() => setMarMode(cycleLinkMode(marMode))}
        top={spacing.marginTop} right={spacing.marginRight}
        bottom={spacing.marginBottom} left={spacing.marginLeft}
        onTop={(v) => update("marginTop", v, marMode)}
        onRight={(v) => update("marginRight", v, marMode)}
        onBottom={(v) => update("marginBottom", v, marMode)}
        onLeft={(v) => update("marginLeft", v, marMode)}
        color="orange"
        iconV={UnfoldVertical} iconH={UnfoldHorizontal}
      />
    </div>
  )
}

function SpacingGroup({ label, mode, onCycleMode, top, right, bottom, left, onTop, onRight, onBottom, onLeft, color, iconV: IconV, iconH: IconH }: {
  label: string; mode: LinkMode; onCycleMode: () => void
  top: number; right: number; bottom: number; left: number
  onTop: (v: number) => void; onRight: (v: number) => void
  onBottom: (v: number) => void; onLeft: (v: number) => void
  color: "green" | "orange"
  iconV: typeof MoveVertical; iconH: typeof MoveHorizontal
}) {
  const modeInfo = linkModes.find((m) => m.mode === mode)!
  const ModeIcon = modeInfo.icon
  const iconColor = color === "green" ? "text-green-500" : "text-orange-400"
  const inputColor = color === "green" ? "text-green-700 focus-visible:ring-green-300" : "text-orange-600 focus-visible:ring-orange-300"

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-5 w-5", iconColor)} onClick={onCycleMode}>
              <ModeIcon className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{modeInfo.label}</TooltipContent>
        </Tooltip>
      </div>

      {mode === "all" ? (
        <div className="flex items-center gap-1.5">
          <Maximize className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
          <SInput value={top} onChange={onTop} className={inputColor} />
        </div>
      ) : mode === "axis" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <IconV className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
            <SInput value={top} onChange={onTop} className={inputColor} />
          </div>
          <div className="flex items-center gap-1.5">
            <IconH className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
            <SInput value={left} onChange={onLeft} className={inputColor} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {([
            [ArrowUpToLine, "Top", top, onTop],
            [ArrowRightToLine, "Right", right, onRight],
            [ArrowDownToLine, "Bottom", bottom, onBottom],
            [ArrowLeftToLine, "Left", left, onLeft],
          ] as const).map(([Icon, lbl, val, fn]) => (
            <div key={lbl} className="flex flex-col items-center gap-0.5">
              <Icon className={cn("w-3 h-3", iconColor)} />
              <SInput value={val} onChange={fn} className={inputColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SInput({ value, onChange, className }: { value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <Input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min={0} max={999}
      className={cn("h-6 text-[11px] font-mono tabular-nums text-center px-1", className)} />
  )
}
