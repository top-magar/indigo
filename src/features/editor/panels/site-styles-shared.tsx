"use client"

import { Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export interface ThemeState {
  primaryColor: string; secondaryColor: string; accentColor: string
  backgroundColor: string; textColor: string
  headingFont: string; bodyFont: string
  headingScale: number; bodyScale: number
  headingLetterSpacing: number; bodyLineHeight: number
  borderRadius: number; maxWidth: number
  sectionSpacingV: number; sectionSpacingH: number
  buttonShape: string; buttonStyle: string; buttonShadow: string
  revealOnScroll: boolean; hoverEffect: string; pageTransition: string
  faviconUrl: string; customCss: string
}

export type SetFn = <K extends keyof ThemeState>(key: K, val: ThemeState[K]) => void

export const defaults: ThemeState = {
  primaryColor: "#000000", secondaryColor: "#6b7280", accentColor: "#3b82f6",
  backgroundColor: "#ffffff", textColor: "#111827",
  headingFont: "Inter", bodyFont: "Inter",
  headingScale: 100, bodyScale: 100,
  headingLetterSpacing: 0, bodyLineHeight: 1.6,
  borderRadius: 8, maxWidth: 1152,
  sectionSpacingV: 48, sectionSpacingH: 24,
  buttonShape: "rounded", buttonStyle: "solid", buttonShadow: "none",
  revealOnScroll: false, hoverEffect: "none", pageTransition: "none",
  faviconUrl: "", customCss: "",
}

export const fontOptions = [
  "Inter", "System UI", "Georgia", "Playfair Display", "Roboto",
  "Open Sans", "Lato", "Montserrat", "Poppins", "DM Sans",
]

export const presets = [
  { name: "Minimal", primary: "#000000", secondary: "#6b7280", accent: "#000000", bg: "#ffffff", text: "#111827" },
  { name: "Ocean", primary: "#0ea5e9", secondary: "#64748b", accent: "#06b6d4", bg: "#f8fafc", text: "#0f172a" },
  { name: "Forest", primary: "#16a34a", secondary: "#6b7280", accent: "#22c55e", bg: "#f0fdf4", text: "#14532d" },
  { name: "Sunset", primary: "#f97316", secondary: "#78716c", accent: "#ef4444", bg: "#fffbeb", text: "#431407" },
  { name: "Royal", primary: "#7c3aed", secondary: "#6b7280", accent: "#a855f7", bg: "#faf5ff", text: "#1e1b4b" },
  { name: "Dark", primary: "#e2e8f0", secondary: "#94a3b8", accent: "#3b82f6", bg: "#0f172a", text: "#f1f5f9" },
] as const

export const colorFields = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "accentColor", label: "Accent" },
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
] as const

export function SectionHead({ children }: { children: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground/60">{children}</p>
}

export function SliderRow({ label, value, unit, min, max, step, onChange }: { label: string; value: number; unit: string; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const display = Number.isInteger(value) ? value : value.toFixed(2).replace(/0$/, "")
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] shrink-0 w-[72px] truncate">{label}</Label>
      <Slider min={min} max={max} step={step ?? 1} value={[value]} onValueChange={([v]) => onChange(v)} className="h-4 flex-1" />
      <span className="text-[11px] font-mono px-1 rounded text-muted-foreground bg-muted shrink-0 min-w-[36px] text-right" style={{ lineHeight: '18px' }}>{display}{unit}</span>
    </div>
  )
}

export function OptionBtn({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc?: string }) {
  return (
    <Button variant="outline" onClick={onClick} className="flex items-center justify-between w-full px-2.5 py-[7px] h-auto rounded-[5px] text-left" style={{
      borderWidth: selected ? 1.5 : 1,
      borderColor: selected ? 'var(--editor-accent)' : 'var(--editor-border)',
      background: selected ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
    }}>
      <div>
        <div className="text-xs font-medium text-foreground">{label}</div>
        {desc && <div className="text-[11px] font-normal text-muted-foreground/60">{desc}</div>}
      </div>
      {selected && <Check className="size-3.5 shrink-0 text-blue-600" />}
    </Button>
  )
}

export function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs font-medium w-[52px] shrink-0">{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-[26px] px-1.5 text-xs rounded border cursor-pointer border-input bg-background text-foreground" style={{ fontFamily: value }}>
        {fontOptions.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
      </select>
    </div>
  )
}

export function initTheme(i: Record<string, unknown>): ThemeState {
  const t = { ...defaults }
  for (const k of Object.keys(defaults) as (keyof ThemeState)[]) {
    if (i[k] !== undefined && i[k] !== null) (t as Record<string, unknown>)[k] = i[k]
  }
  return t
}
