"use client"

import { useState } from "react"
import { MediaPickerTrigger } from "@/features/media/components/media-picker-trigger"
import { UnsplashSearch } from "../panels/unsplash-search"
import type { AllowedMimeType } from "@/features/media/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const imageTypes: AllowedMimeType[] = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

export function ImagePickerField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [tab, setTab] = useState<string>("upload")

  return (
    <div>
      <Label className="text-xs font-medium mb-1 block text-muted-foreground">{label}</Label>

      <ToggleGroup type="single" value={tab} onValueChange={(v) => { if (v) setTab(v) }} className="w-full mb-2 border p-0.5" style={{ borderColor: 'var(--editor-border)' }}>
        <ToggleGroupItem value="upload" className="flex-1 h-6 text-[11px]">Upload</ToggleGroupItem>
        <ToggleGroupItem value="stock" className="flex-1 h-6 text-[11px]">Stock Photos</ToggleGroupItem>
      </ToggleGroup>

      {tab === "upload" ? (
        <div className="flex flex-col gap-2">
          <MediaPickerTrigger value={value || undefined} onChange={(v) => onChange((typeof v === "string" ? v : "") || "")} mode="single" accept={imageTypes} placeholder="Select image" />
          <Input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or paste URL…" className="h-7 text-xs" />
        </div>
      ) : (
        <UnsplashSearch onSelect={(url) => { onChange(url); setTab("upload") }} />
      )}
    </div>
  )
}
