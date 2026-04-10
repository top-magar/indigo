"use client"

import { useEditorStore } from "../store"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Box, Paintbrush, Type, SquareSlash, Minus, Plus, Smartphone, Tablet, ArrowUpDown, MoveHorizontal, MoveVertical, Maximize2, Image, Sun, Droplets, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

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

function NumStepper({ sectionId, prop, label, icon: Icon, min = 0, max = 200, step = 1, suffix = "px" }: { sectionId: string; prop: StyleKey; label: string; icon: React.ComponentType<{ className?: string }>; min?: number; max?: number; step?: number; suffix?: string }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  const v = value as number
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[9px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-0 bg-white/5 rounded h-5 px-0.5">
        <button onClick={() => update(Math.max(min, v - step))} className="h-4 w-4 flex items-center justify-center rounded hover:bg-white/10"><Minus className="h-2 w-2 text-muted-foreground" /></button>
        <span className="text-[9px] tabular-nums w-7 text-center">{v}{suffix}</span>
        <button onClick={() => update(Math.min(max, v + step))} className="h-4 w-4 flex items-center justify-center rounded hover:bg-white/10"><Plus className="h-2 w-2 text-muted-foreground" /></button>
      </div>
    </div>
  )
}

function ColorDot({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  const hex = (value as string) || "transparent"
  return (
    <div className="flex items-center gap-1.5">
      <Tooltip><TooltipTrigger asChild>
        <div className="relative h-4 w-4 rounded-full ring-1 ring-white/10 shrink-0 cursor-pointer" style={{ backgroundColor: hex === "transparent" ? undefined : hex }}>
          <input type="color" value={hex === "transparent" ? "#ffffff" : hex} onChange={(e) => update(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
      </TooltipTrigger><TooltipContent side="left" className="text-[9px]">{label}</TooltipContent></Tooltip>
      <Input value={value as string} onChange={(e) => update(e.target.value)} placeholder="transparent" className="h-5 text-[9px] font-mono flex-1" />
    </div>
  )
}

function SelectRow({ sectionId, prop, label, icon: Icon, options }: { sectionId: string; prop: StyleKey; label: string; icon: React.ComponentType<{ className?: string }>; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[9px] text-muted-foreground">{label}</span>
      </div>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-5 text-[9px] w-20"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}

function AlignPicker({ sectionId, prop }: { sectionId: string; prop: StyleKey }) {
  const [value, update] = useStyleProp(sectionId, prop, "left")
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1"><AlignLeft className="h-2.5 w-2.5 text-muted-foreground/50" /><span className="text-[9px] text-muted-foreground">Align</span></div>
      <div className="flex gap-0.5 bg-white/5 rounded p-0.5">
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([v, I]) => (
          <button key={v} onClick={() => update(v)} className={`h-4 w-5 flex items-center justify-center rounded transition-colors ${value === v ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:bg-white/10"}`}>
            <I className="h-2.5 w-2.5" />
          </button>
        ))}
      </div>
    </div>
  )
}

const TRIGGER = "text-[10px] uppercase tracking-widest text-muted-foreground py-2 px-3 hover:no-underline"

export function StyleManager({ sectionId }: { sectionId: string }) {
  return (
    <>
      {/* Layout */}
      <AccordionItem value="layout" className="border-b border-border/30">
        <AccordionTrigger className={TRIGGER}><div className="flex items-center gap-1.5"><Box className="h-3 w-3" />Layout</div></AccordionTrigger>
        <AccordionContent className="px-3 pb-3 flex flex-col gap-1.5">
          <NumStepper sectionId={sectionId} prop="_paddingTop" label="Pad Top" icon={MoveVertical} />
          <NumStepper sectionId={sectionId} prop="_paddingBottom" label="Pad Bottom" icon={MoveVertical} />
          <NumStepper sectionId={sectionId} prop="_paddingLeft" label="Pad Left" icon={MoveHorizontal} />
          <NumStepper sectionId={sectionId} prop="_paddingRight" label="Pad Right" icon={MoveHorizontal} />
          <div className="h-px bg-border/20 my-0.5" />
          <NumStepper sectionId={sectionId} prop="_marginTop" label="Margin Top" icon={ArrowUpDown} min={-100} />
          <NumStepper sectionId={sectionId} prop="_marginBottom" label="Margin Bot" icon={ArrowUpDown} min={-100} />
          <div className="h-px bg-border/20 my-0.5" />
          <NumStepper sectionId={sectionId} prop="_maxWidth" label="Max Width" icon={Maximize2} max={1440} step={40} />
        </AccordionContent>
      </AccordionItem>

      {/* Appearance */}
      <AccordionItem value="appearance" className="border-b border-border/30">
        <AccordionTrigger className={TRIGGER}><div className="flex items-center gap-1.5"><Paintbrush className="h-3 w-3" />Appearance</div></AccordionTrigger>
        <AccordionContent className="px-3 pb-3 flex flex-col gap-1.5">
          <ColorDot sectionId={sectionId} prop="_backgroundColor" label="Background" />
          <div className="flex items-center gap-1">
            <Image className="h-2.5 w-2.5 text-muted-foreground/50" />
            <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="Image URL…" className="h-5 text-[9px] flex-1" />
          </div>
          <SelectRow sectionId={sectionId} prop="_backgroundSize" label="Size" icon={Image} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <NumStepper sectionId={sectionId} prop="_backgroundOverlay" label="Overlay" icon={Droplets} max={100} suffix="%" />
          <div className="h-px bg-border/20 my-0.5" />
          <NumStepper sectionId={sectionId} prop="_opacity" label="Opacity" icon={Sun} max={100} suffix="%" />
          <NumStepper sectionId={sectionId} prop="_blur" label="Blur" icon={Droplets} max={20} />
          <SelectRow sectionId={sectionId} prop="_shadow" label="Shadow" icon={Box} options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" }]} />
        </AccordionContent>
      </AccordionItem>

      {/* Typography */}
      <AccordionItem value="typography" className="border-b border-border/30">
        <AccordionTrigger className={TRIGGER}><div className="flex items-center gap-1.5"><Type className="h-3 w-3" />Typography</div></AccordionTrigger>
        <AccordionContent className="px-3 pb-3 flex flex-col gap-1.5">
          <ColorDot sectionId={sectionId} prop="_textColor" label="Text Color" />
          <NumStepper sectionId={sectionId} prop="_fontSize" label="Size" icon={Type} min={10} max={72} />
          <AlignPicker sectionId={sectionId} prop="_textAlign" />
        </AccordionContent>
      </AccordionItem>

      {/* Border */}
      <AccordionItem value="border">
        <AccordionTrigger className={TRIGGER}><div className="flex items-center gap-1.5"><SquareSlash className="h-3 w-3" />Border</div></AccordionTrigger>
        <AccordionContent className="px-3 pb-3 flex flex-col gap-1.5">
          <NumStepper sectionId={sectionId} prop="_borderRadius" label="Radius" icon={Box} max={48} />
          <NumStepper sectionId={sectionId} prop="_borderWidth" label="Width" icon={SquareSlash} max={10} />
          <ColorDot sectionId={sectionId} prop="_borderColor" label="Border Color" />
        </AccordionContent>
      </AccordionItem>
    </>
  )
}
