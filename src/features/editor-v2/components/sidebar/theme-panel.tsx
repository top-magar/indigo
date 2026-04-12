"use client"

import { useEditorStore } from "../../store"
import { SectionLabel, ToolbarSeparator } from "../ui-primitives"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Palette, Type, Box, Sparkles, RotateCcw, Minus, Plus, AlignVerticalSpaceAround, RectangleHorizontal, SquareRoundCorner, Baseline, CaseSensitive, Heading, LetterText, PanelTop, PanelBottom, SunDim, Moon, Droplets, PaintBucket, Pipette, Variable, Code, BarChart3, Lock, Image, Upload } from "lucide-react"
import { useState } from "react"
import { TokensPanel } from "./tokens-panel"
import { FontPicker } from "../pickers/font-picker"
import { THEME_PRESETS } from "../../design-tokens"

function Section({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 pb-3 border-b border-border/30 last:border-b-0">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <SectionLabel>{label}</SectionLabel>
      </div>
      {children}
    </div>
  )
}

function ColorDot({ value, onChange, tip }: { value: string; onChange: (v: string) => void; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative h-6 w-6 rounded-full ring-1 ring-white/10 hover:ring-white/30 transition-all cursor-pointer shrink-0 shadow-sm" style={{ backgroundColor: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px]">{tip}</TooltipContent>
    </Tooltip>
  )
}

function NumericStepper({ value, onChange, min, max, step = 1, suffix = "" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded h-6 px-0.5">
      <button onClick={() => onChange(Math.max(min, value - step))} className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground"><Minus className="h-2.5 w-2.5" /></button>
      <span className="text-[10px] tabular-nums w-8 text-center">{value}{suffix}</span>
      <button onClick={() => onChange(Math.min(max, value + step))} className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground"><Plus className="h-2.5 w-2.5" /></button>
    </div>
  )
}

