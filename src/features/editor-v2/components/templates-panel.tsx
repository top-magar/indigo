"use client"

import { useState, useEffect, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { saveAsTemplateAction, listTemplatesAction, getTemplateAction, deleteTemplateAction } from "@/features/editor/actions/actions"
import { useEditorStore } from "../store"
import { toast } from "sonner"

export function TemplatesPanel({ tenantId }: { tenantId: string }) {
  const { sections, loadSections } = useEditorStore()
  const [name, setName] = useState("")
  const [templates, setTemplates] = useState<{ id: string; name: string; created_at: string }[]>([])
  const [saving, startSave] = useTransition()
  const [loading, startLoad] = useTransition()

  const load = () => startLoad(async () => {
    const r = await listTemplatesAction(tenantId)
    if (r.success) setTemplates(r.templates)
  })
  useEffect(() => { load() }, [tenantId])

  const save = () => {
    if (!name.trim()) return
    startSave(async () => {
      const r = await saveAsTemplateAction(tenantId, name.trim(), JSON.stringify(sections))
      if (r.success) { toast.success("Template saved"); setName(""); load() }
      else toast.error(r.error || "Save failed")
    })
  }

  const apply = async (id: string) => {
    const r = await getTemplateAction(tenantId, id)
    if (!r.success || !r.template) { toast.error("Failed to load template"); return }
    const data = r.template.data
    if (Array.isArray(data)) { loadSections(data); toast.success("Template applied") }
    else toast.error("Invalid template format")
  }

  const remove = async (id: string) => {
    const r = await deleteTemplateAction(tenantId, id)
    if (r.success) { toast.success("Deleted"); load() } else toast.error(r.error || "Delete failed")
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      <div>
        <p className="text-xs font-medium mb-1">Save as Template</p>
        <div className="flex gap-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name…" className="h-7 text-xs" />
          <Button size="sm" className="h-7 text-xs shrink-0" onClick={save} disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium mb-1">Load Template</p>
        <ScrollArea className="max-h-[300px]">
          {loading ? <div className="flex justify-center py-4"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div>
          : templates.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No templates yet</p>
          : templates.map((t) => (
            <div key={t.id} className="flex items-center gap-1 py-1.5 group">
              <button onClick={() => apply(t.id)} className="flex-1 text-left text-xs truncate hover:underline">{t.name}</button>
              <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}
