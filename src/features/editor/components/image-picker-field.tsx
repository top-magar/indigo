"use client"

import { useState } from "react"
import { MediaPickerTrigger } from "@/features/media/components/media-picker-trigger"
import { UnsplashSearch } from "./unsplash-search"
import type { AllowedMimeType } from "@/features/media/types"

interface ImagePickerFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

const imageTypes: AllowedMimeType[] = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const [tab, setTab] = useState<"upload" | "stock">("upload")

  const tabBtn = (t: "upload" | "stock", text: string) => ({
    style: {
      flex: 1, padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
      fontSize: 11, fontWeight: 500 as const, transition: 'all 0.1s',
      background: tab === t ? 'var(--editor-surface)' : 'transparent',
      color: tab === t ? 'var(--editor-text)' : 'var(--editor-text-secondary)',
      boxShadow: tab === t ? 'var(--editor-shadow-card)' : 'none',
    } satisfies React.CSSProperties,
    onClick: () => setTab(t),
    children: text,
  })

  return (
    <div>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)', marginBottom: 4 }}>{label}</span>

      <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)', marginBottom: 8 }}>
        <button {...tabBtn("upload", "Upload")} />
        <button {...tabBtn("stock", "Stock Photos")} />
      </div>

      {tab === "upload" ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            style={{
              height: 28, padding: '0 8px', fontSize: 12,
              background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
              borderRadius: 'var(--editor-radius)', color: 'var(--editor-text)',
            }}
          />
        </div>
      ) : (
        <UnsplashSearch onSelect={(url) => { onChange(url); setTab("upload") }} />
      )}
    </div>
  )
}
