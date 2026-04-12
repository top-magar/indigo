"use client"

import { useEditorStore } from "../../store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SectionLabel } from "../ui-primitives"

function CharCount({ current, max }: { current: number; max: number }) {
  return <p className={`text-[10px] ${current > max ? "text-destructive" : "text-muted-foreground/60"}`}>{current}/{max}</p>
}

export function SeoPanel() {
  const theme = useEditorStore(s => s.theme)
  const updateTheme = useEditorStore(s => s.updateTheme)

  const g = (k: string) => (theme[k] as string) ?? ""
  const set = (k: string, v: string) => updateTheme({ [k]: v })

  const title = g("seoTitle")
  const desc = g("seoDescription")
  const ogTitle = g("ogTitle")
  const ogDesc = g("ogDescription")
  const ogImage = g("ogImage")
  const twitterCard = g("twitterCard") || "summary_large_image"

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Title</Label>
        <Input value={title} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Page title…" className="h-7 text-xs" />
        <CharCount current={title.length} max={60} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Meta Description</Label>
        <Textarea value={desc} onChange={(e) => set("seoDescription", e.target.value)} placeholder="Description…" className="text-xs min-h-[60px]" />
        <CharCount current={desc.length} max={160} />
      </div>

      {/* Google Preview */}
      <div className="rounded-md border bg-white p-3 space-y-0.5">
        <p className="mb-1"><SectionLabel>Google Preview</SectionLabel></p>
        <p className="text-sm text-[#1a0dab] truncate font-medium">{title || "Page Title"}</p>
        <p className="text-xs text-[#006621] truncate">yourstore.com</p>
        <p className="text-xs text-[#545454] line-clamp-2">{desc || "Page description will appear here…"}</p>
      </div>

      <div className="border-t border-border/20 pt-3 space-y-3">
        <SectionLabel>Open Graph</SectionLabel>

        <div className="space-y-1.5">
          <Label className="text-xs">OG Title</Label>
          <Input value={ogTitle} onChange={(e) => set("ogTitle", e.target.value)} placeholder={title || "Defaults to meta title"} className="h-7 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">OG Description</Label>
          <Textarea value={ogDesc} onChange={(e) => set("ogDescription", e.target.value)} placeholder={desc || "Defaults to meta description"} className="text-xs min-h-[50px]" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">OG Image URL</Label>
          <Input value={ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://…" className="h-7 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Twitter Card</Label>
          <Select value={twitterCard} onValueChange={(v) => set("twitterCard", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Site Name</Label>
          <Input value={g("siteName")} onChange={(e) => set("siteName", e.target.value)} placeholder="My Store" className="h-7 text-xs" />
        </div>
      </div>
    </div>
  )
}
