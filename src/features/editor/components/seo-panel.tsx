"use client"

import { useState, useTransition } from "react"
import { saveSeoAction } from "../actions"
import { ImagePickerField } from "./image-picker-field"
import { useEditorContext } from "../editor-context"
import { toast } from "sonner"
import { Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SeoPanel() {
  const { tenantId, seoInitial: initial, pageId } = useEditorContext()
  const [seo, setSeo] = useState(initial)
  const [saving, startSave] = useTransition()

  const handleSave = () => {
    startSave(async () => {
      const res = await saveSeoAction(tenantId, seo, pageId ?? undefined)
      if (res.success) toast.success("SEO saved")
      else toast.error(res.error || "Failed to save")
    })
  }

  const titleLen = seo.title.length
  const descLen = seo.description.length

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-xs font-medium">Page Title</Label>
            <span className="text-[11px]" style={{ color: titleLen > 60 ? '#c70a24' : 'var(--editor-text-disabled)' }}>{titleLen}/60</span>
          </div>
          <Input value={seo.title} onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))} placeholder="My Store — Best Products" className="h-8 text-[13px]" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-xs font-medium">Meta Description</Label>
            <span className="text-[11px]" style={{ color: descLen > 160 ? '#c70a24' : 'var(--editor-text-disabled)' }}>{descLen}/160</span>
          </div>
          <Textarea value={seo.description} onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))} placeholder="Describe your store in 1-2 sentences…" rows={3} className="text-[13px] resize-y" />
        </div>

        <ImagePickerField label="OG Image (Social Share)" value={seo.ogImage} onChange={(url) => setSeo((s) => ({ ...s, ogImage: url }))} />
      </div>

      {/* Google Preview */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Search Preview</p>
        <div className="p-2 rounded border" style={{ borderColor: 'var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--editor-fill-secondary)' }}>
              <Globe className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">yourstore.com</span>
          </div>
          <p className="mt-2 text-[13px] font-medium truncate" style={{ color: '#1a0dab' }}>{seo.title || "Page Title"}</p>
          <p className="mt-1 text-xs line-clamp-2 text-muted-foreground" style={{ lineHeight: '18px' }}>{seo.description || "Your page description will appear here in search results…"}</p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-8 text-[13px]">
        {saving ? "Saving…" : "Save SEO"}
      </Button>
    </div>
  )
}
