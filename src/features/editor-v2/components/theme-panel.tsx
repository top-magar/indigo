"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

const FONTS = ["Inter", "Playfair Display", "Poppins", "Montserrat", "DM Sans", "Lora", "Raleway", "Roboto", "Open Sans", "Merriweather", "Space Grotesk", "Outfit"] as const

const PRESETS: { name: string; theme: Record<string, unknown> }[] = [
  { name: "Modern", theme: { primaryColor: "#3b82f6", secondaryColor: "#8b5cf6", accentColor: "#06b6d4", headingFont: "Inter", bodyFont: "Inter", borderRadius: 8, buttonStyle: "rounded" } },
  { name: "Elegant", theme: { primaryColor: "#1a1a2e", secondaryColor: "#e2e2e2", accentColor: "#c9a96e", headingFont: "Playfair Display", bodyFont: "Lora", borderRadius: 2, buttonStyle: "sharp" } },
  { name: "Bold", theme: { primaryColor: "#ef4444", secondaryColor: "#f97316", accentColor: "#eab308", headingFont: "Space Grotesk", bodyFont: "DM Sans", borderRadius: 12, buttonStyle: "pill" } },
  { name: "Minimal", theme: { primaryColor: "#18181b", secondaryColor: "#71717a", accentColor: "#a1a1aa", headingFont: "Outfit", bodyFont: "Outfit", borderRadius: 4, buttonStyle: "sharp" } },
  { name: "Nature", theme: { primaryColor: "#16a34a", secondaryColor: "#65a30d", accentColor: "#ca8a04", headingFont: "Merriweather", bodyFont: "Open Sans", borderRadius: 8, buttonStyle: "rounded" } },
]

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 pb-3 border-b border-border/50 last:border-b-0">
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5 rounded-full ring-1 ring-border overflow-hidden shrink-0 cursor-pointer" style={{ backgroundColor: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </div>
      <span className="text-[10px] text-muted-foreground w-12">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] font-mono flex-1" />
    </div>
  )
}

export function ThemePanel() {
  const { theme, updateTheme } = useEditorStore()

  const g = (k: string, d: string | number | boolean) => (theme[k] ?? d) as typeof d

  const primaryColor = g("primaryColor", "#3b82f6") as string
  const secondaryColor = g("secondaryColor", "#8b5cf6") as string
  const accentColor = g("accentColor", "#06b6d4") as string
  const backgroundColor = g("backgroundColor", "#ffffff") as string
  const textColor = g("textColor", "#18181b") as string
  const headingFont = g("headingFont", "Inter") as string
  const bodyFont = g("bodyFont", "Inter") as string
  const headingWeight = g("headingWeight", "700") as string
  const baseSize = g("baseSize", 16) as number
  const lineHeight = g("lineHeight", 1.6) as number
  const borderRadius = g("borderRadius", 8) as number
  const buttonStyle = g("buttonStyle", "rounded") as string
  const sectionSpacing = g("sectionSpacing", 64) as number
  const headerEnabled = g("headerEnabled", true) as boolean
  const footerEnabled = g("footerEnabled", true) as boolean

  const applyPreset = (preset: typeof PRESETS[number]) => updateTheme(preset.theme)

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Presets */}
      <Section label="Presets">
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p)} className="flex flex-col items-center gap-1 p-1.5 rounded hover:bg-white/5 text-[10px]">
              <div className="flex gap-0.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.theme.primaryColor as string }} />
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.theme.secondaryColor as string }} />
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.theme.accentColor as string }} />
              </div>
              {p.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Colors */}
      <Section label="Colors">
        <ColorField label="Primary" value={primaryColor} onChange={(v) => updateTheme({ primaryColor: v })} />
        <ColorField label="Secondary" value={secondaryColor} onChange={(v) => updateTheme({ secondaryColor: v })} />
        <ColorField label="Accent" value={accentColor} onChange={(v) => updateTheme({ accentColor: v })} />
        <ColorField label="Background" value={backgroundColor} onChange={(v) => updateTheme({ backgroundColor: v })} />
        <ColorField label="Text" value={textColor} onChange={(v) => updateTheme({ textColor: v })} />
      </Section>

      {/* Typography */}
      <Section label="Typography">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] text-muted-foreground">Heading Font</Label>
          <Select value={headingFont} onValueChange={(v) => updateTheme({ headingFont: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] text-muted-foreground">Body Font</Label>
          <Select value={bodyFont} onValueChange={(v) => updateTheme({ bodyFont: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] text-muted-foreground">Heading Weight</Label>
            <Select value={headingWeight} onValueChange={(v) => updateTheme({ headingWeight: v })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
                <SelectItem value="800">Extra Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] text-muted-foreground">Base Size</Label>
            <div className="flex items-center gap-1">
              <Input type="number" min={12} max={20} value={baseSize} onChange={(e) => updateTheme({ baseSize: Number(e.target.value) })} className="h-7 text-xs" />
              <span className="text-[9px] text-muted-foreground">px</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Line Height</Label>
            <span className="text-[10px] text-muted-foreground">{lineHeight}</span>
          </div>
          <Slider min={1.2} max={2} step={0.1} value={[lineHeight]} onValueChange={([v]) => updateTheme({ lineHeight: v })} />
        </div>
      </Section>

      {/* Shape & Spacing */}
      <Section label="Shape">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Border Radius</Label>
            <span className="text-[10px] text-muted-foreground">{borderRadius}px</span>
          </div>
          <Slider min={0} max={24} value={[borderRadius]} onValueChange={([v]) => updateTheme({ borderRadius: v })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] text-muted-foreground">Button Style</Label>
          <div className="grid grid-cols-3 gap-1">
            {(["sharp", "rounded", "pill"] as const).map((s) => (
              <button key={s} onClick={() => updateTheme({ buttonStyle: s })} className={`h-7 text-[10px] rounded border ${buttonStyle === s ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-border/50 text-muted-foreground hover:bg-white/5"}`}>
                {s === "sharp" ? "Sharp" : s === "rounded" ? "Rounded" : "Pill"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Section Spacing</Label>
            <span className="text-[10px] text-muted-foreground">{sectionSpacing}px</span>
          </div>
          <Slider min={0} max={128} step={8} value={[sectionSpacing]} onValueChange={([v]) => updateTheme({ sectionSpacing: v })} />
        </div>
      </Section>

      {/* Global Sections */}
      <Section label="Global Sections">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Header</Label>
          <Switch checked={headerEnabled} onCheckedChange={(v) => updateTheme({ headerEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Footer</Label>
          <Switch checked={footerEnabled} onCheckedChange={(v) => updateTheme({ footerEnabled: v })} />
        </div>
      </Section>

      {/* Reset */}
      <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground" onClick={() => updateTheme({ primaryColor: "#3b82f6", secondaryColor: "#8b5cf6", accentColor: "#06b6d4", backgroundColor: "#ffffff", textColor: "#18181b", headingFont: "Inter", bodyFont: "Inter", headingWeight: "700", baseSize: 16, lineHeight: 1.6, borderRadius: 8, buttonStyle: "rounded", sectionSpacing: 64 })}>
        <RotateCcw className="h-3 w-3 mr-1" />Reset to defaults
      </Button>
    </div>
  )
}
