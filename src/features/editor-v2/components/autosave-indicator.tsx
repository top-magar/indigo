"use client"

import { useEffect, useState } from "react"
import { useEditorStore } from "../store"

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}

export function AutosaveIndicator() {
  const dirty = useEditorStore((s) => s.dirty)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [, tick] = useState(0)

  useEffect(() => useEditorStore.subscribe((s, prev) => {
    if (prev.dirty && !s.dirty) setSavedAt(Date.now())
  }), [])

  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(t) }, [])

  const color = dirty ? "bg-orange-400" : "bg-green-400"
  const label = dirty ? "Saving…" : savedAt ? `Saved ${timeAgo(savedAt)}` : "Saved"

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
