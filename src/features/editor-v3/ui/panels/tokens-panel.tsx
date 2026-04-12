"use client"
import { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { StyleValue, CssUnit } from "../../types"
import { useStore } from "../use-store"

function parseValue(raw: string): StyleValue {
  const m = raw.match(/^(-?\d+\.?\d*)(px|rem|em|%|vw|vh|fr|ch)$/)
  if (m) return { type: "unit", value: Number(m[1]), unit: m[2] as CssUnit }
  if (raw.startsWith("#") && raw.length === 7) {
    const r = parseInt(raw.slice(1, 3), 16), g = parseInt(raw.slice(3, 5), 16), b = parseInt(raw.slice(5, 7), 16)
    return { type: "rgb", r, g, b, a: 1 }
  }
  return { type: "keyword", value: raw }
}

function formatValue(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `#${[v.r, v.g, v.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
    case "unparsed": return v.value
    case "var": return v.value
  }
}

export function TokensPanel() {
  const s = useStore()
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [propName, setPropName] = useState("")
  const [propVal, setPropVal] = useState("")

  const tokens = Array.from(s.styleSources.values()).filter((ss) => ss.type === "token")

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    s.createTokenStyleSource(newName.trim())
    setNewName("")
  }, [s, newName])

  const handleApply = useCallback((tokenId: string) => {
    if (!s.selectedInstanceId) return
    s.applyStyleSource(s.selectedInstanceId, tokenId)
  }, [s])

  const handleAddDecl = useCallback(() => {
    if (!editingId || !propName || !propVal) return
    s.setStyleDeclaration(editingId, "bp-base", propName, parseValue(propVal))
    setPropName(""); setPropVal("")
  }, [s, editingId, propName, propVal])

  const appliedIds = new Set<string>()
  if (s.selectedInstanceId) {
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) sel.values.forEach((id) => appliedIds.add(id))
  }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="flex gap-1.5 mb-3">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Token name..."
          className="h-7 text-[11px] flex-1 min-w-0" onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }} />
        <Button size="icon" className="size-7 shrink-0" onClick={handleCreate}><Plus className="size-3.5" /></Button>
      </div>

      {tokens.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-4">No design tokens yet</div>}

      {tokens.map((token) => {
        const isEditing = editingId === token.id
        const isApplied = appliedIds.has(token.id)
        const editDecls = isEditing ? Array.from(s.styleDeclarations.values()).filter((d) => d.styleSourceId === token.id) : []
        return (
          <Collapsible key={token.id} open={isEditing} onOpenChange={(open) => setEditingId(open ? token.id : null)} className="mb-2 border rounded-md overflow-hidden">
            <CollapsibleTrigger className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-accent/50 transition-colors">
              <span className="text-[11px] font-medium flex-1">{token.name}</span>
              {isApplied && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Applied</span>}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-2.5 pb-2.5 border-t bg-muted/30">
                {s.selectedInstanceId && (
                  <Button variant={isApplied ? "secondary" : "outline"} size="sm" className="w-full mt-2 mb-2 h-7 text-[10px]"
                    onClick={() => handleApply(token.id)}>
                    {isApplied ? "✓ Applied to selection" : "Apply to selection"}
                  </Button>
                )}
                {editDecls.map((d) => (
                  <div key={`${d.property}:${d.breakpointId}`} className="flex items-center gap-2 py-0.5 text-[10px]">
                    <span className="text-muted-foreground w-20 truncate">{d.property}</span>
                    <span className="font-mono">{formatValue(d.value)}</span>
                  </div>
                ))}
                <div className="flex gap-1 mt-2">
                  <Input value={propName} onChange={(e) => setPropName(e.target.value)} placeholder="property"
                    className="w-20 h-6 text-[10px]" />
                  <Input value={propVal} onChange={(e) => setPropVal(e.target.value)} placeholder="value"
                    className="flex-1 h-6 text-[10px]" onKeyDown={(e) => { if (e.key === "Enter") handleAddDecl() }} />
                  <Button variant="secondary" size="icon" className="size-6 shrink-0" onClick={handleAddDecl}><Plus className="size-3" /></Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