export function ThemePanel() {
  const theme = useEditorStore(s => s.theme)
  const updateTheme = useEditorStore(s => s.updateTheme)
  const locales = useEditorStore((s) => s.locales)
  const [expandedColor, setExpandedColor] = useState<string | null>(null)

  const g = (k: string, d: string | number | boolean) => (theme[k] ?? d) as typeof d

  const colors = {
    primary: g("primaryColor", "#3b82f6") as string,
    secondary: g("secondaryColor", "#8b5cf6") as string,
    accent: g("accentColor", "#06b6d4") as string,
    background: g("backgroundColor", "#ffffff") as string,
    surface: g("surfaceColor", "#f8fafc") as string,
    text: g("textColor", "#0f172a") as string,
    muted: g("mutedColor", "#64748b") as string,
  }

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
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Dark Overrides</span>
            <div className="flex items-center gap-1.5">
              <ColorDot value={g("darkBg", "#0f172a") as string} onChange={(v) => updateTheme({ darkBg: v })} tip="Dark BG" />
              <ColorDot value={g("darkText", "#f1f5f9") as string} onChange={(v) => updateTheme({ darkText: v })} tip="Dark Text" />
              <ColorDot value={g("darkSurface", "#1e293b") as string} onChange={(v) => updateTheme({ darkSurface: v })} tip="Dark Surface" />
            </div>
          </div>
        )}
      </Section>

      {/* Colors */}
      <Section icon={Palette} label="Colors">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ColorDot value={colors.primary} onChange={(v) => updateTheme({ primaryColor: v })} tip="Primary" />
          <ColorDot value={colors.secondary} onChange={(v) => updateTheme({ secondaryColor: v })} tip="Secondary" />
          <ColorDot value={colors.accent} onChange={(v) => updateTheme({ accentColor: v })} tip="Accent" />
          <ToolbarSeparator className="bg-border/30 mx-0.5" />
          <ColorDot value={colors.background} onChange={(v) => updateTheme({ backgroundColor: v })} tip="Background" />
          <ColorDot value={colors.surface} onChange={(v) => updateTheme({ surfaceColor: v })} tip="Surface" />
          <ToolbarSeparator className="bg-border/30 mx-0.5" />
          <ColorDot value={colors.text} onChange={(v) => updateTheme({ textColor: v })} tip="Text" />
          <ColorDot value={colors.muted} onChange={(v) => updateTheme({ mutedColor: v })} tip="Muted" />
        </div>
        {/* Expanded hex editor */}
        <button onClick={() => setExpandedColor(expandedColor ? null : "primary")} className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Pipette className="h-2.5 w-2.5" />{expandedColor ? "Hide hex values" : "Edit hex values"}
        </button>
        {expandedColor && (
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(colors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: val }} />
                <Input value={val} onChange={(e) => updateTheme({ [`${key === "primary" ? "primaryColor" : key === "secondary" ? "secondaryColor" : key === "accent" ? "accentColor" : key === "background" ? "backgroundColor" : key === "surface" ? "surfaceColor" : key === "text" ? "textColor" : "mutedColor"}`]: e.target.value })} className="h-5 text-[9px] font-mono px-1" />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Typography */}
      <Section icon={Type} label="Typography">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Heading className="h-3 w-3 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <FontPicker value={g("headingFont", "Inter") as string} onChange={(v) => updateTheme({ headingFont: v })} />
            </div>
            <Select value={g("headingWeight", "700") as string} onValueChange={(v) => updateTheme({ headingWeight: v })}>
              <SelectTrigger className="h-6 text-[10px] w-16"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["400", "Reg"], ["500", "Med"], ["600", "Semi"], ["700", "Bold"], ["800", "XBold"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <LetterText className="h-3 w-3 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <FontPicker value={g("bodyFont", "Inter") as string} onChange={(v) => updateTheme({ bodyFont: v })} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Baseline className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Size</span>
          </div>
          <NumericStepper value={g("baseSize", 16) as number} onChange={(v) => updateTheme({ baseSize: v })} min={12} max={22} suffix="px" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AlignVerticalSpaceAround className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Leading</span>
          </div>
          <NumericStepper value={g("lineHeight", 1.6) as number} onChange={(v) => updateTheme({ lineHeight: v })} min={1.0} max={2.2} step={0.1} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CaseSensitive className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Tracking</span>
          </div>
          <NumericStepper value={g("letterSpacing", 0) as number} onChange={(v) => updateTheme({ letterSpacing: v })} min={-2} max={4} step={0.5} />
        </div>
      </Section>

      {/* Shape */}
      <Section icon={Box} label="Shape & Layout">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <SquareRoundCorner className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Radius</span>
          </div>
          <NumericStepper value={g("borderRadius", 8) as number} onChange={(v) => updateTheme({ borderRadius: v })} min={0} max={24} suffix="px" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <RectangleHorizontal className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Buttons</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["sharp", "rounded", "pill"] as const).map((s) => (
              <button key={s} onClick={() => updateTheme({ buttonStyle: s })} className={`h-6 text-[9px] transition-colors ${g("buttonStyle", "rounded") === s ? "bg-blue-500/15 text-blue-400 rounded-md border border-blue-500/30" : "bg-white/5 text-muted-foreground rounded-md border border-transparent hover:bg-white/10"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AlignVerticalSpaceAround className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Spacing</span>
          </div>
          <NumericStepper value={g("sectionSpacing", 64) as number} onChange={(v) => updateTheme({ sectionSpacing: v })} min={0} max={128} step={8} suffix="px" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <RectangleHorizontal className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Container</span>
          </div>
          <NumericStepper value={g("containerWidth", 1200) as number} onChange={(v) => updateTheme({ containerWidth: v })} min={800} max={1440} step={40} suffix="px" />
        </div>
      </Section>

      {/* Global */}
      <Section icon={PanelTop} label="Global">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><PanelTop className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">Header</span></div>
          <Switch checked={g("headerEnabled", true) as boolean} onCheckedChange={(v) => updateTheme({ headerEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><PanelBottom className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">Footer</span></div>
          <Switch checked={g("footerEnabled", true) as boolean} onCheckedChange={(v) => updateTheme({ footerEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Lock className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">Password Protection</span></div>
          <Switch checked={g("passwordProtected", false) as boolean} onCheckedChange={(v) => updateTheme({ passwordProtected: v })} />
        </div>
        {g("passwordProtected", false) && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Site Password</span>
            <Input value={g("sitePassword", "") as string} onChange={(e) => updateTheme({ sitePassword: e.target.value })} placeholder="Enter password" className="h-6 text-[10px]" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1"><Image className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">Favicon URL</span></div>
          <Input value={g("faviconUrl", "") as string} onChange={(e) => updateTheme({ faviconUrl: e.target.value })} placeholder="https://…/favicon.ico" className="h-6 text-[10px]" />
          {g("faviconUrl", "") && (
            <img src={g("faviconUrl", "") as string} alt="favicon" width={16} height={16} className="mt-0.5" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1"><Type className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">Languages</span></div>
          <Input
            value={(g("locales", "") as string) || locales.join(", ")}
            onChange={(e) => updateTheme({ locales: e.target.value })}
            placeholder="en, es, fr"
            className="h-6 text-[10px]"
          />
          <span className="text-[9px] text-muted-foreground/60">Comma-separated locale codes</span>
        </div>
      </Section>

      {/* Design Tokens */}
      <Section icon={Variable} label="Design Tokens">
        <TokensPanel />
      </Section>

      {/* Integrations */}
      <Section icon={BarChart3} label="Integrations">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Google Analytics ID</span>
          <Input value={g("gaId", "") as string} onChange={(e) => updateTheme({ gaId: e.target.value })} placeholder="G-XXXXXXXXXX" className="h-6 text-[10px] font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Facebook Pixel ID</span>
          <Input value={g("fbPixelId", "") as string} onChange={(e) => updateTheme({ fbPixelId: e.target.value })} placeholder="Pixel ID" className="h-6 text-[10px] font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Form Webhook URL</span>
          <Input value={g("formWebhookUrl", "") as string} onChange={(e) => updateTheme({ formWebhookUrl: e.target.value })} placeholder="https://hooks.zapier.com/..." className="h-6 text-[10px] font-mono" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Cookie Consent</span>
          <Switch checked={g("cookieConsent", false) as boolean} onCheckedChange={(v) => updateTheme({ cookieConsent: v })} />
        </div>
        {g("cookieConsent", false) && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Cookie Banner Text</span>
            <Textarea value={g("cookieText", "We use cookies to improve your experience.") as string} onChange={(e) => updateTheme({ cookieText: e.target.value })} className="text-[10px] min-h-[40px] resize-y" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Custom Head Code</span>
          <Textarea value={g("headCode", "") as string} onChange={(e) => updateTheme({ headCode: e.target.value })} placeholder="<script>...</script>" className="text-[10px] font-mono min-h-[48px] resize-y" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Custom Body Code</span>
          <Textarea value={g("bodyCode", "") as string} onChange={(e) => updateTheme({ bodyCode: e.target.value })} placeholder="<script>...</script>" className="text-[10px] font-mono min-h-[48px] resize-y" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">301 Redirects</span>
          <Textarea value={g("redirects", "") as string} onChange={(e) => updateTheme({ redirects: e.target.value })} placeholder={"/old-page -> /new-page\n/blog/old -> /blog/new"} className="text-[10px] font-mono min-h-[48px] resize-y" />
          <span className="text-[9px] text-muted-foreground/60">One per line: /from -&gt; /to</span>
        </div>
      </Section>

      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="text-[9px] text-muted-foreground h-6 flex-1" onClick={() => {
          const json = JSON.stringify(theme, null, 2)
          navigator.clipboard.writeText(json)
          import("sonner").then(({ toast }) => toast.success("Theme JSON copied"))
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
        <RotateCcw className="h-2.5 w-2.5 mr-1" />Reset to defaults
      </Button>
    </div>
  )
}
