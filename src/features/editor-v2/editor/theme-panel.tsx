"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useEditorStore } from "./store"
import { DEFAULT_THEME, SPACING_STEP } from "../core/tokens"

export function ThemePanel() {
  const theme = useEditorStore((s) => s.theme)
  const setTheme = useEditorStore((s) => s.setTheme)

  const get = <K extends keyof typeof DEFAULT_THEME>(key: K) =>
    (theme[key] ?? DEFAULT_THEME[key]) as typeof DEFAULT_THEME[K]

  const set = <K extends keyof typeof DEFAULT_THEME>(key: K, value: typeof DEFAULT_THEME[K]) =>
    setTheme({ ...theme, [key]: value })

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[12px] font-semibold">Site Styles</span>
      </div>

      <Section title="Colors">
        <ColorRow label="Primary" value={get("primaryColor")} onChange={(v) => set("primaryColor", v)} />
        <ColorRow label="Secondary" value={get("secondaryColor")} onChange={(v) => set("secondaryColor", v)} />
        <ColorRow label="Accent" value={get("accentColor")} onChange={(v) => set("accentColor", v)} />
        <ColorRow label="Background" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
        <ColorRow label="Text" value={get("textColor")} onChange={(v) => set("textColor", v)} />
      </Section>

      <Section title="Typography">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Heading Font</Label>
          <Input value={get("headingFont")} onChange={(e) => set("headingFont", e.target.value)} className="h-7 text-[12px]" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Body Font</Label>
          <Input value={get("bodyFont")} onChange={(e) => set("bodyFont", e.target.value)} className="h-7 text-[12px]" />
        </div>
      </Section>

      <Section title="Layout">
        <SliderRow label="Max Width" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} min={800} max={1600} step={SPACING_STEP} unit="px" />
        <SliderRow label="Section Gap V" value={get("sectionGapV")} onChange={(v) => set("sectionGapV", v)} min={0} max={120} step={SPACING_STEP} unit="px" />
        <SliderRow label="Section Gap H" value={get("sectionGapH")} onChange={(v) => set("sectionGapH", v)} min={0} max={64} step={SPACING_STEP} unit="px" />
        <SliderRow label="Border Radius" value={get("borderRadius")} onChange={(v) => set("borderRadius", v)} min={0} max={24} step={2} unit="px" />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{title}</p>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded border border-input cursor-pointer p-0 shrink-0" />
      <Label className="text-[11px] text-muted-foreground flex-1">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] font-mono w-20" />
    </div>
  )
}

function SliderRow({ label, value, onChange, min, max, step, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground tabular-nums">{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  )
}
