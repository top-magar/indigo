"use client"

import { useEditorStore } from "../store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export function TokensPanel() {
  const { tokens, updateToken } = useEditorStore()
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState("")

  const grouped = Object.entries(tokens).reduce<Record<string, [string, string | number][]>>((acc, [k, v]) => {
    const prefix = k.split(".")[0]
    ;(acc[prefix] ??= []).push([k, v])
    return acc
  }, {})

  const isColor = (k: string) => k.startsWith("color.")

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(grouped).map(([group, entries]) => (
        <div key={group} className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{group}</span>
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              {isColor(k) ? (
                <div className="relative h-4 w-4 rounded-full shrink-0 ring-1 ring-white/10" style={{ backgroundColor: v as string }}>
                  <input type="color" value={v as string} onChange={(e) => updateToken(k, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              ) : null}
              <span className="text-[9px] text-muted-foreground truncate flex-1">{k.split(".")[1]}</span>
              {isColor(k) ? (
                <Input value={v as string} onChange={(e) => updateToken(k, e.target.value)} className="h-5 w-[72px] text-[9px] font-mono px-1" />
              ) : (
                <Input type="number" value={v as number} onChange={(e) => updateToken(k, Number(e.target.value))} className="h-5 w-14 text-[9px] font-mono px-1" />
              )}
            </div>
          ))}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1">
          <Input placeholder="e.g. spacing.2xl" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="h-5 text-[9px] flex-1 px-1" autoFocus onKeyDown={(e) => {
            if (e.key === "Enter" && newKey.includes(".")) { updateToken(newKey, newKey.startsWith("color") ? "#000000" : 0); setNewKey(""); setAdding(false) }
            if (e.key === "Escape") setAdding(false)
          }} />
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-5 w-full" onClick={() => setAdding(true)}>
          <Plus className="h-2.5 w-2.5 mr-1" />Add token
        </Button>
      )}
    </div>
  )
}
