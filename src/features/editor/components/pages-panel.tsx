"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { FileText, Plus, Trash2, Home, ArrowLeft } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "../actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useEditorContext } from "../editor-context"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface Page { id: string; name: string; slug: string; is_homepage: boolean; status: string }

const templates = [
  { id: "blank", label: "Blank", desc: "Empty page, build from scratch", icon: "📄" },
  { id: "homepage", label: "Homepage", desc: "Hero, products, trust signals, newsletter", icon: "🏠" },
  { id: "landing", label: "Landing", desc: "Hero, features, CTA", icon: "🚀" },
  { id: "product", label: "Product", desc: "Featured product, grid, reviews", icon: "🛍️" },
  { id: "collection", label: "Collection", desc: "Banner, product grid", icon: "📦" },
  { id: "about", label: "About", desc: "Story, team, values", icon: "👋" },
  { id: "contact", label: "Contact", desc: "Form, map, FAQ", icon: "✉️" },
  { id: "blog", label: "Blog", desc: "Rich text, images, CTA", icon: "📝" },
] as const

type TemplateId = (typeof templates)[number]["id"]

interface PagesPanelProps { currentPageId: string | null; onPageChange: (pageId: string, craftJson: string | null) => void }

export function PagesPanel({ currentPageId, onPageChange }: PagesPanelProps) {
  const { tenantId } = useEditorContext()
  const [pages, setPages] = useState<Page[]>([])
  const [view, setView] = useState<"list" | "create">("list")
  const [newName, setNewName] = useState("")
  const [template, setTemplate] = useState<TemplateId>("blank")
  const [pending, startTransition] = useTransition()

  const loadPages = useCallback(() => { startTransition(async () => { const r = await listPagesAction(tenantId); if (r.success) setPages(r.pages) }) }, [tenantId])
  useEffect(() => { loadPages() }, [loadPages])

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug = `/${newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    startTransition(async () => {
      const r = await createPageAction(tenantId, newName.trim(), slug)
      if (r.success) { toast.success(`"${newName}" created`); setNewName(""); setTemplate("blank"); setView("list"); loadPages(); onPageChange(r.pageId!, null) }
      else toast.error(r.error || "Failed")
    })
  }

  const handleDelete = (page: Page) => {
    if (page.is_homepage || !confirm(`Delete "${page.name}"?`)) return
    startTransition(async () => {
      const r = await deletePageAction(tenantId, page.id)
      if (r.success) { toast.success(`Deleted "${page.name}"`); loadPages(); if (page.id === currentPageId) { const hp = pages.find((p) => p.is_homepage); if (hp) onPageChange(hp.id, null) } }
      else toast.error(r.error || "Failed")
    })
  }

  if (view === "create") {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setView("list"); setNewName(""); setTemplate("blank") }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-[13px] font-semibold text-foreground">New Page</span>
        </div>

        <div className="px-3 pb-3">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Page name" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} className="h-8 text-[13px]" />
          {newName.trim() && <div className="text-[11px] mt-1 text-muted-foreground">/{newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</div>}
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Choose a template</div>
          <div className="flex flex-col gap-1">
            {templates.map((t) => {
              const active = template === t.id
              return (
                <Button key={t.id} variant="outline" onClick={() => setTemplate(t.id)} className="flex items-center gap-2.5 p-2.5 h-auto rounded-lg text-left justify-start" style={{
                  borderWidth: active ? 1.5 : 1, borderColor: active ? 'var(--editor-accent)' : 'var(--editor-border)',
                  background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                }}>
                  <span className="text-xl leading-none">{t.icon}</span>
                  <div>
                    <div className={`text-xs font-medium ${active ? "text-blue-600" : "text-foreground"}`} >{t.label}</div>
                    <div className="text-[11px] mt-0.5 font-normal text-muted-foreground">{t.desc}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button onClick={handleCreate} disabled={!newName.trim() || pending} className="w-full h-[34px] text-[13px] font-semibold">
            {pending ? "Creating…" : "Create Page"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Pages</span>
        <div className="ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-[22px] w-[22px]" onClick={() => setView("create")}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New page</TooltipContent>
        </Tooltip>
        </div>
      </div>
      <Separator />

      <ScrollArea className="flex-1 px-2 pt-1.5">
        {pages.map((page) => {
          const active = page.id === currentPageId
          return (
            <div key={page.id} onClick={() => onPageChange(page.id, null)} className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer mb-px transition-colors"
              style={{ background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.08))' : undefined }}>
              {page.is_homepage
                ? <Home className={`w-3.5 h-3.5 shrink-0 ${active ? "text-blue-600" : "text-muted-foreground"}`} />
                : <FileText className={`w-3.5 h-3.5 shrink-0 ${active ? "text-blue-600" : "text-muted-foreground"}`} />}
              <div className="flex-1 min-w-0">
                <div className={`text-xs truncate ${active ? "font-semibold text-blue-600" : "text-foreground"}`} >{page.name}</div>
                <div className="text-[10px] truncate text-muted-foreground">{page.slug}</div>
              </div>
              {page.status === "draft" && <Badge variant="outline" className="text-[9px] h-4 px-1">Draft</Badge>}
              {!page.is_homepage && (
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(page) }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )
        })}
      </ScrollArea>
    </div>
  )
}
