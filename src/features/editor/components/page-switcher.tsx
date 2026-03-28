"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { FileText, Plus, Trash2, Home, ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils"
import { listPagesAction, createPageAction, deletePageAction } from "../actions"
import { toast } from "sonner"

interface Page {
  id: string
  name: string
  slug: string
  is_homepage: boolean
  status: string
}

interface PageSwitcherProps {
  tenantId: string
  currentPageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
}

export function PageSwitcher({ tenantId, currentPageId, onPageChange }: PageSwitcherProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [pending, startTransition] = useTransition()

  const loadPages = useCallback(() => {
    startTransition(async () => {
      const result = await listPagesAction(tenantId)
      if (result.success) setPages(result.pages)
    })
  }, [tenantId])

  useEffect(() => { loadPages() }, [loadPages])

  const currentPage = pages.find((p) => p.id === currentPageId) ?? pages.find((p) => p.is_homepage)

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug = newSlug.trim() || `/${newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    startTransition(async () => {
      const result = await createPageAction(tenantId, newName.trim(), slug)
      if (result.success) {
        toast.success(`Page "${newName}" created`)
        setNewName("")
        setNewSlug("")
        setShowCreate(false)
        loadPages()
        onPageChange(result.pageId!, null)
      } else {
        toast.error(result.error || "Failed to create page")
      }
    })
  }

  const handleDelete = (page: Page) => {
    if (page.is_homepage) return
    if (!confirm(`Delete "${page.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deletePageAction(tenantId, page.id)
      if (result.success) {
        toast.success(`Page "${page.name}" deleted`)
        loadPages()
        // Switch to homepage if we deleted the current page
        if (page.id === currentPageId) {
          const homepage = pages.find((p) => p.is_homepage)
          if (homepage) onPageChange(homepage.id, null)
        }
      } else {
        toast.error(result.error || "Failed to delete")
      }
    })
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch page"
        className="flex items-center gap-1.5 rounded border border-border/50 bg-muted/40 px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-accent"
      >
        {currentPage?.is_homepage ? <Home className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
        <span className="max-w-[120px] truncate">{currentPage?.name ?? "Homepage"}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowCreate(false) }} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border/50 bg-background p-1.5 shadow-md">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">Pages</p>

            {pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "group flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer transition-colors",
                  page.id === currentPageId ? "bg-primary/10 text-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => { onPageChange(page.id, null); setOpen(false) }}
              >
                {page.is_homepage ? <Home className="h-3 w-3 shrink-0 text-muted-foreground" /> : <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[11px] font-medium">{page.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground/60">{page.slug}</p>
                </div>
                {page.status === "draft" && (
                  <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-600">Draft</span>
                )}
                {!page.is_homepage && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(page) }}
                    aria-label={`Delete ${page.name}`}
                    className="rounded p-0.5 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Create new page */}
            {showCreate ? (
              <div className="mt-1 rounded border border-border/50 bg-muted/20 p-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Page name"
                  className="w-full rounded border border-border/50 bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="Slug (auto-generated)"
                  className="mt-1 w-full rounded border border-border/50 bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="mt-1.5 flex gap-1">
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || pending}
                    className="flex-1 rounded bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setNewName(""); setNewSlug("") }}
                    className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-1 flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                New Page
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
