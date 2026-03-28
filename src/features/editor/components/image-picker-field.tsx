"use client"

import { MediaPickerTrigger } from "@/features/media/components/media-picker-trigger"
import type { AllowedMimeType } from "@/features/media/types"

interface ImagePickerFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

const imageTypes: AllowedMimeType[] = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground">
      {label}
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
    </label>
  )
}
