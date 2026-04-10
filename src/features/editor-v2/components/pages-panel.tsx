"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Trash2, Home, ExternalLink, MoreHorizontal, Pencil, Globe } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "@/features/editor/actions/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/shared/utils"

interface Page { id: string; name: string; slug: string; is_homepage: boolean }

export function PagesPanel({ tenantId, currentPageId }: { tenantId: string; currentPageId: string }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [pending, start] = useTransition()

  const load = useCallback(() => { start(async () => { const r = await listPagesAction(tenantId); if (r.success) setPages(r.pages) }) }, [tenantId])
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
    start(async () => { const r = await deletePageAction(tenantId, page.id); if (r.success) { toast.success("Deleted"); load() } else toast.error(r.error || "Failed") })
  }

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Pages</span>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => setCreating(!creating)} className="p-0.5 hover:bg-white/10 rounded">
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
        </TooltipTrigger><TooltipContent side="left" className="text-[9px]">New page</TooltipContent></Tooltip>
      </div>

      {creating && (
        <div className="flex gap-1 px-2 pb-1">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Page name…" className="h-6 text-[10px]" onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          <Button size="sm" className="h-6 text-[9px] px-2" onClick={handleCreate} disabled={pending}>Add</Button>
        </div>
      )}

      {pages.map((p) => (
        <div
          key={p.id}
          onClick={() => router.push(`/editor-v2?page=${p.id}`)}
          className={cn(
            "flex items-center gap-1.5 px-3 h-7 text-[11px] cursor-pointer group transition-colors",
            p.id === currentPageId ? "bg-blue-500/15 text-blue-400" : "hover:bg-white/5"
          )}
        >
          {p.is_homepage
            ? <Home className={cn("h-3 w-3 shrink-0", p.id === currentPageId ? "text-blue-400" : "text-muted-foreground")} />
            : <FileText className={cn("h-3 w-3 shrink-0", p.id === currentPageId ? "text-blue-400" : "text-muted-foreground")} />
          }
          <span className="flex-1 truncate">{p.name}</span>

          {p.is_homepage && <span className="text-[8px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Home</span>}

          <div className="hidden group-hover:flex items-center gap-0">
            {!p.is_homepage && (
              <Tooltip><TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(p) }} className="p-0.5 hover:bg-white/10 rounded">
                  <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
                </button>
              </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Delete</TooltipContent></Tooltip>
            )}
          </div>

          <span className="group-hover:hidden text-[9px] text-muted-foreground/40">{p.slug}</span>
        </div>
      ))}

      {pages.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
          <FileText className="h-5 w-5 opacity-20" />
          <span className="text-[10px]">No pages</span>
        </div>
      )}
    </div>
  )
}
