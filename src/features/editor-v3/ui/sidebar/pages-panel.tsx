"use client"
import { useState } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { useStore } from "../use-store"

export function PagesPanel() {
  const s = useStore()
  const [newName, setNewName] = useState("")

  const handleAdd = () => {
    if (!newName.trim()) return
    const rootId = s.addInstance(null, 0, "Box", "div")
    s.setInstanceLabel(rootId, "Page Root")
    const path = "/" + newName.trim().toLowerCase().replace(/\s+/g, "-")
    const pageId = s.addPage(newName.trim(), path, rootId)
    s.setPage(pageId)
    setNewName("")
  }

  const handleDelete = (pageId: string) => {
    if (s.pages.size <= 1) return
    const page = s.pages.get(pageId)
    s.removePage(pageId)
    if (page) s.removeInstance(page.rootInstanceId)
    if (s.currentPageId === pageId) {
      const first = [...s.pages.values()][0]
      if (first) s.setPage(first.id)
    }
  }

  return (
    <div className="p-2 overflow-y-auto">
      <div className="flex flex-col gap-0.5 mb-3">
        {[...s.pages.values()].map((page) => {
          const active = s.currentPageId === page.id
          return (
            <div key={page.id}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] cursor-default group transition-colors
                ${active ? "bg-blue-500/10 text-blue-700" : "hover:bg-gray-50"}`}
              onClick={() => s.setPage(page.id)}>
              <FileText className={`w-3.5 h-3.5 shrink-0 ${active ? "text-blue-500" : "text-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <div className={`truncate ${active ? "font-medium" : ""}`}>{page.name}</div>
                <div className="text-[9px] text-gray-400">{page.path}</div>
              </div>
              {s.pages.size > 1 && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(page.id) }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 transition-opacity">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
          placeholder="New page name..."
          className="flex-1 px-2 py-1.5 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none min-w-0" />
        <button onClick={handleAdd} className="px-2 py-1.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors" title="Add page">
          <Plus className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
