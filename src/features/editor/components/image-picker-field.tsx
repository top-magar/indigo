"use client"

import { useState } from "react"
import { MediaPickerTrigger } from "@/features/media/components/media-picker-trigger"
import { UnsplashSearch } from "./unsplash-search"
import type { AllowedMimeType } from "@/features/media/types"
import { cn } from "@/shared/utils"

interface ImagePickerFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

const imageTypes: AllowedMimeType[] = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const [tab, setTab] = useState<"upload" | "stock">("upload")

  return (
    <div className="flex flex-col gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span>{label}</span>

      {/* Tab switcher */}
      <div className="flex gap-0.5 rounded border border-border/50 bg-muted/30 p-0.5">
        <button
          onClick={() => setTab("upload")}
          className={cn("flex-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", tab === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Upload
        </button>
        <button
          onClick={() => setTab("stock")}
          className={cn("flex-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", tab === "stock" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Stock Photos
        </button>
      </div>

      {tab === "upload" ? (
        <>
          <MediaPickerTrigger
            value={value || undefined}
            onChange={(v) => onChange((typeof v === "string" ? v : "") || "")}
            mode="single"
            accept={imageTypes}
            placeholder="Select image"
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL…"
            className="h-7 rounded border border-border/50 bg-background px-2 text-[11px]"
          />
        </>
      ) : (
        <UnsplashSearch onSelect={(url) => { onChange(url); setTab("upload") }} />
      )}
    </div>
  )
}
