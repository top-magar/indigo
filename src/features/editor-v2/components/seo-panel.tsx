"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { saveSeoAction } from "@/features/editor/actions/actions"
import { useEditorV2Context } from "../editor-context"
import { useEditorStore } from "../store"

interface SeoData {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage: string
  twitterCard?: "summary" | "summary_large_image"
}

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className={`text-[11px] ${current > max ? "text-destructive" : "text-muted-foreground"}`}>
      {current}/{max}
    </p>
  )
}

export function SeoPanel({ initial }: { initial: SeoData }) {
  const { tenantId, pageId } = useEditorV2Context()
  const { theme, updateTheme } = useEditorStore()
  const [title, setTitle] = useState(initial.title)
  const [desc, setDesc] = useState(initial.description)
  const [ogTitle, setOgTitle] = useState(initial.ogTitle ?? "")
  const [ogDesc, setOgDesc] = useState(initial.ogDescription ?? "")
  const [ogImage, setOgImage] = useState(initial.ogImage)
  const [twitterCard, setTwitterCard] = useState<"summary" | "summary_large_image">(initial.twitterCard ?? "summary_large_image")
  const [saving, startSave] = useTransition()

  const save = () => startSave(async () => {
    const r = await saveSeoAction(tenantId, {
      title,
      description: desc,
      ogTitle: ogTitle || undefined,
      ogDescription: ogDesc || undefined,
      ogImage,
      twitterCard,
    }, pageId)
    r.success ? toast.success("SEO saved") : toast.error("Failed to save SEO")
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Meta Title */}
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title…" className="h-7 text-xs" />
        <CharCount current={title.length} max={60} />
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Description</Label>
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description…" className="text-xs min-h-[60px]" />
        <CharCount current={desc.length} max={160} />
      </div>

      {/* Google Preview */}
      <div className="rounded-md border bg-white p-3 space-y-0.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Google Preview</p>
        <p className="text-sm text-[#1a0dab] truncate font-medium">{title || "Page Title"}</p>
        <p className="text-xs text-[#006621] truncate">yourstore.com</p>
        <p className="text-xs text-[#545454] line-clamp-2">{desc || "Page description will appear here…"}</p>
      </div>

      <div className="border-t pt-3 space-y-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Open Graph</p>

        {/* OG Title */}
        <div className="space-y-1.5">
          <Label className="text-xs">OG Title</Label>
          <Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder={title || "Defaults to meta title"} className="h-7 text-xs" />
        </div>

        {/* OG Description */}
        <div className="space-y-1.5">
          <Label className="text-xs">OG Description</Label>
          <Textarea value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} placeholder={desc || "Defaults to meta description"} className="text-xs min-h-[50px]" />
        </div>

        {/* OG Image */}
        <div className="space-y-1.5">
          <Label className="text-xs">OG Image URL</Label>
          <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" className="h-7 text-xs" />
        </div>

        {/* Site Name */}
        <div className="space-y-1.5">
          <Label className="text-xs">Site Name</Label>
          <Input value={(theme.siteName ?? "") as string} onChange={(e) => updateTheme({ siteName: e.target.value })} placeholder="My Store" className="h-7 text-xs" />
        </div>

        {/* Default Share Text */}
        <div className="space-y-1.5">
          <Label className="text-xs">Default Share Text</Label>
          <Textarea value={(theme.defaultShareText ?? "") as string} onChange={(e) => updateTheme({ defaultShareText: e.target.value })} placeholder="Check out our store…" className="text-xs min-h-[50px]" />
        </div>

        {/* Twitter Card */}
        <div className="space-y-1.5">
          <Label className="text-xs">Twitter Card</Label>
          <Select value={twitterCard} onValueChange={(v) => setTwitterCard(v as "summary" | "summary_large_image")}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={save} disabled={saving} size="sm" className="gap-2">
        <Save className="size-3.5" /> {saving ? "Saving…" : "Save SEO"}
      </Button>
    </div>
  )
}
