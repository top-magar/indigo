"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type StyleKey = `_${string}`

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
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-sidebar-foreground">{label}</Label>
      <Input type="number" value={value as number} onChange={(e) => update(Number(e.target.value))} min={min} max={max} step={step} className="h-7 text-xs" />
    </div>
  )
}

function ColorField({ sectionId, prop, label }: { sectionId: string; prop: StyleKey; label: string }) {
  const [value, update] = useStyleProp(sectionId, prop, "")
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-sidebar-foreground">{label}</Label>
      <div className="flex gap-2">
        <input type="color" value={(value as string) || "#ffffff"} onChange={(e) => update(e.target.value)} className="h-7 w-7 rounded-md border cursor-pointer shrink-0" />
        <Input value={value as string} onChange={(e) => update(e.target.value)} placeholder="transparent" className="h-7 text-xs font-mono" />
      </div>
    </div>
  )
}

function SelectField({ sectionId, prop, label, options }: { sectionId: string; prop: StyleKey; label: string; options: { value: string; label: string }[] }) {
  const [value, update] = useStyleProp(sectionId, prop, options[0]?.value ?? "")
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-sidebar-foreground">{label}</Label>
      <Select value={value as string} onValueChange={(v) => update(v)}>
        <SelectTrigger className="h-7 w-full text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export function StyleManager({ sectionId }: { sectionId: string }) {
  const viewport = useEditorStore((s) => s.viewport)

  return (
    <div className="flex flex-col gap-1">
      {viewport !== "desktop" && (
        <div className="text-[10px] text-primary bg-muted rounded px-2 py-1 mb-1">
          Editing <span className="font-semibold capitalize">{viewport}</span> overrides
        </div>
      )}
      <Accordion type="multiple" defaultValue={["spacing", "background", "typography", "border", "effects"]}>
        <AccordionItem value="spacing">
          <AccordionTrigger className="text-xs py-2">Spacing</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3">
              <NumberField sectionId={sectionId} prop="_paddingTop" label="Padding Top" min={0} max={200} />
              <NumberField sectionId={sectionId} prop="_paddingBottom" label="Padding Bottom" min={0} max={200} />
              <NumberField sectionId={sectionId} prop="_paddingLeft" label="Padding Left" min={0} max={200} />
              <NumberField sectionId={sectionId} prop="_paddingRight" label="Padding Right" min={0} max={200} />
              <NumberField sectionId={sectionId} prop="_marginTop" label="Margin Top" min={-100} max={200} />
              <NumberField sectionId={sectionId} prop="_marginBottom" label="Margin Bottom" min={-100} max={200} />
              <NumberField sectionId={sectionId} prop="_maxWidth" label="Max Width" min={0} max={1400} step={50} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="background">
          <AccordionTrigger className="text-xs py-2">Background</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <ColorField sectionId={sectionId} prop="_backgroundColor" label="Color" />
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-sidebar-foreground">Image URL</Label>
                <Input value={useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props._backgroundImage as string ?? ""} onChange={(e) => useEditorStore.getState().updateProps(sectionId, { _backgroundImage: e.target.value })} placeholder="https://..." className="h-7 text-xs" />
              </div>
              <SelectField sectionId={sectionId} prop="_backgroundSize" label="Size" options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
              <NumberField sectionId={sectionId} prop="_backgroundOverlay" label="Overlay Opacity %" min={0} max={100} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger className="text-xs py-2">Typography</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <ColorField sectionId={sectionId} prop="_textColor" label="Text Color" />
              <NumberField sectionId={sectionId} prop="_fontSize" label="Font Size" min={10} max={72} />
              <SelectField sectionId={sectionId} prop="_textAlign" label="Alignment" options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="border">
          <AccordionTrigger className="text-xs py-2">Border</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <NumberField sectionId={sectionId} prop="_borderRadius" label="Radius" min={0} max={48} />
              <NumberField sectionId={sectionId} prop="_borderWidth" label="Width" min={0} max={10} />
              <ColorField sectionId={sectionId} prop="_borderColor" label="Color" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effects">
          <AccordionTrigger className="text-xs py-2">Effects</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <NumberField sectionId={sectionId} prop="_opacity" label="Opacity %" min={0} max={100} />
              <SelectField sectionId={sectionId} prop="_shadow" label="Shadow" options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" }]} />
              <NumberField sectionId={sectionId} prop="_blur" label="Blur" min={0} max={20} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
