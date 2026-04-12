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
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 px-1">Pages</div>
      <div className="flex flex-col gap-0.5 mb-3">
        {[...s.pages.values()].map((page) => (
          <div key={page.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer group ${s.currentPageId === page.id ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
            onClick={() => s.setPage(page.id)}>
            <FileText className="w-3 h-3 shrink-0" />
            <span className="flex-1 truncate">{page.name}</span>
            <span className="text-[10px] text-gray-400">{page.path}</span>
            {s.pages.size > 1 && (
              <button onClick={(e) => { e.stopPropagation(); handleDelete(page.id) }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
          placeholder="Page name" className="flex-1 px-2 py-1 text-xs border rounded min-w-0" />
        <button onClick={handleAdd} className="p-1 rounded hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
