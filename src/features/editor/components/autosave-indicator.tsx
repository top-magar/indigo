"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudUpload, CloudOff } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface Props {
  lastSaved: Date | null
  saving?: boolean
  dirty?: boolean
}

export function AutosaveIndicator({ lastSaved, saving, dirty }: Props) {
  const [, forceUpdate] = useState(0)
  useEffect(() => { const t = setInterval(() => forceUpdate((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  const ago = lastSaved ? formatTimeAgo(lastSaved) : null

  const icon = saving
    ? <CloudUpload className="size-3.5 text-amber-500 animate-pulse" />
    : dirty
    ? <CloudOff className="size-3.5 text-muted-foreground/60" />
    : <Cloud className={lastSaved ? "size-3.5 text-emerald-500" : "size-3.5 text-muted-foreground/60"} />

  const label = saving ? "Saving…" : dirty ? "Unsaved" : lastSaved ? "Saved" : "Autosave"
  const tip = saving ? "Saving your changes…" : dirty ? "Unsaved changes — will autosave shortly" : ago ? `Last saved ${ago}` : "Autosave on — not saved yet"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 px-1 cursor-default">
          {icon}
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
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
