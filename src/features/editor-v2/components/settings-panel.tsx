"use client"

import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import type { FieldDef } from "../registry"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react"

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const v = (value ?? "") as string

  switch (field.type) {
    case "text":
    case "image":
      return <Input value={v} onChange={(e) => onChange(e.target.value)} />
    case "textarea":
      return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} />
    case "number":
      return <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} />
    case "color":
      return <input type="color" value={v} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded border cursor-pointer" />
    case "select":
      return (
        <select value={v} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded border bg-background px-3 text-sm">
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case "toggle":
      return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    default:
      return null
  }
}

export function SettingsPanel() {
  const { selectedId, sections, updateProps, duplicateSection, removeSection, moveSection } = useEditorStore()
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return <div className="p-4 text-sm text-muted-foreground">Select a section</div>

  const block = getBlock(section.type)
  if (!block) return null

  const sectionIndex = sections.findIndex((s) => s.id === selectedId)

  return (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full">
      <h3 className="font-medium text-sm capitalize">{section.type} Settings</h3>

      <Accordion type="single" collapsible defaultValue="styles">
        <AccordionItem value="styles">
          <AccordionTrigger>Section Styles</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Padding Top</Label>
                <Input type="number" value={(section.props._paddingTop as number) ?? 48} onChange={(e) => updateProps(section.id, { _paddingTop: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Padding Bottom</Label>
                <Input type="number" value={(section.props._paddingBottom as number) ?? 48} onChange={(e) => updateProps(section.id, { _paddingBottom: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Background Color</Label>
                <input type="color" value={(section.props._backgroundColor as string) ?? "#ffffff"} onChange={(e) => updateProps(section.id, { _backgroundColor: e.target.value })} className="h-9 w-full rounded border cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Max Width (0 = full)</Label>
                <Input type="number" value={(section.props._maxWidth as number) ?? 0} onChange={(e) => updateProps(section.id, { _maxWidth: Number(e.target.value) })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {block.fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <Label className="text-xs">{field.label}</Label>
          <FieldRenderer
            field={field}
            value={section.props[field.name]}
            onChange={(v) => updateProps(section.id, { [field.name]: v })}
          />
        </div>
      ))}

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => moveSection(sectionIndex, sectionIndex - 1)} disabled={sectionIndex === 0}>
            <ArrowUp className="h-3.5 w-3.5 mr-1" />Up
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => moveSection(sectionIndex, sectionIndex + 1)} disabled={sectionIndex === sections.length - 1}>
            <ArrowDown className="h-3.5 w-3.5 mr-1" />Down
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => duplicateSection(section.id)}>
          <Copy className="h-3.5 w-3.5 mr-1" />Duplicate Section
        </Button>
        <Button variant="destructive" size="sm" onClick={() => removeSection(section.id)}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Section
        </Button>
      </div>
    </div>
  )
}
