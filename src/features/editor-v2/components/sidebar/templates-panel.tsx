"use client"

import { useState, useEffect, useTransition } from "react"
import { Trash2, Loader2, Download, Upload, LayoutTemplate, Clock, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { saveAsTemplateAction, listTemplatesAction, getTemplateAction, deleteTemplateAction } from "@/features/editor/actions/actions"
import { useEditorStore } from "../../store"
import { SectionLabel } from "../ui-primitives"
import { toast } from "sonner"
import { cn } from "@/shared/utils"

export function TemplatesPanel({ tenantId }: { tenantId: string }) {
  const sections = useEditorStore(s => s.sections)
  const loadSections = useEditorStore(s => s.loadSections)
  const [name, setName] = useState("")
  const [templates, setTemplates] = useState<{ id: string; name: string; created_at: string }[]>([])
  const [saving, startSave] = useTransition()
  const [loading, startLoad] = useTransition()
  const [showSave, setShowSave] = useState(false)

  const load = () => startLoad(async () => { const r = await listTemplatesAction(tenantId); if (r.success) setTemplates(r.templates) })
  useEffect(() => { load() }, [tenantId])

  const save = () => {
    if (!name.trim()) return
    startSave(async () => {
      const r = await saveAsTemplateAction(tenantId, name.trim(), JSON.stringify(sections))
      if (r.success) { toast.success("Template saved"); setName(""); setShowSave(false); load() }
      else toast.error(r.error || "Save failed")
    })
  }

  const apply = async (id: string) => {
    const r = await getTemplateAction(tenantId, id)
    if (!r.success || !r.template) { toast.error("Failed to load"); return }
    if (Array.isArray(r.template.data)) { loadSections(r.template.data); toast.success("Template applied") }
    else toast.error("Invalid format")
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return
    const r = await deleteTemplateAction(tenantId, id)
    if (r.success) { toast.success("Deleted"); load() } else toast.error(r.error || "Failed")
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center justify-between px-3 py-1.5">
        <SectionLabel>Templates</SectionLabel>
        <div className="flex items-center gap-0.5">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => setShowSave(!showSave)} className="p-0.5 hover:bg-white/10 rounded">
              <Plus className="h-3 w-3 text-muted-foreground" />
            </button>
          </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Save current as template</TooltipContent></Tooltip>
        </div>
      </div>

      {showSave && (
        <div className="flex gap-1 px-2 pb-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name…" className="h-6 text-[10px]" onKeyDown={(e) => e.key === "Enter" && save()} autoFocus />
          <Button size="sm" className="h-6 text-[9px] px-2" onClick={save} disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
          <LayoutTemplate className="h-5 w-5 opacity-20" />
          <span className="text-[10px]">No templates</span>
          <span className="text-[9px] text-muted-foreground/50">Save your page as a template</span>
        </div>
      ) : (
        templates.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5 px-3 h-7 text-[11px] cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => apply(t.id)}>
            <LayoutTemplate className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{t.name}</span>

            <div className="hidden group-hover:flex items-center gap-0">
              <Tooltip><TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); apply(t.id) }} className="p-0.5 hover:bg-white/10 rounded">
                  <Download className="h-2.5 w-2.5 text-muted-foreground" />
                </button>
              </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Apply</TooltipContent></Tooltip>

              <Tooltip><TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); remove(t.id) }} className="p-0.5 hover:bg-white/10 rounded">
                  <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
                </button>
              </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Delete</TooltipContent></Tooltip>
            </div>

            <span className="group-hover:hidden text-[9px] text-muted-foreground/40 flex items-center gap-0.5">
              <Clock className="h-2 w-2" />{timeAgo(t.created_at)}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
