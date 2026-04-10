"use client"

import { useEditorStore } from "../store"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Box, Paintbrush, Type, SquareSlash, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

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

/* ── Label + full-width number input ── */
function NumField({ sectionId, prop, label, min = 0, max = 200, step = 1, suffix = "px" }: { sectionId: string; prop: StyleKey; label: string; min?: number; max?: number; step?: number; suffix?: string }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="relative">
        <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-7 text-xs tabular-nums pr-7" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 pointer-events-none">{suffix}</span>
      </div>
    </div>
  )
}

/* ── Label + color swatch + hex ── */
function ColorField({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  const hex = (value as string) || "transparent"
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex gap-2 items-center">
        <div className="relative h-7 w-7 rounded-md ring-1 ring-border/30 shrink-0 cursor-pointer" style={{ backgroundColor: hex === "transparent" ? undefined : hex }}>
          <input type="color" value={hex === "transparent" ? "#ffffff" : hex} onChange={(e) => update(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        <Input value={value as string} onChange={(e) => update(e.target.value)} placeholder="transparent" className="h-7 text-xs font-mono flex-1" />
      </div>
    </div>
  )
}

/* ── Label + select ── */
function SelectField({ sectionId, prop, label, options }: { sectionId: string; prop: StyleKey; label: string; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}

/* ── Align picker ── */
function AlignField({ sectionId, prop }: { sectionId: string; prop: StyleKey }) {
  const [value, update] = useStyleProp(sectionId, prop, "left")
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground">Text Align</span>
      <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5 w-fit">
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([v, I]) => (
          <Tooltip key={v}><TooltipTrigger asChild>
            <button onClick={() => update(v)} className={`h-7 w-8 flex items-center justify-center rounded transition-colors ${value === v ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>
              <I className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger><TooltipContent className="text-[10px] capitalize">{v}</TooltipContent></Tooltip>
        ))}
      </div>
    </div>
  )
}

/* ── Section with icon header ── */
function Section({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/20 last:border-b-0">
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-sidebar-foreground">{label}</span>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function StyleManager({ sectionId }: { sectionId: string }) {
  return (
    <div>
      {/* Layout: padding + margin in 2-col grids */}
      <Section icon={Box} label="Layout">
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Padding</span>
        <div className="grid grid-cols-2 gap-2">
          <NumField sectionId={sectionId} prop="_paddingTop" label="Top" />
          <NumField sectionId={sectionId} prop="_paddingBottom" label="Bottom" />
          <NumField sectionId={sectionId} prop="_paddingLeft" label="Left" />
          <NumField sectionId={sectionId} prop="_paddingRight" label="Right" />
        </div>
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mt-1">Margin</span>
        <div className="grid grid-cols-2 gap-2">
          <NumField sectionId={sectionId} prop="_marginTop" label="Top" min={-100} />
          <NumField sectionId={sectionId} prop="_marginBottom" label="Bottom" min={-100} />
        </div>
        <NumField sectionId={sectionId} prop="_maxWidth" label="Max Width" max={1440} step={40} />
      </Section>

      {/* Appearance */}
      <Section icon={Paintbrush} label="Appearance">
        <ColorField sectionId={sectionId} prop="_backgroundColor" label="Background Color" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Background Image</span>
          <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="https://..." className="h-7 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SelectField sectionId={sectionId} prop="_backgroundSize" label="Size" options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <NumField sectionId={sectionId} prop="_backgroundOverlay" label="Overlay" max={100} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumField sectionId={sectionId} prop="_opacity" label="Opacity" max={100} suffix="%" />
          <NumField sectionId={sectionId} prop="_blur" label="Blur" max={20} />
        </div>
        <SelectField sectionId={sectionId} prop="_shadow" label="Shadow" options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" }]} />
      </Section>

      {/* Typography */}
      <Section icon={Type} label="Typography">
        <ColorField sectionId={sectionId} prop="_textColor" label="Text Color" />
        <NumField sectionId={sectionId} prop="_fontSize" label="Font Size" min={10} max={72} />
        <AlignField sectionId={sectionId} prop="_textAlign" />
      </Section>

      {/* Border */}
      <Section icon={SquareSlash} label="Border">
        <div className="grid grid-cols-2 gap-2">
          <NumField sectionId={sectionId} prop="_borderRadius" label="Radius" max={48} />
          <NumField sectionId={sectionId} prop="_borderWidth" label="Width" max={10} />
        </div>
        <ColorField sectionId={sectionId} prop="_borderColor" label="Border Color" />
      </Section>
    </div>
  )
}
