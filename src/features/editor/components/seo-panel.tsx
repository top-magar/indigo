"use client"

import { useState, useTransition } from "react"
import { saveSeoAction } from "../actions"
import { ImagePickerField } from "./image-picker-field"
import { toast } from "sonner"
import { Globe } from "lucide-react"

interface SeoPanelProps {
  tenantId: string
  initial: { title: string; description: string; ogImage: string }
  pageId?: string | null
}

export function SeoPanel({ tenantId, initial, pageId }: SeoPanelProps) {
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
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">Search Engine</h4>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">Page Title</span>
              <span className={`text-[10px] ${titleLen > 60 ? "text-destructive" : "text-muted-foreground/60"}`}>{titleLen}/60</span>
            </div>
            <input
              type="text"
              value={seo.title}
              onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
              placeholder="My Store — Best Products"
              className="rounded border border-border/50 bg-muted/30 px-3 py-2 text-[11px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">Meta Description</span>
              <span className={`text-[10px] ${descLen > 160 ? "text-destructive" : "text-muted-foreground/60"}`}>{descLen}/160</span>
            </div>
            <textarea
              value={seo.description}
              onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
              placeholder="Describe your store in 1-2 sentences…"
              className="rounded border border-border/50 bg-muted/30 px-3 py-2 text-[11px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              rows={3}
            />
          </label>

          <ImagePickerField label="OG Image (Social Share)" value={seo.ogImage} onChange={(url) => setSeo((s) => ({ ...s, ogImage: url }))} />
        </div>
      </div>

      {/* Google Preview */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">Search Preview</h4>
        <div className="mt-3 rounded border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <Globe className="h-3 w-3 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">yourstore.com</p>
            </div>
          </div>
          <p className="mt-2 truncate text-[11px] font-medium text-blue-600">{seo.title || "Page Title"}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{seo.description || "Your page description will appear here in search results…"}</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save SEO"}
      </button>
    </div>
  )
}
