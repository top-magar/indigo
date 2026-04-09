"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutTemplate, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { listTemplatesAction, saveAsTemplateAction, deleteTemplateAction, getTemplateAction } from "../actions/actions"

interface Template { id: string; name: string; description: string | null; created_at: string }
interface Props { tenantId: string }

export function TemplatesPanel({ tenantId }: Props) {
  const { actions, query } = useEditor()
  const [templates, setTemplates] = useState<Template[]>([])
  const [name, setName] = useState("")
  const [saving, startSave] = useTransition()
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    listTemplatesAction(tenantId).then((res) => {
      if (res.success) setTemplates(res.templates ?? [])
      setLoading(false)
    })
  }, [tenantId])

  useEffect(() => { load() }, [load])

  const handleSave = useCallback(() => {
    if (!name.trim()) return
    startSave(async () => {
      const json = query.serialize()
      const res = await saveAsTemplateAction(tenantId, name.trim(), json)
      if (res.success) { toast.success("Template saved"); setName(""); load() }
      else toast.error("Failed to save template")
    })
  }, [tenantId, name, query, load])

  const handleInsert = useCallback(async (templateId: string) => {
    const res = await getTemplateAction(tenantId, templateId)
    if (!res.success || !res.template?.data) { toast.error("Failed to load template"); return }
    try {
      actions.deserialize(res.template.data as string)
      toast.success("Template applied")
    } catch { toast.error("Invalid template data") }
  }, [tenantId, actions])

  const handleDelete = useCallback(async (templateId: string) => {
    await deleteTemplateAction(tenantId, templateId)
    load()
    toast.success("Template deleted")
  }, [tenantId, load])

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <LayoutTemplate className="h-4 w-4" /> Templates
      </div>

      <div className="flex gap-2">
        <Input placeholder="Template name…" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
        <Button className="h-8 shrink-0" onClick={handleSave} disabled={saving || !name.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {loading && <p className="text-xs text-muted-foreground">Loading…</p>}

      <div className="flex flex-col gap-1">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <button className="flex-1 text-left truncate hover:underline" onClick={() => handleInsert(t.id)}>
              {t.name}
            </button>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-destructive" onClick={() => handleDelete(t.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {!loading && templates.length === 0 && (
          <p className="text-xs text-muted-foreground">No templates yet. Save your current page as a template above.</p>
        )}
      </div>
    </div>
  )
}
