"use client"

import { useState } from "react"
import { useEditorStore } from "../store"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Box, Paintbrush, Type, SquareSlash, AlignLeft, AlignCenter, AlignRight, Sparkles, MousePointer, ArrowDown, ArrowRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Columns, LayoutGrid, Maximize2, RotateCw, Anchor, FlipHorizontal, FlipVertical, Lock, Unlock, Code, Eye, ChevronRight, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "./color-picker"
import { cn } from "@/shared/utils"

type StyleKey = `_${string}`

function useStyleProp(sectionId: string, key: StyleKey, fallback: string | number) {
  const value = useEditorStore((s) => {
    const sec = s.sections.find((x) => x.id === sectionId)
    const vp = s.viewport
    if (vp !== "desktop") { const ov = sec?.props[`_${vp}_${key.slice(1)}` as StyleKey]; if (ov !== undefined && ov !== "") return ov }
    return sec?.props[key] ?? fallback
  })
  const update = (v: string | number) => {
    const vp = useEditorStore.getState().viewport
    useEditorStore.getState().updateProps(sectionId, { [vp !== "desktop" ? `_${vp}_${key.slice(1)}` : key]: v })
  }
  return [value, update] as const
}

/* ── Compact inline number input ── */
function NumField({ sectionId, prop, label, min = 0, max = 200, step = 1, suffix = "px" }: { sectionId: string; prop: StyleKey; label: string; min?: number; max?: number; step?: number; suffix?: string }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="relative flex-1">
        <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-6 text-[11px] tabular-nums pr-6" />
        {suffix && <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40 pointer-events-none">{suffix}</span>}
      </div>
    </div>
  )
}

/* ── Compact color swatch only ── */
function ColorField({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <ColorPicker value={(value as string) || "#000000"} onChange={(v) => update(v)} />
    </div>
  )
}

/* ── Compact inline select ── */
function SelectField({ sectionId, prop, label, options }: { sectionId: string; prop: StyleKey; label: string; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-6 text-[11px] flex-1"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}

/* ── Align picker ── */
function AlignField({ sectionId, prop }: { sectionId: string; prop: StyleKey }) {
  const [value, update] = useStyleProp(sectionId, prop, "left")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">Align</span>
      <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5">
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([v, I]) => (
          <Tooltip key={v}><TooltipTrigger asChild>
            <button onClick={() => update(v)} className={`h-6 w-7 flex items-center justify-center rounded transition-colors ${value === v ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>
              <I className="h-3 w-3" />
            </button>
          </TooltipTrigger><TooltipContent className="text-[10px] capitalize">{v}</TooltipContent></Tooltip>
        ))}
      </div>
    </div>
  )
}

/* ── Section with icon header ── */
/* ── Toggle button row ── */
function ToggleRow({ sectionId, prop, options, label }: { sectionId: string; prop: StyleKey; options: { value: string; icon: React.ComponentType<{ className?: string }>; tip: string }[]; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0].value)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5">
        {options.map(({ value: v, icon: I, tip }) => (
          <Tooltip key={v}><TooltipTrigger asChild>
            <button onClick={() => update(v)} className={`h-6 w-7 flex items-center justify-center rounded transition-colors ${value === v ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>
              <I className="h-3 w-3" />
            </button>
          </TooltipTrigger><TooltipContent className="text-[9px]">{tip}</TooltipContent></Tooltip>
        ))}
      </div>
    </div>
  )
}

/* ── Figma-style Auto Layout controls ── */
function AutoLayoutControls({ sectionId }: { sectionId: string }) {
  const [autoLayout, setAutoLayout] = useStyleProp(sectionId, "_autoLayout", "none")
  const enabled = autoLayout === "enabled"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Auto Layout</span>
        <button
          onClick={() => setAutoLayout(enabled ? "none" : "enabled")}
          className={`h-6 px-2.5 text-[9px] rounded-md transition-colors ${enabled ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"}`}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>
      {enabled && (
        <div className="flex flex-col gap-2 pl-1 border-l-2 border-blue-500/20">
          <ToggleRow sectionId={sectionId} prop="_flexDirection" label="Direction" options={[
            { value: "column", icon: ArrowDown, tip: "Vertical" },
            { value: "row", icon: ArrowRight, tip: "Horizontal" },
          ]} />
          <NumField sectionId={sectionId} prop="_gap" label="Gap" max={100} />
          <ToggleRow sectionId={sectionId} prop="_alignItems" label="Align" options={[
            { value: "flex-start", icon: AlignStartVertical, tip: "Start" },
            { value: "center", icon: AlignCenterVertical, tip: "Center" },
            { value: "flex-end", icon: AlignEndVertical, tip: "End" },
            { value: "stretch", icon: Columns, tip: "Stretch" },
          ]} />
          <SelectField sectionId={sectionId} prop="_justifyContent" label="Distribute" options={[
            { value: "flex-start", label: "Start" },
            { value: "center", label: "Center" },
            { value: "flex-end", label: "End" },
            { value: "space-between", label: "Space Between" },
            { value: "space-around", label: "Space Around" },
            { value: "space-evenly", label: "Space Evenly" },
          ]} />
          <ToggleRow sectionId={sectionId} prop="_flexWrap" label="Wrap" options={[
            { value: "nowrap", icon: ArrowRight, tip: "No wrap" },
            { value: "wrap", icon: LayoutGrid, tip: "Wrap" },
          ]} />
        </div>
      )}
    </div>
  )
}

