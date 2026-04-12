"use client"
import { useState, useCallback } from "react"
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

  // Get declarations for editing token
  const editDecls = editingId
    ? Array.from(s.styleDeclarations.values()).filter((d) => d.styleSourceId === editingId)
    : []

  // Check which tokens are applied to selected instance
  const appliedIds = new Set<string>()
  if (s.selectedInstanceId) {
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) sel.values.forEach((id) => appliedIds.add(id))
  }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Design Tokens</div>

      {/* Create */}
      <div className="flex gap-1 mb-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Token name"
          className="flex-1 px-2 py-1 text-xs border rounded" onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }} />
        <button onClick={handleCreate} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
      </div>

      {/* Token list */}
      {tokens.map((token) => (
        <div key={token.id} className="mb-2 border rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{token.name}</span>
            <div className="flex gap-1">
              {s.selectedInstanceId && (
                <button onClick={() => handleApply(token.id)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${appliedIds.has(token.id) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {appliedIds.has(token.id) ? "Applied" : "Apply"}
                </button>
              )}
              <button onClick={() => setEditingId(editingId === token.id ? null : token.id)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200">
                {editingId === token.id ? "Close" : "Edit"}
              </button>
            </div>
          </div>

          {editingId === token.id && (
            <div className="mt-1 space-y-1">
              {editDecls.map((d) => (
                <div key={`${d.property}:${d.breakpointId}`} className="flex items-center gap-1 text-[10px]">
                  <span className="text-gray-500 w-20 truncate">{d.property}</span>
                  <span className="text-gray-700">{formatValue(d.value)}</span>
                </div>
              ))}
              <div className="flex gap-1 mt-1">
                <input value={propName} onChange={(e) => setPropName(e.target.value)} placeholder="property"
                  className="w-20 px-1 py-0.5 text-[10px] border rounded" />
                <input value={propVal} onChange={(e) => setPropVal(e.target.value)} placeholder="value"
                  className="flex-1 px-1 py-0.5 text-[10px] border rounded"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddDecl() }} />
                <button onClick={handleAddDecl} className="text-[10px] px-1 bg-gray-200 rounded">+</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {tokens.length === 0 && <div className="text-[10px] text-gray-400">No tokens yet. Create one above.</div>}
    </div>
  )
}
