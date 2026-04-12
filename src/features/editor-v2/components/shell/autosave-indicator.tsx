"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useEditorStore } from "../../store"
import { cn } from "@/shared/utils"

export function AutosaveIndicator() {
  const dirty = useEditorStore((s) => s.dirty)
  const saveError = useEditorStore((s) => s.saveError)
  const retryCount = useEditorStore((s) => s.retryCount)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState(false)
  const [faded, setFaded] = useState(false)

  useEffect(() => useEditorStore.subscribe((s, prev) => {
    if (prev.dirty && !s.dirty) { setSaving(false); setError(false); setSavedAt(Date.now()); setFaded(false) }
  }), [])

  // Detect save start
  useEffect(() => {
    if (dirty) {
      setFaded(false)
      const t = setTimeout(() => setSaving(true), 4500)
      return () => clearTimeout(t)
    }
    setSaving(false)
  }, [dirty])

  // Fade saved indicator after 3s
  useEffect(() => {
    if (!savedAt || dirty || saving) return
    const t = setTimeout(() => setFaded(true), 3000)
    return () => clearTimeout(t)
  }, [savedAt, dirty, saving])

  // Listen for save errors from store
  useEffect(() => useEditorStore.subscribe((s, prev) => {
    if (s.saveError && s.retryCount === 0 && !prev.saveError) { setError(true); setSaving(false) }
    if (!s.saveError && prev.saveError) setError(false)
  }), [])

  let dot: React.ReactNode
  let label: string

  if (error) {
    dot = <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
    label = "Save failed"
  } else if (retryCount > 0) {
    dot = <Loader2 className="h-2.5 w-2.5 animate-spin" />
    label = saveError ?? "Retrying…"
  } else if (saving) {
    dot = <Loader2 className="h-2.5 w-2.5 animate-spin" />
    label = "Saving…"
  } else if (dirty) {
    dot = <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
    label = "Unsaved"
  } else {
    dot = <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
    label = "Saved"
  }

  return (
    <span className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground transition-opacity duration-500", faded && !dirty && !saving && !error && "opacity-40")}>
      {dot}
      {label}
    </span>
  )
}
