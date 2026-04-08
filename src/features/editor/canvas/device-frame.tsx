import { cn } from "@/shared/utils"
import type { ReactNode } from "react"

export function DeviceFrame({ viewport, zoom, children }: { viewport: string; zoom: number; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto flex flex-col",
        viewport === "mobile" && "rounded-[40px] border-[6px] border-neutral-800 shadow-xl max-h-full",
        viewport === "tablet" && "rounded-[20px] border-[6px] border-neutral-800/80 shadow-xl max-h-full",
      )}
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      {viewport === "mobile" && (
        <div className="h-7 bg-neutral-800 flex items-center justify-center shrink-0 rounded-t-[34px]">
          <div className="w-20 h-4 bg-neutral-900 rounded-full" />
        </div>
      )}
      {viewport === "tablet" && <div className="h-5 bg-neutral-800/80 rounded-t-[14px] shrink-0" />}
      {children}
      {viewport === "mobile" && <div className="h-4 bg-neutral-800 shrink-0 rounded-b-[34px]" />}
      {viewport === "tablet" && <div className="h-4 bg-neutral-800/80 shrink-0 rounded-b-[14px]" />}
    </div>
  )
}
