"use client"

import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import type { FieldDef } from "../registry"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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
  const { selectedId, sections, updateProps } = useEditorStore()
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return <div className="p-4 text-sm text-muted-foreground">Select a section</div>

  const block = getBlock(section.type)
  if (!block) return null

  return (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full">
      <h3 className="font-medium text-sm capitalize">{section.type} Settings</h3>
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
    </div>
  )
}
