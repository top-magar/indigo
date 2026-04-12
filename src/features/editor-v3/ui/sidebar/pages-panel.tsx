"use client"
import { useState } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
                ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
              onClick={() => s.setPage(page.id)}>
              <FileText className={`size-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <div className={`truncate ${active ? "font-medium" : ""}`}>{page.name}</div>
                <div className="text-[9px] text-muted-foreground">{page.path}</div>
              </div>
              {s.pages.size > 1 && (
                <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); handleDelete(page.id) }}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
          placeholder="New page name..." className="h-7 text-[11px] flex-1 min-w-0" />
        <Button variant="secondary" size="icon" className="size-7 shrink-0" onClick={handleAdd}><Plus className="size-3.5" /></Button>
      </div>
    </div>
  )
}
