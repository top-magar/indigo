"use client"

import { useState, useEffect } from "react"
import { Cloud } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function AutosaveIndicator({ lastSaved }: { lastSaved: Date | null }) {
  const [, forceUpdate] = useState(0)
  useEffect(() => { const t = setInterval(() => forceUpdate((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  const ago = lastSaved ? formatTimeAgo(lastSaved) : null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 px-1 cursor-default">
          <Cloud className="w-3.5 h-3.5" style={{ color: lastSaved ? 'var(--editor-accent)' : 'var(--editor-text-disabled)' }} />
          <span className="text-[11px] text-muted-foreground">{lastSaved ? 'Saved' : 'Autosave'}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{ago ? `Last saved ${ago}` : "Autosave on — not saved yet"}</TooltipContent>
    </Tooltip>
  )
}

function formatTimeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 10) return "just now"
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}
