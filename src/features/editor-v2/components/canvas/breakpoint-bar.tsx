"use client"

import { cn } from "@/shared/utils"

const BREAKPOINTS = [375, 768, 1024, 1280] as const

export function BreakpointBar({ viewport, containerWidth }: { viewport: string; containerWidth: number }) {
  const width = viewport === "desktop" ? containerWidth : viewport === "tablet" ? 768 : 375
  const active = BREAKPOINTS.findLast((bp) => width >= bp) ?? 375
  return (
    <div className="flex items-center justify-center gap-3 py-1 text-[9px] text-muted-foreground/60">
      <span>{width}px</span>
      {BREAKPOINTS.map((bp) => (
        <span key={bp} className={cn(bp === active ? "text-foreground font-medium" : "opacity-50")}>{bp}</span>
      ))}
    </div>
  )
}
