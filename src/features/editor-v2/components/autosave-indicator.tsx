"use client"

import { useEffect, useState, useRef } from "react"
import { useEditorStore } from "../store"

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}

export function AutosaveIndicator() {
  const dirty = useEditorStore((s) => s.dirty)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [, tick] = useState(0)

  useEffect(() => useEditorStore.subscribe((s, prev) => {
    if (prev.dirty && !s.dirty) { setSaving(false); setSavedAt(Date.now()) }
  }), [])

  // Detect save start: dirty was true, then a save is triggered (dirty stays true briefly)
  useEffect(() => {
    if (dirty) {
      const t = setTimeout(() => setSaving(true), 4500) // autosave fires at 5s, show "Saving..." just before
      return () => clearTimeout(t)
    }
    setSaving(false)
  }, [dirty])

  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(t) }, [])

  const color = saving ? "bg-orange-400 animate-pulse" : dirty ? "bg-yellow-400" : "bg-green-400"
  const label = saving ? "Saving…" : dirty ? "Unsaved" : savedAt ? `Saved ${timeAgo(savedAt)}` : "Saved"

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
