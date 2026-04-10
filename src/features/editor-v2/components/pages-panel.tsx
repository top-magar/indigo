"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Trash2, Home } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "@/features/editor/actions/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Page { id: string; name: string; slug: string; is_homepage: boolean }

export function PagesPanel({ tenantId, currentPageId }: { tenantId: string; currentPageId: string }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [pending, start] = useTransition()

  const load = useCallback(() => {
    start(async () => {
      const r = await listPagesAction(tenantId)
      if (r.success) setPages(r.pages)
    })
  }, [tenantId])

  useEffect(() => { load() }, [load])

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug = `/${newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    start(async () => {
      const r = await createPageAction(tenantId, newName.trim(), slug)
      if (r.success) { toast.success("Page created"); setNewName(""); setCreating(false); load(); router.push(`/editor-v2?page=${r.pageId}`) }
      else toast.error(r.error || "Failed")
    })
  }

  const handleDelete = (page: Page) => {
    if (page.is_homepage || !confirm(`Delete "${page.name}"?`)) return
    start(async () => {
      const r = await deletePageAction(tenantId, page.id)
      if (r.success) { toast.success("Deleted"); load() }
      else toast.error(r.error || "Failed")
    })
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Pages</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreating(!creating)}><Plus className="h-3.5 w-3.5" /></Button>
      </div>
      {creating && (
        <div className="flex gap-1">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Page name" className="h-7 text-xs" onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          <Button size="sm" className="h-7 text-xs" onClick={handleCreate} disabled={pending}>Add</Button>
        </div>
      )}
      {pages.map((p) => (
        <div key={p.id} onClick={() => router.push(`/editor-v2?page=${p.id}`)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer group ${p.id === currentPageId ? "bg-accent" : "hover:bg-muted"}`}>
          {p.is_homepage ? <Home className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
          <span className="flex-1 truncate">{p.name}</span>
          <span className="text-muted-foreground truncate text-[10px]">{p.slug}</span>
          {p.is_homepage && <Badge variant="secondary" className="text-[9px] h-4 px-1">Home</Badge>}
          {!p.is_homepage && (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(p) }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
