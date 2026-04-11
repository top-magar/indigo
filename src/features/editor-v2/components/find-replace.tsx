"use client"

import { useState, useRef, useEffect } from "react"
import { useEditorStore } from "../store"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FindReplace({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [replace, setReplace] = useState("")
  const { sections, updateProps, selectSection } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const matches = query
    ? sections.filter((s) => Object.values(s.props).some((v) => typeof v === "string" && v.toLowerCase().includes(query.toLowerCase())))
    : []

  const doReplace = (all: boolean) => {
    const targets = all ? matches : matches.slice(0, 1)
    for (const s of targets) {
      const updated: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(s.props)) {
        if (typeof v === "string" && v.toLowerCase().includes(query.toLowerCase())) {
          updated[k] = v.split(query).join(replace)
        }
      }
      if (Object.keys(updated).length) updateProps(s.id, updated)
    }
  }

  return (
    <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-background border rounded-lg shadow-lg px-2 py-1.5">
      <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find…" className="h-7 w-36 text-xs" />
      <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace…" className="h-7 w-36 text-xs" />
      <span className="text-[10px] text-muted-foreground min-w-[2ch]">{matches.length}</span>
      {matches.length > 0 && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => selectSection(matches[0].id)}>Next</Button>}
      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => doReplace(false)} disabled={!matches.length}>Replace</Button>
      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => doReplace(true)} disabled={!matches.length}>All</Button>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
    </div>
  )
}
