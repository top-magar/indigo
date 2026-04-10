"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { saveSeoAction } from "@/features/editor/actions/actions"
import { useEditorV2Context } from "../editor-context"

interface SeoData { title: string; description: string; ogImage: string }

export function SeoPanel({ initial }: { initial: SeoData }) {
  const { tenantId, pageId } = useEditorV2Context()
  const [title, setTitle] = useState(initial.title)
  const [desc, setDesc] = useState(initial.description)
  const [og, setOg] = useState(initial.ogImage)
  const [saving, startSave] = useTransition()

  const save = () => startSave(async () => {
    const r = await saveSeoAction(tenantId, { title, description: desc, ogImage: og }, pageId)
    r.success ? toast.success("SEO saved") : toast.error("Failed to save SEO")
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title…" className="h-7 text-xs" />
        <p className={`text-[11px] ${title.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>{title.length}/60</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Description</Label>
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description…" className="text-xs min-h-[60px]" />
        <p className={`text-[11px] ${desc.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>{desc.length}/160</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">OG Image URL</Label>
        <Input value={og} onChange={(e) => setOg(e.target.value)} placeholder="https://…" className="h-7 text-xs" />
      </div>
      <div className="rounded-md border p-3 space-y-0.5">
        <p className="text-[11px] text-muted-foreground">Google Preview</p>
        <p className="text-sm text-blue-700 truncate">{title || "Page Title"}</p>
        <p className="text-xs text-green-700 truncate">yourstore.com</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{desc || "Description…"}</p>
      </div>
      <Button onClick={save} disabled={saving} size="sm" className="gap-2">
        <Save className="size-3.5" /> {saving ? "Saving…" : "Save SEO"}
      </Button>
    </div>
  )
}
