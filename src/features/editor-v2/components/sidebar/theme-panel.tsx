"use client"

import { useEditorStore } from "../../store"
import { SectionLabel } from "../ui-primitives"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles, RotateCcw, Minus, Plus, AlignVerticalSpaceAround, RectangleHorizontal, SquareRoundCorner, Baseline, CaseSensitive, Heading, LetterText, SunDim, Moon, Palette, Type, Box, Code, Upload } from "lucide-react"
import { FontPicker } from "../pickers/font-picker"
import { ColorPicker } from "../pickers/color-picker"
import { THEME_PRESETS } from "../../design-tokens"

// ── Helpers ──

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Section({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 pb-3 border-b border-border/20 last:border-b-0">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <SectionLabel>{label}</SectionLabel>
      </div>
      {children}
    </div>
  )
}

function Stepper({ value, onChange, min, max, step = 1, suffix = "" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded h-6 px-0.5">
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))} className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground" aria-label="Decrease"><Minus className="h-2.5 w-2.5" /></button>
      <span className="text-[10px] tabular-nums w-8 text-center">{value}{suffix}</span>
      <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))} className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground" aria-label="Increase"><Plus className="h-2.5 w-2.5" /></button>
    </div>
  )
}

// ── Main ──

export function ThemePanel() {
  const theme = useEditorStore(s => s.theme)
  const updateTheme = useEditorStore(s => s.updateTheme)

  const g = (k: string, d: string | number | boolean) => (theme[k] ?? d) as typeof d
  const set = (k: string) => (v: string) => updateTheme({ [k]: v })

  return (
    <div className="flex flex-col gap-3 p-3">

      {/* Presets */}
      <Section icon={Sparkles} label="Presets">
        <div className="grid grid-cols-3 gap-1">
          {THEME_PRESETS.map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <button onClick={() => updateTheme({ ...p.theme })} className="flex flex-col items-center gap-1 p-1.5 rounded-md hover:bg-white/5 transition-colors">
                  <div className="flex gap-[2px]">{p.colors.map((c, i) => <div key={i} className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: c }} />)}</div>
                  <span className="text-[9px] text-muted-foreground">{p.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">{p.description}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </Section>

      {/* Mode */}
      <Section icon={SunDim} label="Mode">
        <div className="grid grid-cols-2 gap-1">
          {(["light", "dark"] as const).map((m) => (
            <button key={m} onClick={() => updateTheme({ mode: m })} className={`h-7 text-[10px] rounded-md transition-colors capitalize ${g("mode", "light") === m ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"}`}>
              {m === "light" ? <><SunDim className="h-3 w-3 inline mr-1" />Light</> : <><Moon className="h-3 w-3 inline mr-1" />Dark</>}
            </button>
          ))}
        </div>
        {g("mode", "light") === "dark" && (
          <div className="flex items-center gap-2 mt-1">
            <ColorPicker value={g("darkBg", "#0f172a") as string} onChange={set("darkBg")} />
            <ColorPicker value={g("darkText", "#f1f5f9") as string} onChange={set("darkText")} />
            <ColorPicker value={g("darkSurface", "#1e293b") as string} onChange={set("darkSurface")} />
            <span className="text-[9px] text-muted-foreground/50">BG / Text / Surface</span>
          </div>
        )}
      </Section>

      {/* Colors */}
      <Section icon={Palette} label="Colors">
        <div className="grid grid-cols-2 gap-y-2 gap-x-3">
          {([
            ["primaryColor", "Primary", "#3b82f6"],
            ["secondaryColor", "Secondary", "#8b5cf6"],
            ["accentColor", "Accent", "#06b6d4"],
            ["backgroundColor", "Background", "#ffffff"],
            ["surfaceColor", "Surface", "#f8fafc"],
            ["textColor", "Text", "#0f172a"],
            ["mutedColor", "Muted", "#64748b"],
          ] as const).map(([key, label, fallback]) => (
            <div key={key} className="flex items-center gap-1.5">
              <ColorPicker value={g(key, fallback) as string} onChange={set(key)} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section icon={Type} label="Typography">
        <div className="flex items-center gap-1.5">
          <Heading className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex-1"><FontPicker value={g("headingFont", "Inter") as string} onChange={set("headingFont")} /></div>
          <Select value={g("headingWeight", "700") as string} onValueChange={set("headingWeight")}>
            <SelectTrigger className="h-6 text-[10px] w-16"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["400", "Reg"], ["500", "Med"], ["600", "Semi"], ["700", "Bold"], ["800", "XBold"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <LetterText className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex-1"><FontPicker value={g("bodyFont", "Inter") as string} onChange={set("bodyFont")} /></div>
        </div>
        <Row icon={Baseline} label="Size"><Stepper value={g("baseSize", 16) as number} onChange={(v) => updateTheme({ baseSize: v })} min={12} max={22} suffix="px" /></Row>
        <Row icon={AlignVerticalSpaceAround} label="Leading"><Stepper value={g("lineHeight", 1.6) as number} onChange={(v) => updateTheme({ lineHeight: v })} min={1.0} max={2.2} step={0.1} /></Row>
        <Row icon={CaseSensitive} label="Tracking"><Stepper value={g("letterSpacing", 0) as number} onChange={(v) => updateTheme({ letterSpacing: v })} min={-2} max={4} step={0.5} /></Row>
      </Section>

      {/* Shape */}
      <Section icon={Box} label="Shape">
        <Row icon={SquareRoundCorner} label="Radius"><Stepper value={g("borderRadius", 8) as number} onChange={(v) => updateTheme({ borderRadius: v })} min={0} max={24} suffix="px" /></Row>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1"><RectangleHorizontal className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Buttons</span></div>
          <div className="grid grid-cols-3 gap-1">
            {(["sharp", "rounded", "pill"] as const).map((s) => (
              <button key={s} onClick={() => updateTheme({ buttonStyle: s })} className={`h-6 text-[9px] rounded-md transition-colors capitalize ${g("buttonStyle", "rounded") === s ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"}`}>{s}</button>
            ))}
          </div>
        </div>
        <Row icon={AlignVerticalSpaceAround} label="Spacing"><Stepper value={g("sectionSpacing", 64) as number} onChange={(v) => updateTheme({ sectionSpacing: v })} min={0} max={128} step={8} suffix="px" /></Row>
        <Row icon={RectangleHorizontal} label="Container"><Stepper value={g("containerWidth", 1200) as number} onChange={(v) => updateTheme({ containerWidth: v })} min={800} max={1440} step={40} suffix="px" /></Row>
      </Section>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-6 flex-1" onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(theme, null, 2))
          import("sonner").then(({ toast }) => toast.success("Theme copied"))
        }}>
          <Code className="h-2.5 w-2.5 mr-1" />Export
        </Button>
        <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-6 flex-1" onClick={() => {
          const input = prompt("Paste theme JSON:")
          if (!input) return
          try { updateTheme(JSON.parse(input)); import("sonner").then(({ toast }) => toast.success("Theme imported")) }
          catch { import("sonner").then(({ toast }) => toast.error("Invalid JSON")) }
        }}>
          <Upload className="h-2.5 w-2.5 mr-1" />Import
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-6" onClick={() => updateTheme({ ...THEME_PRESETS[0].theme })}>
        <RotateCcw className="h-2.5 w-2.5 mr-1" />Reset
      </Button>
    </div>
  )
}
