"use client"
import { useState, useCallback } from "react"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
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

const INPUT = "w-full px-2 py-1.5 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none"

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

  const editDecls = editingId
    ? Array.from(s.styleDeclarations.values()).filter((d) => d.styleSourceId === editingId)
    : []

  return (
    <div className="p-3 overflow-y-auto">
      {/* Create */}
      <div className="flex gap-1.5 mb-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Token name..."
          className={`flex-1 min-w-0 ${INPUT}`} onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }} />
        <button onClick={handleCreate} className="px-2 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors" title="Create token">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Token list */}
      {tokens.length === 0 && <div className="text-[11px] text-gray-400 text-center py-4">No design tokens yet</div>}

      {tokens.map((token) => {
        const isEditing = editingId === token.id
        const isApplied = appliedIds.has(token.id)
        return (
          <div key={token.id} className="mb-2 border rounded-md overflow-hidden">
            <button onClick={() => setEditingId(isEditing ? null : token.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-50 transition-colors">
              {isEditing ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
              <span className="text-[11px] font-medium text-gray-700 flex-1">{token.name}</span>
              {isApplied && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">Applied</span>}
              {editDecls.length > 0 && !isEditing && <span className="text-[9px] text-gray-400">{editDecls.length > 0 ? `${Array.from(s.styleDeclarations.values()).filter((d) => d.styleSourceId === token.id).length} props` : ""}</span>}
            </button>

            {isEditing && (
              <div className="px-2.5 pb-2.5 border-t bg-gray-50/50">
                {s.selectedInstanceId && (
                  <button onClick={() => handleApply(token.id)}
                    className={`w-full mt-2 mb-2 py-1.5 text-[10px] font-medium rounded transition-colors ${isApplied ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {isApplied ? "✓ Applied to selection" : "Apply to selection"}
                  </button>
                )}
                {editDecls.map((d) => (
                  <div key={`${d.property}:${d.breakpointId}`} className="flex items-center gap-2 py-0.5 text-[10px]">
                    <span className="text-gray-500 w-20 truncate">{d.property}</span>
                    <span className="text-gray-700 font-mono">{formatValue(d.value)}</span>
                  </div>
                ))}
                <div className="flex gap-1 mt-2">
                  <input value={propName} onChange={(e) => setPropName(e.target.value)} placeholder="property"
                    className="w-20 px-1.5 py-1 text-[10px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none" />
                  <input value={propVal} onChange={(e) => setPropVal(e.target.value)} placeholder="value"
                    className="flex-1 px-1.5 py-1 text-[10px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddDecl() }} />
                  <button onClick={handleAddDecl} className="px-1.5 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 transition-colors font-medium">+</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
