"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Trash2, Home, Pencil, MoreHorizontal } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction, renamePageAction } from "../actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/shared/utils"

interface Page { id: string; page_name: string; is_homepage: boolean; updated_at: string }

export function PagesPanel({ tenantId, currentPageId }: { tenantId: string; currentPageId: string }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState("")
  const [pending, start] = useTransition()

  const load = useCallback(() => { start(async () => { const r = await listPagesAction(tenantId); setPages(r.pages) }) }, [tenantId])
  useEffect(() => { load() }, [load])

  const handleCreate = () => {
    if (!newName.trim()) return
    start(async () => {
      const r = await createPageAction(tenantId, newName.trim())
      if (r.success) { toast.success("Page created"); setNewName(""); setCreating(false); load(); router.push(`/editor-v2?page=${r.pageId}`) }
      else toast.error(r.error || "Failed")
    })
  }

  const handleDelete = (p: Page) => {
    if (p.is_homepage || !confirm(`Delete "${p.page_name}"?`)) return
    start(async () => { const r = await deletePageAction(tenantId, p.id); if (r.success) { toast.success("Deleted"); load() } else toast.error(r.error || "Failed") })
  }

  const handleRename = (id: string) => {
    if (!renameVal.trim()) { setRenamingId(null); return }
    start(async () => { const r = await renamePageAction(tenantId, id, renameVal.trim()); if (r.success) { load(); setRenamingId(null) } else toast.error("Rename failed") })
  }

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Pages</span>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => setCreating(!creating)} className="p-0.5 hover:bg-white/10 rounded"><Plus className="h-3 w-3 text-muted-foreground" /></button>
        </TooltipTrigger><TooltipContent side="left" className="text-[9px]">New page</TooltipContent></Tooltip>
      </div>

      {creating && (
        <div className="flex gap-1 px-2 pb-1">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Page name…" className="h-6 text-[10px]" onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          <Button size="sm" className="h-6 text-[9px] px-2" onClick={handleCreate} disabled={pending}>Add</Button>
        </div>
      )}

      {pages.map((p) => (
        <div key={p.id} onClick={() => router.push(`/editor-v2?page=${p.id}`)} className={cn("flex items-center gap-1.5 px-3 h-7 text-[11px] cursor-pointer group transition-colors", p.id === currentPageId ? "bg-blue-500/15 text-blue-400" : "hover:bg-white/5")}>
          {p.is_homepage ? <Home className={cn("h-3 w-3 shrink-0", p.id === currentPageId ? "text-blue-400" : "text-muted-foreground")} /> : <FileText className={cn("h-3 w-3 shrink-0", p.id === currentPageId ? "text-blue-400" : "text-muted-foreground")} />}
          {renamingId === p.id ? (
            <Input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} className="h-5 text-[10px] flex-1" autoFocus onBlur={() => handleRename(p.id)} onKeyDown={(e) => { if (e.key === "Enter") handleRename(p.id); if (e.key === "Escape") setRenamingId(null) }} onClick={(e) => e.stopPropagation()} />
          ) : (
            <span className="flex-1 truncate">{p.page_name}</span>
          )}
          {p.is_homepage && <span className="text-[8px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Home</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded"><MoreHorizontal className="h-3 w-3 text-muted-foreground" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenamingId(p.id); setRenameVal(p.page_name) }}><Pencil className="h-3 w-3 mr-2" />Rename</DropdownMenuItem>
              <DropdownMenuItem disabled={p.is_homepage} onClick={(e) => { e.stopPropagation(); handleDelete(p) }} className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {pages.length === 0 && <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground"><FileText className="h-5 w-5 opacity-20" /><span className="text-[10px]">No pages</span></div>}
    </div>
  )
}
