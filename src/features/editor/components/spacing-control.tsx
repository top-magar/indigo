"use client"

import { useEditor } from "@craftjs/core"
import { useState } from "react"
import { cn } from "@/shared/utils"
import { Link2, Link2Off } from "lucide-react"
import { useBreakpoint } from "../breakpoint-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface SpacingProps {
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
}

const SPACING_KEYS: (keyof SpacingProps)[] = [
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
]

export function SpacingControl() {
  const breakpoint = useBreakpoint()
  const { selectedId, spacing, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, spacing: {} as SpacingProps }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    const s: Record<string, number> = {}
    for (const k of SPACING_KEYS) {
      s[k] = (breakpoint !== "desktop" && bp[k] !== undefined) ? bp[k] : (props[k] ?? 0)
    }
    return { selectedId: nodeId, spacing: s as unknown as SpacingProps }
  })

  const [linkedMargin, setLinkedMargin] = useState(false)
  const [linkedPadding, setLinkedPadding] = useState(false)

  const update = (key: keyof SpacingProps, value: number) => {
    if (!selectedId) return
    const v = Math.max(0, value)
    const isMargin = key.startsWith("margin")
    const linked = isMargin ? linkedMargin : linkedPadding
    const prefix = isMargin ? "margin" : "padding"
    const keys = linked
      ? [`${prefix}Top`, `${prefix}Right`, `${prefix}Bottom`, `${prefix}Left`]
      : [key]

    actions.setProp(selectedId, (p: any) => {
      if (breakpoint === "desktop") {
        for (const k of keys) p[k] = v
      } else {
        if (!p._responsive) p._responsive = {}
        if (!p._responsive[breakpoint]) p._responsive[breakpoint] = {}
        for (const k of keys) p._responsive[breakpoint][k] = v
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Spacing</p>

      <div className="relative mx-auto w-full max-w-[220px]">
        {/* Margin layer */}
        <div className="rounded border border-dashed border-orange-300/60 bg-orange-50/30 p-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-orange-400/80">margin</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-orange-400/60 hover:text-orange-500"
                  onClick={() => setLinkedMargin(!linkedMargin)}>
                  {linkedMargin ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{linkedMargin ? "Unlink sides" : "Link all sides"}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex justify-center py-0.5">
            <SpacingInput value={spacing.marginTop} onChange={(v) => update("marginTop", v)} color="orange" />
          </div>

          <div className="flex items-center gap-1">
            <SpacingInput value={spacing.marginLeft} onChange={(v) => update("marginLeft", v)} color="orange" />

            {/* Padding layer */}
            <div className="flex-1 rounded border border-dashed border-green-400/60 bg-green-50/30 p-1">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] text-green-500/80">padding</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-green-400/60 hover:text-green-500"
                      onClick={() => setLinkedPadding(!linkedPadding)}>
                      {linkedPadding ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{linkedPadding ? "Unlink sides" : "Link all sides"}</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex justify-center py-0.5">
                <SpacingInput value={spacing.paddingTop} onChange={(v) => update("paddingTop", v)} color="green" />
              </div>

              <div className="flex items-center justify-between">
                <SpacingInput value={spacing.paddingLeft} onChange={(v) => update("paddingLeft", v)} color="green" />
                <div className="mx-1 flex h-6 flex-1 items-center justify-center rounded bg-[var(--editor-surface-secondary)]">
                  <span className="text-[10px] text-gray-400">content</span>
                </div>
                <SpacingInput value={spacing.paddingRight} onChange={(v) => update("paddingRight", v)} color="green" />
              </div>

              <div className="flex justify-center py-0.5">
                <SpacingInput value={spacing.paddingBottom} onChange={(v) => update("paddingBottom", v)} color="green" />
              </div>
            </div>

            <SpacingInput value={spacing.marginRight} onChange={(v) => update("marginRight", v)} color="orange" />
          </div>

          <div className="flex justify-center py-0.5">
            <SpacingInput value={spacing.marginBottom} onChange={(v) => update("marginBottom", v)} color="orange" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SpacingInput({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: "orange" | "green" }) {
  return (
    <Input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min={0} max={200}
      className={cn("w-8 h-5 rounded bg-transparent text-center text-[10px] font-mono tabular-nums p-0 border-0 focus-visible:ring-1",
        color === "orange" ? "text-orange-600 focus-visible:ring-orange-300" : "text-green-600 focus-visible:ring-green-300")} />
  )
}