function Section({ icon: Icon, label, children, defaultOpen = true }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/10">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 w-full px-3 py-2 hover:bg-muted/30 transition-colors">
        <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-90")} />
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

const GRADIENT_PRESETS = [
  { name: "Sunset", from: "#f97316", to: "#ec4899", angle: 135 },
  { name: "Ocean", from: "#06b6d4", to: "#3b82f6", angle: 135 },
  { name: "Forest", from: "#16a34a", to: "#065f46", angle: 135 },
  { name: "Purple", from: "#8b5cf6", to: "#ec4899", angle: 135 },
  { name: "Dark", from: "#1e293b", to: "#0f172a", angle: 180 },
  { name: "Light", from: "#f8fafc", to: "#e2e8f0", angle: 180 },
] as const

function GradientFields({ sectionId }: { sectionId: string }) {
  const [gradient, setGradient] = useStyleProp(sectionId, "_gradient", "none")
  const [gradientFrom, setGradientFrom] = useStyleProp(sectionId, "_gradientFrom", "#3b82f6")
  const [gradientTo, setGradientTo] = useStyleProp(sectionId, "_gradientTo", "#8b5cf6")
  const [gradientAngle, setGradientAngle] = useStyleProp(sectionId, "_gradientAngle", 135)
  const enabled = gradient !== "none"

  const applyPreset = (p: typeof GRADIENT_PRESETS[number]) => {
    setGradient("linear"); setGradientFrom(p.from); setGradientTo(p.to); setGradientAngle(p.angle)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Gradient</span>
        <button onClick={() => setGradient(enabled ? "none" : "linear")} className={`h-4 w-7 rounded-full transition-colors ${enabled ? "bg-blue-500" : "bg-white/10"} relative`}>
          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${enabled ? "left-3.5" : "left-0.5"}`} />
        </button>
      </div>
      {enabled && (
        <>
          <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5 w-fit">
            {(["linear", "radial"] as const).map((t) => (
              <button key={t} onClick={() => setGradient(t)} className={`h-6 px-2 text-[10px] rounded transition-colors capitalize ${gradient === t ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>{t}</button>
            ))}
          </div>
          <ColorField sectionId={sectionId} prop="_gradientFrom" label="Color 1" />
          <ColorField sectionId={sectionId} prop="_gradientTo" label="Color 2" />
          {gradient === "linear" && (
            <NumField sectionId={sectionId} prop="_gradientAngle" label="Angle" min={0} max={360} suffix="°" />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Presets</span>
            <div className="flex gap-1 flex-wrap">
              {GRADIENT_PRESETS.map((p) => (
                <Tooltip key={p.name}><TooltipTrigger asChild>
                  <button onClick={() => applyPreset(p)} className="h-5 w-10 rounded ring-1 ring-border/20 hover:ring-blue-400 transition-shadow" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} />
                </TooltipTrigger><TooltipContent className="text-[10px]">{p.name}</TooltipContent></Tooltip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PositionFields({ sectionId }: { sectionId: string }) {
  const [position] = useStyleProp(sectionId, "_position", "static")
  const showExtra = position === "sticky" || position === "fixed"
  return (
    <div className="flex flex-col gap-2">
      <SelectField sectionId={sectionId} prop="_position" label="Position" options={[
        { value: "static", label: "Static" }, { value: "sticky", label: "Sticky" }, { value: "fixed", label: "Fixed" },
      ]} />
      {showExtra && (
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_positionTop" label="Top Offset" min={-200} max={500} />
          <NumField sectionId={sectionId} prop="_zIndex" label="Z-Index" min={0} max={9999} step={1} suffix="" />
        </div>
      )}
    </div>
  )
}

function ParallaxFields({ sectionId }: { sectionId: string }) {
  const [parallax, setParallax] = useStyleProp(sectionId, "_parallax", "off")
  const enabled = parallax === "on"
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Parallax</span>
        <button onClick={() => setParallax(enabled ? "off" : "on")} className={`h-4 w-7 rounded-full transition-colors ${enabled ? "bg-blue-500" : "bg-white/10"} relative`}>
          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${enabled ? "left-3.5" : "left-0.5"}`} />
        </button>
      </div>
      {enabled && (
        <NumField sectionId={sectionId} prop="_parallaxSpeed" label="Speed" min={0.1} max={1} step={0.1} suffix="" />
      )}
    </div>
  )
}

function GridControls({ sectionId }: { sectionId: string }) {
  const [cols, setCols] = useStyleProp(sectionId, "_gridCols", 1)
  const isGrid = (cols as number) > 1
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">CSS Grid</span>
        <button onClick={() => setCols(isGrid ? 1 : 2)} className={`h-6 px-2.5 text-[9px] rounded-md transition-colors ${isGrid ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"}`}>
          {isGrid ? "On" : "Off"}
        </button>
      </div>
      {isGrid && (
        <div className="flex flex-col gap-2 pl-1 border-l-2 border-blue-500/20">
          <div className="grid grid-cols-2 gap-1.5">
            <NumField sectionId={sectionId} prop="_gridCols" label="Columns" min={1} max={12} suffix="" />
            <NumField sectionId={sectionId} prop="_gridRows" label="Rows" min={1} max={12} suffix="" />
          </div>
          <NumField sectionId={sectionId} prop="_gridGap" label="Gap" min={0} max={64} />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Column Sizes</span>
            <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._gridColSizes as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _gridColSizes: e.target.value })} placeholder="e.g. 1fr 2fr or 200px 1fr" className="h-6 text-[11px] font-mono" />
          </div>
        </div>
      )}
    </div>
  )
}

function BorderRadiusFields({ sectionId }: { sectionId: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <NumField sectionId={sectionId} prop="_borderRadius" label="Radius" max={48} />
        </div>
        <button onClick={() => setExpanded(!expanded)} className={`h-6 w-6 flex items-center justify-center rounded text-xs transition-colors ${expanded ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} title="Individual corners">⊞</button>
      </div>
      {expanded && (
        <div className="grid grid-cols-2 gap-1.5 pl-1 border-l-2 border-blue-500/20">
          <NumField sectionId={sectionId} prop="_borderRadiusTL" label="Top Left" max={48} />
          <NumField sectionId={sectionId} prop="_borderRadiusTR" label="Top Right" max={48} />
          <NumField sectionId={sectionId} prop="_borderRadiusBL" label="Bottom Left" max={48} />
          <NumField sectionId={sectionId} prop="_borderRadiusBR" label="Bottom Right" max={48} />
        </div>
      )}
    </div>
  )
}

function FlipButton({ sectionId, prop, icon: Icon }: { sectionId: string; prop: StyleKey; icon: React.ComponentType<{ className?: string }> }) {
  const [value, update] = useStyleProp(sectionId, prop, 1)
  const flipped = (value as number) === -1
  return (
    <Button variant="outline" size="icon" className={`h-6 w-6 ${flipped ? "bg-blue-500/20 text-blue-400" : ""}`} onClick={() => update(flipped ? 1 : -1)}>
      <Icon className="h-3.5 w-3.5" />
    </Button>
  )
}

function BorderWidthFields({ sectionId }: { sectionId: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <NumField sectionId={sectionId} prop="_borderWidth" label="Width" max={10} />
        </div>
        <button onClick={() => setExpanded(!expanded)} className={`h-6 w-6 flex items-center justify-center rounded text-xs transition-colors ${expanded ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} title="Individual sides">⊞</button>
      </div>
      {expanded && (
        <div className="grid grid-cols-2 gap-1.5 pl-1 border-l-2 border-blue-500/20">
          <NumField sectionId={sectionId} prop="_borderWidthTop" label="Top" max={10} />
          <NumField sectionId={sectionId} prop="_borderWidthRight" label="Right" max={10} />
          <NumField sectionId={sectionId} prop="_borderWidthBottom" label="Bottom" max={10} />
          <NumField sectionId={sectionId} prop="_borderWidthLeft" label="Left" max={10} />
        </div>
      )}
    </div>
  )
}

function AspectLockButton({ sectionId }: { sectionId: string }) {
  const [locked, setLocked] = useStyleProp(sectionId, "_aspectLock", 0)
  const isLocked = !!locked
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 mt-4" onClick={() => setLocked(isLocked ? 0 : 1)}>
      {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
    </Button>
  )
}

function ShadowToggle({ sectionId }: { sectionId: string }) {
  const [enabled, setEnabled] = useStyleProp(sectionId, "_shadowEnabled", 1)
  const isOn = enabled !== 0
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">Enabled</span>
      <button onClick={() => setEnabled(isOn ? 0 : 1)} className={cn("h-4 w-4 rounded flex items-center justify-center", isOn ? "bg-blue-500" : "bg-muted")}>
        <Eye className="h-2.5 w-2.5 text-white" />
      </button>
    </div>
  )
}

export function StyleManager({ sectionId }: { sectionId: string }) {
  const viewport = useEditorStore((s) => s.viewport)
  return (
    <div>
      {/* Viewport indicator */}
      {viewport !== "desktop" && (
        <div className="mx-3 mt-2 mb-1 flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Editing: {viewport.charAt(0).toUpperCase() + viewport.slice(1)}
        </div>
      )}
      {/* Layout */}
      <Section icon={Box} label="Layout">
        <AutoLayoutControls sectionId={sectionId} />
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Padding</span>
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_paddingTop" label="Top" />
          <NumField sectionId={sectionId} prop="_paddingRight" label="Right" />
          <NumField sectionId={sectionId} prop="_paddingBottom" label="Bottom" />
          <NumField sectionId={sectionId} prop="_paddingLeft" label="Left" />
        </div>
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mt-1">Margin</span>
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_marginTop" label="Top" min={-100} />
          <NumField sectionId={sectionId} prop="_marginRight" label="Right" min={-100} />
          <NumField sectionId={sectionId} prop="_marginBottom" label="Bottom" min={-100} />
          <NumField sectionId={sectionId} prop="_marginLeft" label="Left" min={-100} />
        </div>
        <NumField sectionId={sectionId} prop="_maxWidth" label="Max Width" max={1440} step={40} />
        <PositionFields sectionId={sectionId} />
      </Section>

      {/* Size */}
      <Section icon={Maximize2} label="Size">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-1.5 flex-1">
            <NumField sectionId={sectionId} prop="_width" label="W" max={2000} />
            <NumField sectionId={sectionId} prop="_height" label="H" max={2000} />
          </div>
          <AspectLockButton sectionId={sectionId} />
        </div>
        <NumField sectionId={sectionId} prop="_minHeight" label="Min H" max={2000} />
        <SelectField sectionId={sectionId} prop="_aspectRatio" label="Ratio" options={[
          { value: "auto", label: "Auto" }, { value: "1/1", label: "1:1" }, { value: "4/3", label: "4:3" }, { value: "16/9", label: "16:9" }, { value: "3/2", label: "3:2" },
        ]} />
        <SelectField sectionId={sectionId} prop="_overflow" label="Overflow" options={[
          { value: "visible", label: "Visible" }, { value: "hidden", label: "Hidden" }, { value: "scroll", label: "Scroll" }, { value: "auto", label: "Auto" },
        ]} />
      </Section>

      {/* Appearance */}
      <Section icon={Paintbrush} label="Appearance">
        <ColorField sectionId={sectionId} prop="_backgroundColor" label="Fill" />
        <GradientFields sectionId={sectionId} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-12 shrink-0">Bg Img</span>
          <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="https://..." className="h-6 text-[11px] flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <SelectField sectionId={sectionId} prop="_backgroundSize" label="Size" options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <SelectField sectionId={sectionId} prop="_backgroundPosition" label="Pos" options={[{ value: "center", label: "Center" }, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
        </div>
        <NumField sectionId={sectionId} prop="_backgroundOverlay" label="Overlay" max={100} suffix="%" />
        <ParallaxFields sectionId={sectionId} />
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_opacity" label="Opacity" max={100} suffix="%" />
          <NumField sectionId={sectionId} prop="_blur" label="Blur" max={20} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_backdropBlur" label="Bd Blur" max={20} />
          <NumField sectionId={sectionId} prop="_backdropSaturate" label="Bd Sat" max={200} suffix="%" />
        </div>
        <SelectField sectionId={sectionId} prop="_blendMode" label="Blend" options={[
          { value: "normal", label: "Normal" }, { value: "multiply", label: "Multiply" }, { value: "screen", label: "Screen" },
          { value: "overlay", label: "Overlay" }, { value: "darken", label: "Darken" }, { value: "lighten", label: "Lighten" },
          { value: "color-dodge", label: "Color Dodge" }, { value: "color-burn", label: "Color Burn" },
          { value: "hard-light", label: "Hard Light" }, { value: "soft-light", label: "Soft Light" },
          { value: "difference", label: "Difference" }, { value: "exclusion", label: "Exclusion" },
          { value: "hue", label: "Hue" }, { value: "saturation", label: "Saturation" },
          { value: "color", label: "Color" }, { value: "luminosity", label: "Luminosity" },
        ]} />
        <SelectField sectionId={sectionId} prop="_cursor" label="Cursor" options={[
          { value: "auto", label: "Auto" }, { value: "pointer", label: "Pointer" }, { value: "grab", label: "Grab" },
          { value: "crosshair", label: "Crosshair" }, { value: "not-allowed", label: "Not Allowed" }, { value: "none", label: "None" },
        ]} />
      </Section>

      {/* Shadow */}
      <Section icon={Layers} label="Shadow" defaultOpen={false}>
        <SelectField sectionId={sectionId} prop="_shadow" label="Preset" options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" }]} />
        <ShadowToggle sectionId={sectionId} />
        <SelectField sectionId={sectionId} prop="_shadowType" label="Type" options={[
          { value: "drop", label: "Drop Shadow" }, { value: "inner", label: "Inner Shadow" },
        ]} />
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_shadowX" label="X" min={-20} max={20} />
          <NumField sectionId={sectionId} prop="_shadowY" label="Y" min={-20} max={20} />
          <NumField sectionId={sectionId} prop="_shadowBlur" label="Blur" max={50} />
          <NumField sectionId={sectionId} prop="_shadowSpread" label="Spread" min={-20} max={20} />
        </div>
        <ColorField sectionId={sectionId} prop="_shadowColor" label="Color" />
      </Section>

      {/* Border */}
      {/* Typography */}
      <Section icon={Type} label="Typography" defaultOpen={false}>
        <ColorField sectionId={sectionId} prop="_textColor" label="Color" />
        <NumField sectionId={sectionId} prop="_fontSize" label="Size" min={10} max={72} />
        <AlignField sectionId={sectionId} prop="_textAlign" />
      </Section>

      {/* Border */}
      <Section icon={SquareSlash} label="Border" defaultOpen={false}>
        <BorderRadiusFields sectionId={sectionId} />
        <BorderWidthFields sectionId={sectionId} />
        <ColorField sectionId={sectionId} prop="_borderColor" label="Border Color" />
        <SelectField sectionId={sectionId} prop="_borderStyle" label="Style" options={[
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
          { value: "none", label: "None" },
        ]} />
        <SelectField sectionId={sectionId} prop="_borderPosition" label="Position" options={[
          { value: "inside", label: "Inside" },
          { value: "center", label: "Center" },
          { value: "outside", label: "Outside" },
        ]} />
      </Section>

      {/* Transform */}
      <Section icon={RotateCw} label="Transform" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_rotate" label="Rotate" min={-360} max={360} suffix="°" />
          <NumField sectionId={sectionId} prop="_scale" label="Scale" min={0.1} max={3} step={0.1} suffix="" />
          <NumField sectionId={sectionId} prop="_translateX" label="Translate X" min={-200} max={200} />
          <NumField sectionId={sectionId} prop="_translateY" label="Translate Y" min={-200} max={200} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Flip</span>
          <div className="flex gap-1">
            <FlipButton sectionId={sectionId} prop="_scaleX" icon={FlipHorizontal} />
            <FlipButton sectionId={sectionId} prop="_scaleY" icon={FlipVertical} />
          </div>
        </div>
      </Section>

      {/* Animations */}
      <Section icon={Sparkles} label="Animation" defaultOpen={false}>
        <SelectField sectionId={sectionId} prop="_animation" label="Animation" options={[
          { value: "none", label: "None" }, { value: "fade-in", label: "Fade In" },
          { value: "slide-up", label: "Slide Up" }, { value: "slide-down", label: "Slide Down" },
          { value: "slide-left", label: "Slide Left" }, { value: "slide-right", label: "Slide Right" },
          { value: "zoom-in", label: "Zoom In" }, { value: "zoom-out", label: "Zoom Out" },
        ]} />
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_animationDuration" label="Duration" min={100} max={3000} step={50} suffix="ms" />
          <NumField sectionId={sectionId} prop="_animationDelay" label="Delay" min={0} max={2000} step={50} suffix="ms" />
        </div>
        <SelectField sectionId={sectionId} prop="_animationEasing" label="Easing" options={[
          { value: "ease", label: "Ease" }, { value: "ease-in", label: "Ease In" },
          { value: "ease-out", label: "Ease Out" }, { value: "ease-in-out", label: "Ease In Out" },
          { value: "linear", label: "Linear" },
        ]} />
      </Section>

      {/* Hover */}
      <Section icon={MousePointer} label="Hover" defaultOpen={false}>
        <ColorField sectionId={sectionId} prop="_hoverBg" label="Hover BG Color" />
        <div className="grid grid-cols-2 gap-1.5">
          <NumField sectionId={sectionId} prop="_hoverScale" label="Scale" min={0.9} max={1.2} step={0.05} suffix="×" />
          <NumField sectionId={sectionId} prop="_hoverOpacity" label="Opacity" min={0} max={100} suffix="%" />
        </div>
        <SelectField sectionId={sectionId} prop="_hoverShadow" label="Shadow" options={[
          { value: "none", label: "None" }, { value: "sm", label: "Small" },
          { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" },
        ]} />
        <NumField sectionId={sectionId} prop="_hoverTransition" label="Transition" min={100} max={1000} step={50} suffix="ms" />
      </Section>

      {/* Grid */}
      <Section icon={LayoutGrid} label="Grid" defaultOpen={false}>
        <GridControls sectionId={sectionId} />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Col</span>
            <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._gridColumn as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _gridColumn: e.target.value })} placeholder="1 / 3" className="h-6 text-[11px] font-mono flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-12 shrink-0">Row</span>
            <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._gridRow as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _gridRow: e.target.value })} placeholder="1 / 2" className="h-6 text-[11px] font-mono flex-1" />
          </div>
        </div>
      </Section>

      {/* Docking */}
      <Section icon={Anchor} label="Docking" defaultOpen={false}>
        <SelectField sectionId={sectionId} prop="_dockH" label="H" options={[
          { value: "none", label: "None" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }, { value: "stretch", label: "Stretch" },
        ]} />
        <SelectField sectionId={sectionId} prop="_dockV" label="V" options={[
          { value: "none", label: "None" }, { value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }, { value: "stretch", label: "Stretch" },
        ]} />
      </Section>

      {/* HTML Semantic Tag */}
      <Section icon={Code} label="HTML" defaultOpen={false}>
        <SelectField sectionId={sectionId} prop="_htmlTag" label="Tag" options={[
          { value: "div", label: "div (default)" },
          { value: "section", label: "section" },
          { value: "article", label: "article" },
          { value: "aside", label: "aside" },
          { value: "nav", label: "nav" },
          { value: "header", label: "header" },
          { value: "footer", label: "footer" },
          { value: "main", label: "main" },
        ]} />
      </Section>
    </div>
  )
}
