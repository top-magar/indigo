"use client"

import { useEffect, useState } from "react"
import { RenderSections } from "@/features/editor-v2/render"

export default function EditorPreviewFrame() {
  const [data, setData] = useState<{ sections: unknown[]; theme: Record<string, unknown> } | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "editor-preview-update") {
        setData({ sections: e.data.sections, theme: e.data.theme })
      }
    }
    window.addEventListener("message", handler)
    // Tell parent we're ready
    window.parent.postMessage({ type: "editor-preview-ready" }, "*")
    return () => window.removeEventListener("message", handler)
  }, [])

  if (!data) return <div className="flex h-screen items-center justify-center text-sm text-gray-400">Waiting for editor…</div>

  const t = data.theme
  const style: React.CSSProperties = {
    backgroundColor: (t.backgroundColor as string) ?? "#ffffff",
    color: (t.textColor as string) ?? "#0f172a",
    fontFamily: `"${(t.bodyFont as string) ?? "Inter"}", sans-serif`,
    fontSize: `${(t.baseSize as number) ?? 16}px`,
    lineHeight: String((t.lineHeight as number) ?? 1.6),
    letterSpacing: `${(t.letterSpacing as number) ?? 0}px`,
    ["--store-color-primary" as string]: (t.primaryColor as string) ?? "#3b82f6",
    ["--store-color-secondary" as string]: (t.secondaryColor as string) ?? "#8b5cf6",
    ["--store-color-accent" as string]: (t.accentColor as string) ?? "#06b6d4",
    ["--store-color-bg" as string]: (t.backgroundColor as string) ?? "#ffffff",
    ["--store-color-surface" as string]: (t.surfaceColor as string) ?? "#f8fafc",
    ["--store-color-text" as string]: (t.textColor as string) ?? "#0f172a",
    ["--store-color-muted" as string]: (t.mutedColor as string) ?? "#64748b",
    ["--store-font-heading" as string]: `"${(t.headingFont as string) ?? "Inter"}", sans-serif`,
    ["--store-font-body" as string]: `"${(t.bodyFont as string) ?? "Inter"}", sans-serif`,
    ["--store-heading-weight" as string]: (t.headingWeight as string) ?? "700",
    ["--store-radius" as string]: `${(t.borderRadius as number) ?? 8}px`,
    ["--store-btn-radius" as string]: t.buttonStyle === "pill" ? "9999px" : t.buttonStyle === "sharp" ? "0px" : `${(t.borderRadius as number) ?? 8}px`,
  }

  return (
    <div style={style} className="min-h-screen">
      <RenderSections sections={data.sections as Parameters<typeof RenderSections>[0]["sections"]} />
    </div>
  )
}
