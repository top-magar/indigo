"use client"

import { useEditorStore } from "@/features/editor-v2/store"
import { RenderSections } from "@/features/editor-v2/render"

export default function EditorPreviewFrame() {
  const sections = useEditorStore((s) => s.sections)
  const theme = useEditorStore((s) => s.theme)

  const t = theme
  const primaryColor = (t.primaryColor as string) ?? "#3b82f6"
  const headingFont = (t.headingFont as string) ?? "Inter"
  const bodyFont = (t.bodyFont as string) ?? "Inter"
  const style: React.CSSProperties = {
    backgroundColor: (t.backgroundColor as string) ?? "#ffffff",
    color: (t.textColor as string) ?? "#0f172a",
    fontFamily: `"${bodyFont}", sans-serif`,
    fontSize: `${(t.baseSize as number) ?? 16}px`,
    lineHeight: String((t.lineHeight as number) ?? 1.6),
    letterSpacing: `${(t.letterSpacing as number) ?? 0}px`,
    ["--store-color-primary" as string]: primaryColor,
    ["--store-color-secondary" as string]: (t.secondaryColor as string) ?? "#8b5cf6",
    ["--store-color-accent" as string]: (t.accentColor as string) ?? "#06b6d4",
    ["--store-color-bg" as string]: (t.backgroundColor as string) ?? "#ffffff",
    ["--store-color-surface" as string]: (t.surfaceColor as string) ?? "#f8fafc",
    ["--store-color-text" as string]: (t.textColor as string) ?? "#0f172a",
    ["--store-color-muted" as string]: (t.mutedColor as string) ?? "#64748b",
    ["--store-font-heading" as string]: `"${headingFont}", sans-serif`,
    ["--store-font-body" as string]: `"${bodyFont}", sans-serif`,
    ["--store-heading-weight" as string]: (t.headingWeight as string) ?? "700",
    ["--store-radius" as string]: `${(t.borderRadius as number) ?? 8}px`,
    ["--store-btn-radius" as string]: t.buttonStyle === "pill" ? "9999px" : t.buttonStyle === "sharp" ? "0px" : `${(t.borderRadius as number) ?? 8}px`,
  }

  if (sections.length === 0) {
    return <div className="flex h-screen items-center justify-center text-sm text-gray-400">No sections to preview</div>
  }

  return (
    <>
      {headingFont !== "Inter" && <link href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;500;600;700&display=swap`} rel="stylesheet" />}
      {bodyFont !== "Inter" && bodyFont !== headingFont && <link href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(bodyFont)}:wght@300;400;500;600;700&display=swap`} rel="stylesheet" />}
      <div style={style} className="min-h-screen">
        <RenderSections sections={sections as Parameters<typeof RenderSections>[0]["sections"]} />
      </div>
    </>
  )
}
