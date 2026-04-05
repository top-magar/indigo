"use client"

import { useState, useTransition } from "react"
import { saveThemeAction } from "../actions"
import { toast } from "sonner"
import { Check, Palette } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface SiteStylesProps {
  tenantId: string
  initial: Record<string, unknown>
  pageId?: string | null
  onThemeChange?: (theme: Record<string, unknown>) => void
}

const fontOptions = [
  "Inter", "System UI", "Georgia", "Playfair Display", "Roboto",
  "Open Sans", "Lato", "Montserrat", "Poppins", "DM Sans",
]

const presets = [
  { name: "Minimal", primary: "#000000", secondary: "#6b7280", accent: "#000000", bg: "#ffffff", text: "#111827" },
  { name: "Ocean", primary: "#0ea5e9", secondary: "#64748b", accent: "#06b6d4", bg: "#f8fafc", text: "#0f172a" },
  { name: "Forest", primary: "#16a34a", secondary: "#6b7280", accent: "#22c55e", bg: "#f0fdf4", text: "#14532d" },
  { name: "Sunset", primary: "#f97316", secondary: "#78716c", accent: "#ef4444", bg: "#fffbeb", text: "#431407" },
  { name: "Royal", primary: "#7c3aed", secondary: "#6b7280", accent: "#a855f7", bg: "#faf5ff", text: "#1e1b4b" },
  { name: "Dark", primary: "#e2e8f0", secondary: "#94a3b8", accent: "#3b82f6", bg: "#0f172a", text: "#f1f5f9" },
]

const colorFields = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "accentColor", label: "Accent" },
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
] as const

