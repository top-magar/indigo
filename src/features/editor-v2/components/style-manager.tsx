"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type StyleKey = `_${string}`

const LABEL = "text-[11px] text-muted-foreground uppercase tracking-wider"

function useStyleProp(sectionId: string, key: StyleKey, fallback: string | number) {
  const value = useEditorStore((s) => {
    const sec = s.sections.find((x) => x.id === sectionId)
    const viewport = s.viewport
    if (viewport !== "desktop") {
      const overrideKey = `_${viewport}_${key.slice(1)}` as StyleKey
      const ov = sec?.props[overrideKey]
      if (ov !== undefined && ov !== "") return ov
    }
    return sec?.props[key] ?? fallback
  })
  const update = (v: string | number) => {
    const viewport = useEditorStore.getState().viewport
    const actualKey = viewport !== "desktop" ? `_${viewport}_${key.slice(1)}` : key
    useEditorStore.getState().updateProps(sectionId, { [actualKey]: v })
  }
  return [value, update] as const
}

function NumberField({ sectionId, prop, label, min, max, step }: { sectionId: string; prop: StyleKey; label: string; min?: number; max?: number; step?: number }) {
  const [value, update] = useStyleProp(sectionId, prop, 0)
  return (
    <div className="flex flex-col gap-1">
      <Label className={LABEL}>{label}</Label>
      <div className="relative">
        <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-6 text-xs text-right tabular-nums pr-6" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[9px] pointer-events-none">px</span>
      </div>
    </div>
  )
}

function ColorField({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  const hex = (value as string) || "#ffffff"
  return (
    <div className="flex flex-col gap-1">
      <Label className={LABEL}>{label}</Label>
      <div className="flex gap-2 items-center">
        <label className="h-4 w-4 rounded-full border cursor-pointer shrink-0 block" style={{ backgroundColor: hex }}>
          <input type="color" value={hex} onChange={(e) => update(e.target.value)} className="sr-only" />
        </label>
        <Input value={value as string} onChange={(e) => update(e.target.value)} placeholder="transparent" className="h-7 text-xs font-mono" />
      </div>
    </div>
  )
}

function SelectField({ sectionId, prop, label, options }: { sectionId: string; prop: StyleKey; label: string; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex flex-col gap-1">
      <Label className={LABEL}>{label}</Label>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-7 w-full text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

const TRIGGER = "text-[11px] uppercase tracking-wider text-muted-foreground py-2 px-3"

export function StyleManager({ sectionId }: { sectionId: string }) {
  const viewport = useEditorStore((s) => s.viewport)

  return (
    <>
      {viewport !== "desktop" && (
        <div className="mx-3 mb-1 text-[10px] text-primary bg-primary/5 rounded px-2 py-0.5 font-medium">
          <span className="capitalize">{viewport}</span> overrides
        </div>
      )}

      {/* Layout */}
      <AccordionItem value="layout" className="border-b border-border/50">
        <AccordionTrigger className={TRIGGER}>Layout</AccordionTrigger>
        <AccordionContent className="px-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberField sectionId={sectionId} prop="_paddingTop" label="Top" min={0} max={200} />
            <NumberField sectionId={sectionId} prop="_paddingBottom" label="Bottom" min={0} max={200} />
            <NumberField sectionId={sectionId} prop="_paddingLeft" label="Left" min={0} max={200} />
            <NumberField sectionId={sectionId} prop="_paddingRight" label="Right" min={0} max={200} />
            <NumberField sectionId={sectionId} prop="_marginTop" label="Margin T" min={-100} max={200} />
            <NumberField sectionId={sectionId} prop="_marginBottom" label="Margin B" min={-100} max={200} />
            <NumberField sectionId={sectionId} prop="_maxWidth" label="Max W" min={0} max={1400} step={50} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Appearance */}
      <AccordionItem value="appearance" className="border-b border-border/50">
        <AccordionTrigger className={TRIGGER}>Appearance</AccordionTrigger>
        <AccordionContent className="px-3">
          <div className="flex flex-col gap-2">
            <ColorField sectionId={sectionId} prop="_backgroundColor" label="Background" />
            <div className="flex flex-col gap-1">
              <Label className={LABEL}>Image URL</Label>
              <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="https://..." className="h-7 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SelectField sectionId={sectionId} prop="_backgroundSize" label="Size" options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
              <NumberField sectionId={sectionId} prop="_backgroundOverlay" label="Overlay %" min={0} max={100} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberField sectionId={sectionId} prop="_opacity" label="Opacity %" min={0} max={100} />
              <NumberField sectionId={sectionId} prop="_blur" label="Blur" min={0} max={20} />
            </div>
            <SelectField sectionId={sectionId} prop="_shadow" label="Shadow" options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "XL" }]} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Typography */}
      <AccordionItem value="typography" className="border-b border-border/50">
        <AccordionTrigger className={TRIGGER}>Typography</AccordionTrigger>
        <AccordionContent className="px-3">
          <div className="flex flex-col gap-2">
            <ColorField sectionId={sectionId} prop="_textColor" label="Color" />
            <div className="grid grid-cols-2 gap-2">
              <NumberField sectionId={sectionId} prop="_fontSize" label="Size" min={10} max={72} />
              <SelectField sectionId={sectionId} prop="_textAlign" label="Align" options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Border */}
      <AccordionItem value="border">
        <AccordionTrigger className={TRIGGER}>Border</AccordionTrigger>
        <AccordionContent className="px-3">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <NumberField sectionId={sectionId} prop="_borderRadius" label="Radius" min={0} max={48} />
              <NumberField sectionId={sectionId} prop="_borderWidth" label="Width" min={0} max={10} />
            </div>
            <ColorField sectionId={sectionId} prop="_borderColor" label="Color" />
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  )
}
