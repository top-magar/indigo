"use client"

import { useEditorStore } from "../store"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Box, Paintbrush, Type, SquareSlash, Image, Sun, Droplets, AlignLeft, AlignCenter, AlignRight, Maximize2 } from "lucide-react"

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

/* ── Compact number input with label ── */
function NumInput({ sectionId, prop, label, min = 0, max = 200, step = 1 }: { sectionId: string; prop: StyleKey; label: string; min?: number; max?: number; step?: number }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[8px] text-muted-foreground/60 uppercase">{label}</span>
      <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-6 w-14 text-[10px] text-center tabular-nums px-1" />
    </div>
  )
}

/* ── Visual box model (Webflow-style) ── */
function BoxModel({ sectionId }: { sectionId: string }) {
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Margin label */}
      <span className="text-[8px] text-muted-foreground/40 uppercase mb-0.5">Margin</span>
      {/* Margin top */}
      <NumInput sectionId={sectionId} prop="_marginTop" label="" min={-100} />
      {/* Margin + Padding row */}
      <div className="flex items-center gap-0">
        <NumInput sectionId={sectionId} prop="_marginBottom" label="" min={-100} />
        {/* Padding box */}
        <div className="border border-dashed border-blue-500/30 rounded-md p-1.5 mx-1">
          <span className="text-[8px] text-blue-400/60 uppercase block text-center mb-0.5">Padding</span>
          <NumInput sectionId={sectionId} prop="_paddingTop" label="T" />
          <div className="flex items-center gap-1 my-0.5">
            <NumInput sectionId={sectionId} prop="_paddingLeft" label="L" />
            <div className="w-8 h-6 bg-white/5 rounded flex items-center justify-center">
              <span className="text-[7px] text-muted-foreground/30">content</span>
            </div>
            <NumInput sectionId={sectionId} prop="_paddingRight" label="R" />
          </div>
          <NumInput sectionId={sectionId} prop="_paddingBottom" label="B" />
        </div>
      </div>
      {/* Margin bottom */}
      <NumInput sectionId={sectionId} prop="_marginBottom" label="" min={-100} />
    </div>
  )
}

/* ── Color dot + hex ── */
function ColorRow({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  const hex = (value as string) || "transparent"
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="relative h-5 w-5 rounded-full ring-1 ring-white/10 shrink-0 cursor-pointer" style={{ backgroundColor: hex === "transparent" ? undefined : hex }}>
        <input type="color" value={hex === "transparent" ? "#ffffff" : hex} onChange={(e) => update(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </div>
      <Input value={value as string} onChange={(e) => update(e.target.value)} placeholder="transparent" className="h-5 text-[9px] font-mono flex-1" />
    </div>
  )
}

/* ── Select row ── */
function SelectRow({ sectionId, prop, label, options }: { sectionId: string; prop: StyleKey; label: string; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-16 shrink-0">{label}</span>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-5 text-[9px] flex-1"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}

/* ── Number row ── */
function NumRow({ sectionId, prop, label, min = 0, max = 200, step = 1, suffix = "px" }: { sectionId: string; prop: StyleKey; label: string; min?: number; max?: number; step?: number; suffix?: string }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-16 shrink-0">{label}</span>
      <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-5 text-[9px] text-right tabular-nums flex-1" />
      <span className="text-[8px] text-muted-foreground/40 w-4">{suffix}</span>
    </div>
  )
}

/* ── Align picker ── */
function AlignPicker({ sectionId, prop }: { sectionId: string; prop: StyleKey }) {
  const [value, update] = useStyleProp(sectionId, prop, "left")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-16 shrink-0">Align</span>
      <div className="flex gap-0.5 bg-white/5 rounded p-0.5">
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([v, I]) => (
          <Tooltip key={v}><TooltipTrigger asChild>
            <button onClick={() => update(v)} className={`h-5 w-6 flex items-center justify-center rounded transition-colors ${value === v ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>
              <I className="h-3 w-3" />
            </button>
          </TooltipTrigger><TooltipContent className="text-[9px]">{v}</TooltipContent></Tooltip>
        ))}
      </div>
    </div>
  )
}

/* ── Section header ── */
function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/20">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
    </div>
  )
}

export function StyleManager({ sectionId }: { sectionId: string }) {
  return (
    <div className="flex flex-col">
      {/* Layout — Visual Box Model */}
      <SectionHeader icon={Box} label="Layout" />
      <div className="px-3 py-3">
        <BoxModel sectionId={sectionId} />
        <div className="mt-3">
          <NumRow sectionId={sectionId} prop="_maxWidth" label="Max Width" max={1440} step={40} />
        </div>
      </div>

      {/* Appearance */}
      <SectionHeader icon={Paintbrush} label="Appearance" />
      <div className="px-3 py-3 flex flex-col gap-2">
        <ColorRow sectionId={sectionId} prop="_backgroundColor" label="Fill" />
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground w-16 shrink-0">Image</span>
          <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="URL…" className="h-5 text-[9px] flex-1" />
        </div>
        <SelectRow sectionId={sectionId} prop="_backgroundSize" label="Size" options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
        <NumRow sectionId={sectionId} prop="_backgroundOverlay" label="Overlay" max={100} suffix="%" />
        <div className="h-px bg-border/10 my-1" />
        <NumRow sectionId={sectionId} prop="_opacity" label="Opacity" max={100} suffix="%" />
        <NumRow sectionId={sectionId} prop="_blur" label="Blur" max={20} />
        <SelectRow sectionId={sectionId} prop="_shadow" label="Shadow" options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" }]} />
      </div>

      {/* Typography */}
      <SectionHeader icon={Type} label="Typography" />
      <div className="px-3 py-3 flex flex-col gap-2">
        <ColorRow sectionId={sectionId} prop="_textColor" label="Color" />
        <NumRow sectionId={sectionId} prop="_fontSize" label="Size" min={10} max={72} />
        <AlignPicker sectionId={sectionId} prop="_textAlign" />
      </div>

      {/* Border */}
      <SectionHeader icon={SquareSlash} label="Border" />
      <div className="px-3 py-3 flex flex-col gap-2">
        <NumRow sectionId={sectionId} prop="_borderRadius" label="Radius" max={48} />
        <NumRow sectionId={sectionId} prop="_borderWidth" label="Width" max={10} />
        <ColorRow sectionId={sectionId} prop="_borderColor" label="Color" />
      </div>
    </div>
  )
}