interface ThemeState {
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

const defaults: ThemeState = {
  primaryColor: "#000000", secondaryColor: "#6b7280", accentColor: "#3b82f6",
  backgroundColor: "#ffffff", textColor: "#111827",
  headingFont: "Inter", bodyFont: "Inter",
  headingScale: 100, bodyScale: 100,
  headingLetterSpacing: 0, bodyLineHeight: 1.6,
  borderRadius: 8, maxWidth: 1152,
  sectionSpacingV: 0, sectionSpacingH: 0,
  buttonShape: "rounded", buttonStyle: "solid", buttonShadow: "none",
  revealOnScroll: false, hoverEffect: "none", pageTransition: "none",
  faviconUrl: "", customCss: "",
}

function init(i: Record<string, unknown>): ThemeState {
  const t = { ...defaults }
  for (const k of Object.keys(defaults) as (keyof ThemeState)[]) {
    if (i[k] !== undefined && i[k] !== null) (t as Record<string, unknown>)[k] = i[k]
  }
  return t
}

export function SiteStylesPanel({ tenantId, initial, pageId, onThemeChange }: SiteStylesProps) {
  const [theme, setTheme] = useState<ThemeState>(() => init(initial))
  const [saving, startSave] = useTransition()
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const set = <K extends keyof ThemeState>(key: K, val: ThemeState[K]) => {
    const next = { ...theme, [key]: val }
    setTheme(next)
    onThemeChange?.(next as unknown as Record<string, unknown>)
    setActivePreset(null)
  }

  const applyPreset = (p: typeof presets[number]) => {
    const next = { ...theme, primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent, backgroundColor: p.bg, textColor: p.text }
    setTheme(next)
    onThemeChange?.(next as unknown as Record<string, unknown>)
    setActivePreset(p.name)
  }

  const save = () => {
    startSave(async () => {
      const res = await saveThemeAction(tenantId, { ...theme } as Record<string, unknown>, pageId ?? undefined)
      if (res.success) toast.success("Site styles saved")
      else toast.error(res.error || "Failed")
    })
  }

  /* eslint-disable @next/next/no-page-custom-font */
  const fontLink = `https://fonts.googleapis.com/css2?${fontOptions.filter(f => f !== "System UI").map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <link rel="stylesheet" href={fontLink} />

      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Site Styles</span>
      </div>
      <Separator />

      <Tabs defaultValue="all" className="flex flex-col h-full gap-0">
        <TabsList variant="line" className="w-full justify-start px-1 shrink-0 overflow-x-auto scrollbar-none">
          {["all", "colors", "typography", "layout", "buttons", "animations", "advanced"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-[10px] px-1.5">{t.charAt(0).toUpperCase() + t.slice(1)}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* ── COLORS ── */}
          <TabsContent value="all"><AllContent theme={theme} set={set} activePreset={activePreset} applyPreset={applyPreset} /></TabsContent>
          <TabsContent value="colors"><ColorsSection theme={theme} set={set} activePreset={activePreset} applyPreset={applyPreset} /></TabsContent>
          <TabsContent value="typography"><TypographySection theme={theme} set={set} /></TabsContent>
          <TabsContent value="layout"><LayoutSection theme={theme} set={set} /></TabsContent>
          <TabsContent value="buttons"><ButtonsSection theme={theme} set={set} /></TabsContent>
          <TabsContent value="animations"><AnimationsSection theme={theme} set={set} /></TabsContent>
          <TabsContent value="advanced"><AdvancedSection theme={theme} set={set} /></TabsContent>
        </div>
      </Tabs>

      {/* Save */}
      <div className="p-2 border-t border-border">
        <Button onClick={save} disabled={saving} className="w-full h-[30px] text-xs" size="sm">
          {saving ? "Saving…" : "Save Styles"}
        </Button>
      </div>
    </div>
  )
}

/* ── Section Components ── */

type SetFn = <K extends keyof ThemeState>(key: K, val: ThemeState[K]) => void

function AllContent({ theme, set, activePreset, applyPreset }: { theme: ThemeState; set: SetFn; activePreset: string | null; applyPreset: (p: typeof presets[number]) => void }) {
  return (
    <div className="p-2.5 space-y-1">
      <ColorsSection theme={theme} set={set} activePreset={activePreset} applyPreset={applyPreset} />
      <TypographySection theme={theme} set={set} />
      <LayoutSection theme={theme} set={set} />
      <ButtonsSection theme={theme} set={set} />
      <AnimationsSection theme={theme} set={set} />
      <AdvancedSection theme={theme} set={set} />
    </div>
  )
}

function ColorsSection({ theme, set, activePreset, applyPreset }: { theme: ThemeState; set: SetFn; activePreset: string | null; applyPreset: (p: typeof presets[number]) => void }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Presets</SectionHead>
      <div className="grid grid-cols-2 gap-1">
        {presets.map((p) => (
          <Button key={p.name} variant="outline" onClick={() => applyPreset(p)} className="flex items-center gap-1.5 px-1.5 py-1 h-auto rounded-[5px] justify-start text-left" style={{
            borderColor: activePreset === p.name ? 'var(--editor-accent)' : 'var(--editor-border)',
            background: activePreset === p.name ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
          }}>
            <div className="flex gap-0.5 shrink-0">
              {[p.primary, p.accent, p.bg].map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-[11px] font-medium truncate text-foreground">{p.name}</span>
          </Button>
        ))}
      </div>

      <SectionHead>Colors</SectionHead>
      <div className="space-y-1.5">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 h-7">
            <label className="relative shrink-0 cursor-pointer">
              <input type="color" value={theme[key]} onChange={(e) => set(key, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-[22px] h-[22px] rounded border" style={{ borderColor: 'var(--editor-border)', backgroundColor: theme[key] }} />
            </label>
            <Label className="flex-1 text-xs font-medium">{label}</Label>
            <Input value={theme[key]} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set(key, e.target.value) }}
              className="w-[68px] h-[22px] px-1 text-[11px] font-mono text-center" />
          </div>
        ))}
      </div>

      <SectionHead>Shape</SectionHead>
      <SliderRow label="Radius" value={theme.borderRadius} unit="px" min={0} max={24} onChange={(v) => set("borderRadius", v)} />
      <div className="flex gap-1.5 justify-center pt-1">
        {[0, 4, 8, 16, 24].map((r) => (
          <Button key={r} variant="outline" size="icon" className="w-7 h-7" onClick={() => set("borderRadius", r)} style={{
            borderRadius: r,
            borderWidth: theme.borderRadius === r ? 2 : 1,
            borderColor: theme.borderRadius === r ? 'var(--editor-accent)' : 'var(--editor-border)',
            background: theme.borderRadius === r ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
          }}>
            {theme.borderRadius === r && <Check className="w-3 h-3" style={{ color: 'var(--editor-accent)' }} />}
          </Button>
        ))}
      </div>
    </div>
  )
}

function TypographySection({ theme, set }: { theme: ThemeState; set: SetFn }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Fonts</SectionHead>
      <div className="space-y-1.5">
        <FontSelect label="Heading" value={theme.headingFont} onChange={(v) => set("headingFont", v)} />
        <FontSelect label="Body" value={theme.bodyFont} onChange={(v) => set("bodyFont", v)} />
      </div>

      <SectionHead>Scale</SectionHead>
      <div className="space-y-1">
        <SliderRow label="Heading size" value={theme.headingScale} unit="%" min={75} max={150} step={5} onChange={(v) => set("headingScale", v)} />
        <SliderRow label="Body size" value={theme.bodyScale} unit="%" min={75} max={150} step={5} onChange={(v) => set("bodyScale", v)} />
      </div>

      <SectionHead>Spacing</SectionHead>
      <div className="space-y-1">
        <SliderRow label="Heading tracking" value={theme.headingLetterSpacing} unit="em" min={-0.05} max={0.2} step={0.01} onChange={(v) => set("headingLetterSpacing", v)} />
        <SliderRow label="Body line height" value={theme.bodyLineHeight} unit="" min={1.2} max={2.2} step={0.1} onChange={(v) => set("bodyLineHeight", v)} />
      </div>

      {/* Preview */}
      <div className="p-2 rounded border" style={{ borderColor: 'var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
        <p className="m-0 font-bold" style={{ fontFamily: theme.headingFont, fontSize: 14 * (theme.headingScale / 100), lineHeight: 1.2, letterSpacing: `${theme.headingLetterSpacing}em`, color: 'var(--editor-text)' }}>Heading Preview</p>
        <p className="mt-1 mb-0" style={{ fontFamily: theme.bodyFont, fontSize: 12 * (theme.bodyScale / 100), lineHeight: theme.bodyLineHeight, color: 'var(--editor-text-secondary)' }}>Body text in {theme.bodyFont} at {theme.bodyScale}%</p>
      </div>
    </div>
  )
}

function LayoutSection({ theme, set }: { theme: ThemeState; set: SetFn }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Max Width</SectionHead>
      <div className="space-y-1">
        {[
          { value: 960, label: "960px", desc: "Narrow" },
          { value: 1152, label: "1152px", desc: "Default" },
          { value: 1280, label: "1280px", desc: "Wide" },
          { value: 1440, label: "1440px", desc: "Extra wide" },
          { value: 0, label: "Full", desc: "No limit" },
        ].map((opt) => (
          <OptionBtn key={opt.value} selected={theme.maxWidth === opt.value} onClick={() => set("maxWidth", opt.value)} label={opt.label} desc={opt.desc} />
        ))}
        <SliderRow label="Custom" value={theme.maxWidth || 1600} unit="px" min={800} max={1600} step={8} onChange={(v) => set("maxWidth", v)} />
      </div>

      <SectionHead>Section Spacing</SectionHead>
      <div className="space-y-1">
        <SliderRow label="Vertical gap" value={theme.sectionSpacingV} unit="px" min={0} max={100} step={4} onChange={(v) => set("sectionSpacingV", v)} />
        <SliderRow label="Horizontal padding" value={theme.sectionSpacingH} unit="px" min={0} max={80} step={4} onChange={(v) => set("sectionSpacingH", v)} />
      </div>
    </div>
  )
}

function ButtonsSection({ theme, set }: { theme: ThemeState; set: SetFn }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Button Shape</SectionHead>
      <div className="flex gap-1">
        {(["square", "rounded", "pill"] as const).map((s) => (
          <Button key={s} variant={theme.buttonShape === s ? "default" : "outline"} size="sm"
            onClick={() => set("buttonShape", s)}
            className="flex-1 h-8 text-[11px]"
            style={{ borderRadius: s === "square" ? 2 : s === "rounded" ? 6 : 16 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <SectionHead>Button Style</SectionHead>
      <div className="space-y-1">
        {(["solid", "outline", "ghost"] as const).map((s) => (
          <OptionBtn key={s} selected={theme.buttonStyle === s} onClick={() => set("buttonStyle", s)}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            desc={s === "solid" ? "Filled background" : s === "outline" ? "Border only" : "Text only"} />
        ))}
      </div>

      <SectionHead>Button Shadow</SectionHead>
      <div className="space-y-1">
        {(["none", "sm", "md", "lg"] as const).map((s) => (
          <OptionBtn key={s} selected={theme.buttonShadow === s} onClick={() => set("buttonShadow", s)}
            label={s === "none" ? "None" : s.toUpperCase()} desc={s === "none" ? "Flat" : `${s} shadow`} />
        ))}
      </div>
    </div>
  )
}

function AnimationsSection({ theme, set }: { theme: ThemeState; set: SetFn }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Reveal on Scroll</SectionHead>
      <label className="flex items-center gap-2 cursor-pointer py-1">
        <Checkbox checked={theme.revealOnScroll} onCheckedChange={(v) => set("revealOnScroll", v === true)} />
        <div>
          <div className="text-xs font-medium text-foreground">Reveal sections on scroll</div>
          <div className="text-[11px] text-muted-foreground/60">Sections fade in as visitors scroll</div>
        </div>
      </label>

      <SectionHead>Hover Effect</SectionHead>
      <div className="space-y-1">
        {([
          { value: "none", label: "None", desc: "No hover animation" },
          { value: "lift", label: "Vertical Lift", desc: "Cards shift up on hover" },
          { value: "3d-lift", label: "3D Lift", desc: "Cards lift forward with shine" },
          { value: "scale", label: "Scale", desc: "Cards grow slightly on hover" },
        ] as const).map((opt) => (
          <OptionBtn key={opt.value} selected={theme.hoverEffect === opt.value} onClick={() => set("hoverEffect", opt.value)} label={opt.label} desc={opt.desc} />
        ))}
      </div>

      <SectionHead>Page Transitions</SectionHead>
      <div className="space-y-1">
        {([
          { value: "none", label: "None" },
          { value: "fade", label: "Fade" },
          { value: "slide-left", label: "Slide Left" },
          { value: "slide-up", label: "Slide Up" },
        ] as const).map((opt) => (
          <OptionBtn key={opt.value} selected={theme.pageTransition === opt.value} onClick={() => set("pageTransition", opt.value)} label={opt.label} />
        ))}
        <p className="text-[11px] mt-0.5 text-muted-foreground/60">Applies when visitors navigate between pages.</p>
      </div>
    </div>
  )
}

function AdvancedSection({ theme, set }: { theme: ThemeState; set: SetFn }) {
  return (
    <div className="p-2.5 space-y-3">
      <SectionHead>Favicon</SectionHead>
      {theme.faviconUrl ? (
        <div className="flex items-center gap-2">
          <img src={theme.faviconUrl} alt="Favicon" className="w-8 h-8 rounded border border-border" />
          <Button variant="link" size="sm" className="text-[11px] h-auto p-0" onClick={() => set("faviconUrl", "")}>Remove</Button>
        </div>
      ) : (
        <div>
          <Input placeholder="Paste favicon URL (32×32px)" value={theme.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} className="h-7 text-xs" />
          <p className="text-[11px] mt-1 text-muted-foreground/60">Recommended: 32×32px PNG or SVG</p>
        </div>
      )}

      <SectionHead>Custom CSS</SectionHead>
      <Textarea
        value={theme.customCss}
        onChange={(e) => set("customCss", e.target.value)}
        placeholder={".my-class {\n  color: red;\n}"}
        spellCheck={false}
        className="font-mono text-xs h-[120px] resize-y"
      />
      <p className="text-[11px] text-muted-foreground/60">Applies to your entire store. Does not affect checkout.</p>
    </div>
  )
}

/* ── Shared Components ── */

function SectionHead({ children }: { children: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground/60">{children}</p>
}

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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

function SliderRow({ label, value, unit, min, max, step, onChange }: { label: string; value: number; unit: string; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const display = Number.isInteger(value) ? value : value.toFixed(2).replace(/0$/, "")
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <Label className="text-xs">{label}</Label>
        <span className="text-[11px] font-mono px-1 rounded text-muted-foreground bg-muted" style={{ lineHeight: '18px' }}>{display}{unit}</span>
      </div>
      <Slider min={min} max={max} step={step ?? 1} value={[value]} onValueChange={([v]) => onChange(v)} className="h-4" />
    </div>
  )
}

function OptionBtn({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc?: string }) {
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
      {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--editor-accent)' }} />}
    </Button>
  )
}
