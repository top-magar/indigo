"use client"

import { useEditorStore } from "../../store"
import { cn } from "@/shared/utils"

const BREAKPOINTS = [375, 768, 1024, 1280] as const

const BP_TO_VIEWPORT: Record<number, "mobile" | "tablet" | "desktop"> = {
  375: "mobile",
  768: "tablet",
  1024: "desktop",
  1280: "desktop",
}

export function BreakpointBar({ viewport, containerWidth }: { viewport: string; containerWidth: number }) {
  const setViewport = useEditorStore(s => s.setViewport)
  const updateTheme = useEditorStore(s => s.updateTheme)
  const width = viewport === "desktop" ? containerWidth : viewport === "tablet" ? 768 : 375
  const active = BREAKPOINTS.findLast((bp) => width >= bp) ?? 375

  const handleClick = (bp: number) => {
    const vp = BP_TO_VIEWPORT[bp]
    if (vp === "desktop" && bp !== containerWidth) {
      updateTheme({ containerWidth: bp })
    }
    setViewport(vp)
  }

  return (
    <div className="flex items-center justify-center gap-3 py-1 text-[9px] text-muted-foreground/60">
      <span>{width}px</span>
      {BREAKPOINTS.map((bp) => (
        <button
          key={bp}
          onClick={() => handleClick(bp)}
          className={cn(
            "hover:text-foreground transition-colors cursor-pointer",
            bp === active ? "text-foreground font-medium" : "opacity-50 hover:opacity-100"
          )}
        >
          {bp}
        </button>
      ))}
    </div>
  )
}
