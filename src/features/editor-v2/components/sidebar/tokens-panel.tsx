"use client"

import { useState } from "react"
import { useEditorStore } from "../../store"
import { SectionLabel } from "../ui-primitives"
import { ColorPicker } from "../pickers/color-picker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export function TokensPanel() {
  const tokens = useEditorStore(s => s.tokens)
  const updateToken = useEditorStore(s => s.updateToken)
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState("")

  const grouped = Object.entries(tokens).reduce<Record<string, [string, string | number][]>>((acc, [k, v]) => {
    const prefix = k.split(".")[0]
    ;(acc[prefix] ??= []).push([k, v])
    return acc
  }, {})

  const isColor = (k: string) => k.startsWith("color.")

  const addToken = () => {
    if (!newKey.includes(".")) return
    updateToken(newKey, newKey.startsWith("color") ? "#000000" : 0)
    setNewKey("")
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {Object.entries(grouped).map(([group, entries]) => (
        <div key={group} className="flex flex-col gap-1.5">
          <SectionLabel>{group}</SectionLabel>
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              {isColor(k) && <ColorPicker value={v as string} onChange={(c) => updateToken(k, c)} />}
              <span className="text-[10px] text-muted-foreground truncate flex-1">{k.split(".").slice(1).join(".")}</span>
              {!isColor(k) && (
                <Input type="number" value={v as number} onChange={(e) => updateToken(k, Number(e.target.value))} className="h-6 w-16 text-[10px] font-mono px-1.5" />
              )}
            </div>
          ))}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1">
          <Input placeholder="group.name" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="h-6 text-[10px] flex-1 px-1.5" autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") addToken(); if (e.key === "Escape") setAdding(false) }}
          />
          <button onClick={() => setAdding(false)} className="p-0.5 hover:bg-white/10 rounded" aria-label="Cancel">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-6" onClick={() => setAdding(true)}>
          <Plus className="h-2.5 w-2.5 mr-1" />Add token
        </Button>
      )}
    </div>
  )
}
