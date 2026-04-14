"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { PropSchema } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"

/** Editable list of {label, href} objects — used for nav links, footer columns, etc. */
function JsonListEditor({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? value as Array<Record<string, string>> : []

  const update = (idx: number, key: string, val: string) => {
    const next = items.map((item, i) => i === idx ? { ...item, [key]: val } : item)
    onChange(next)
  }
  const add = () => onChange([...items, { label: "", href: "" }])
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx))

  // Detect keys from first item or default to label+href
  const keys = items.length > 0 ? Object.keys(items[0]) : ["label", "href"]

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1 group">
          <GripVertical className="size-3 text-muted-foreground/30 shrink-0" />
          {keys.map((k) => (
            <Input key={k} value={item[k] ?? ""} onChange={(e) => update(i, k, e.target.value)}
              placeholder={k} className="h-6 text-[10px] flex-1 min-w-0" />
          ))}
          <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 shrink-0"
            onClick={() => remove(i)}><Trash2 className="size-2.5 text-muted-foreground" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-6 text-[9px]" onClick={add}>
        <Plus className="size-3" /> Add Item
      </Button>
    </div>
  )
}

function PropField({ schema, value, onChange }: { schema: PropSchema; value: unknown; onChange: (v: unknown) => void }) {
  if (schema.options) {
    return (
      <Select value={String(value ?? schema.defaultValue ?? "")} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
        <SelectContent>{schema.options.map((o) => <SelectItem key={o.value} value={o.value} className="text-[11px]">{o.label}</SelectItem>)}</SelectContent>
      </Select>
    )
  }
  if (schema.type === "json") return <JsonListEditor value={value ?? schema.defaultValue ?? []} onChange={onChange} />
  if (schema.type === "boolean") return <Checkbox checked={Boolean(value ?? schema.defaultValue)} onCheckedChange={(v) => onChange(v)} />
  if (schema.type === "number") return <Input type="number" value={Number(value ?? schema.defaultValue ?? 0)} onChange={(e) => onChange(Number(e.target.value))} className="h-7 text-[11px]" />
  if (schema.multiline) return <textarea value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 text-[11px] font-mono border rounded resize-y bg-background focus:ring-1 focus:ring-ring focus:outline-none" rows={4} />
  return <Input value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
}

export function SettingsPanel() {
  const s = useStore()
  const instance = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId) : undefined

  if (!s.selectedInstanceId || !instance) {
    return (
      <div className="p-4 text-center">
        <div className="text-xs text-muted-foreground">No element selected</div>
        <div className="text-[10px] text-muted-foreground/60 mt-0.5">Click an element on the canvas or navigator</div>
      </div>
    )
  }

  const meta = getMeta(instance.component)
  const propValues = new Map<string, unknown>()
  for (const p of s.props.values()) { if (p.instanceId === s.selectedInstanceId) propValues.set(p.name, p.value) }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-medium">{meta?.label ?? instance.component}</div>
          <div className="text-[10px] text-muted-foreground">{instance.component} · {instance.id.slice(0, 6)}</div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive"
          onClick={() => { s.removeInstance(s.selectedInstanceId!); s.select(null) }}>Delete</Button>
      </div>
      <div className="mb-3">
        <label className="text-[10px] text-muted-foreground block mb-1">Label</label>
        <Input value={instance.label ?? ""} onChange={(e) => s.setInstanceLabel(s.selectedInstanceId!, e.target.value)}
          className="h-7 text-[11px]" placeholder={meta?.label} />
      </div>
      {meta?.propsSchema && meta.propsSchema.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-[10px] font-medium text-muted-foreground mb-2">Properties</div>
          {meta.propsSchema.map((schema) => (
            <div key={schema.name} className="mb-2.5">
              <label className="text-[10px] text-muted-foreground block mb-1">{schema.label}</label>
              <PropField schema={schema} value={propValues.get(schema.name)} onChange={(v) => s.setProp(s.selectedInstanceId!, schema.name, schema.type, v as never)} />
            </div>
          ))}
        </div>
      )}
      {/* HTML Attributes */}
      <div className="border-t pt-3">
        <div className="text-[10px] font-medium text-muted-foreground mb-2">HTML Attributes</div>
        {[
          { name: "htmlId", label: "ID", placeholder: "element-id" },
          { name: "htmlClass", label: "Class", placeholder: "custom-class" },
          { name: "ariaLabel", label: "aria-label", placeholder: "Accessible label" },
          { name: "role", label: "role", placeholder: "button, navigation..." },
          { name: "dataAttr", label: "data-*", placeholder: "key=value, key2=value2" },
        ].map((attr) => (
          <div key={attr.name} className="mb-2">
            <label className="text-[10px] text-muted-foreground block mb-1">{attr.label}</label>
            <Input value={String(propValues.get(attr.name) ?? "")}
              onChange={(e) => s.setProp(s.selectedInstanceId!, attr.name, "string", e.target.value)}
              className="h-7 text-[11px]" placeholder={attr.placeholder} />
          </div>
        ))}
      </div>
    </div>
  )
}
