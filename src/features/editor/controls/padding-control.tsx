"use client"

import { useState } from "react"
import { cn } from "@/shared/utils"
import { MoveVertical, MoveHorizontal, Maximize, Move, ArrowUpToLine, ArrowRightToLine, ArrowDownToLine, ArrowLeftToLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

type LinkMode = "all" | "axis" | "individual"

const modes: { mode: LinkMode; icon: typeof Move; label: string }[] = [
  { mode: "axis", icon: MoveVertical, label: "Vertical & horizontal" },
  { mode: "all", icon: Maximize, label: "All sides" },
  { mode: "individual", icon: Move, label: "Individual sides" },
]

interface PaddingControlProps {
  top: number; bottom: number; left?: number; right?: number
  onTop: (v: number) => void; onBottom: (v: number) => void
  onLeft?: (v: number) => void; onRight?: (v: number) => void
  max?: number
}

/** Compact icon-based padding control with link modes. Works with 2 sides (top/bottom) or 4 sides. */
export function PaddingControl({ top, bottom, left, right, onTop, onBottom, onLeft, onRight, max = 120 }: PaddingControlProps) {
  const has4 = onLeft !== undefined && onRight !== undefined
  const [mode, setMode] = useState<LinkMode>("axis")

  const cycle = () => setMode(mode === "axis" ? (has4 ? "all" : "axis") : mode === "all" ? "individual" : "axis")

  const setAll = (v: number) => { onTop(v); onBottom(v); onLeft?.(v); onRight?.(v) }
  const setV = (v: number) => { onTop(v); onBottom(v) }
  const setH = (v: number) => { onLeft?.(v); onRight?.(v) }

  const modeInfo = modes.find((m) => m.mode === mode)!
  const ModeIcon = modeInfo.icon

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Padding</p>
        {has4 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={cycle}>
                <ModeIcon className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{modeInfo.label}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {mode === "all" && has4 ? (
        <div className="flex items-center gap-1.5">
          <Maximize className="size-3.5 shrink-0 text-muted-foreground" />
          <PadInput value={top} onChange={setAll} max={max} />
        </div>
      ) : mode === "axis" ? (
        <div className={cn("grid gap-2", has4 ? "grid-cols-2" : "grid-cols-2")}>
          <div className="flex items-center gap-1.5">
            <MoveVertical className="size-3.5 shrink-0 text-muted-foreground" />
            <PadInput value={top} onChange={has4 ? setV : onTop} max={max} />
          </div>
          {has4 ? (
            <div className="flex items-center gap-1.5">
              <MoveHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
              <PadInput value={left ?? 0} onChange={setH} max={max} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <MoveVertical className="size-3.5 shrink-0 text-muted-foreground rotate-180" />
              <PadInput value={bottom} onChange={onBottom} max={max} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {([
            [ArrowUpToLine, "Top", top, onTop],
            [ArrowRightToLine, "Right", right ?? 0, onRight ?? (() => {})],
            [ArrowDownToLine, "Bottom", bottom, onBottom],
            [ArrowLeftToLine, "Left", left ?? 0, onLeft ?? (() => {})],
          ] as const).map(([Icon, lbl, val, fn]) => (
            <div key={lbl} className="flex flex-col items-center gap-0.5">
              <Icon className="size-3.5 text-muted-foreground" />
              <PadInput value={val} onChange={fn as (v: number) => void} max={max} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PadInput({ value, onChange, max, className }: { value: number; onChange: (v: number) => void; max: number; className?: string }) {
  return (
    <Input type="number" value={value} min={0} max={max} onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      className={cn("h-6 text-[11px] font-mono tabular-nums text-center px-1", className)} />
  )
}
