"use client"

import { useState, useTransition } from "react"
import { saveThemeAction } from "../actions"
import { toast } from "sonner"

interface ThemePanelProps {
  tenantId: string
  initial: Record<string, unknown>
  pageId?: string | null
}

const fontOptions = [
  "Inter", "System UI", "Georgia", "Playfair Display", "Roboto",
  "Open Sans", "Lato", "Montserrat", "Poppins", "DM Sans",
]

const colorFields = [
  { key: "primaryColor", label: "Primary", desc: "Buttons, links, accents" },
  { key: "secondaryColor", label: "Secondary", desc: "Supporting elements" },
  { key: "accentColor", label: "Accent", desc: "Highlights, badges" },
  { key: "backgroundColor", label: "Background", desc: "Page background" },
  { key: "textColor", label: "Text", desc: "Body text color" },
] as const

export function ThemePanel({ tenantId, initial, pageId }: ThemePanelProps) {
  const [theme, setTheme] = useState({
    primaryColor: (initial.primaryColor as string) || "#000000",
    secondaryColor: (initial.secondaryColor as string) || "#6b7280",
    accentColor: (initial.accentColor as string) || "#3b82f6",
    backgroundColor: (initial.backgroundColor as string) || "#ffffff",
    textColor: (initial.textColor as string) || "#111827",
    headingFont: (initial.headingFont as string) || "Inter",
    bodyFont: (initial.bodyFont as string) || "Inter",
    borderRadius: (initial.borderRadius as number) || 8,
  })
  const [saving, startSave] = useTransition()

  const update = <K extends keyof typeof theme>(key: K, val: (typeof theme)[K]) => {
    setTheme((t) => ({ ...t, [key]: val }))
  }

  const handleSave = () => {
    startSave(async () => {
      const res = await saveThemeAction(tenantId, theme, pageId ?? undefined)
      if (res.success) toast.success("Theme saved")
      else toast.error(res.error || "Failed to save theme")
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Colors */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">Colors</h4>
        <div className="mt-3 flex flex-col gap-2.5">
          {colorFields.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="relative">
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-8 w-8 cursor-pointer appearance-none rounded border border-border/50 bg-transparent p-0.5"
                />
              </label>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground/60">{desc}</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{theme[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">Typography</h4>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-foreground">Heading Font</span>
            <select value={theme.headingFont} onChange={(e) => update("headingFont", e.target.value)} className="rounded border border-border/50 bg-muted/30 px-3 py-2 text-[11px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20">
              {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-foreground">Body Font</span>
            <select value={theme.bodyFont} onChange={(e) => update("bodyFont", e.target.value)} className="rounded border border-border/50 bg-muted/30 px-3 py-2 text-[11px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20">
              {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">Shape</h4>
        <label className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">Corner Radius</span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{theme.borderRadius}px</span>
          </div>
          <input type="range" min={0} max={24} value={theme.borderRadius} onChange={(e) => update("borderRadius", +e.target.value)} className="accent-primary" />
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>Sharp</span><span>Round</span>
          </div>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Theme"}
      </button>
    </div>
  )
}
