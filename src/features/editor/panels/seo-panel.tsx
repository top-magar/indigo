"use client"

import { useCallback, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Save } from "lucide-react"
import { toast } from "sonner"
import { saveSeoAction } from "../actions/actions"

interface Props {
  tenantId: string
  pageId: string | null
  initial: { title: string; description: string; ogImage: string }
  storeSlug: string
}

export function SeoPanel({ tenantId, pageId, initial, storeSlug }: Props) {
  const seo = initial ?? { title: "", description: "", ogImage: "" }
  const [title, setTitle] = useState(seo.title)
  const [description, setDescription] = useState(seo.description)
  const [ogImage, setOgImage] = useState(seo.ogImage)
  const [saving, startSave] = useTransition()

  const handleSave = useCallback(() => {
    startSave(async () => {
      const res = await saveSeoAction(tenantId, { title, description, ogImage }, pageId ?? undefined)
      if (res.success) toast.success("SEO saved")
      else toast.error("Failed to save SEO")
    })
  }, [tenantId, pageId, title, description, ogImage])

  const titleLen = title.length
  const descLen = description.length

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Search className="size-4" /> SEO Settings
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Meta Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title…" className="h-8 text-sm" />
        <p className={`text-[11px] ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>{titleLen}/60</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Meta Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Page description…" className="text-sm min-h-[60px]" />
        <p className={`text-[11px] ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>{descLen}/160</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">OG Image URL</Label>
        <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" className="h-8 text-sm" />
      </div>

      {/* Google preview */}
      <div className="rounded-md border p-3 space-y-1" style={{ background: "var(--editor-chrome-bg)" }}>
        <p className="text-[11px] text-muted-foreground">Google Preview</p>
        <p className="text-sm text-blue-700 truncate">{title || "Page Title"}</p>
        <p className="text-xs text-green-700 truncate">{storeSlug}.mystore.com</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description || "Page description will appear here…"}</p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save className="size-3.5" /> {saving ? "Saving…" : "Save SEO"}
      </Button>
    </div>
  )
}
