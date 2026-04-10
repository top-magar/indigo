"use client"

import { useState, useRef } from "react"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import type { FieldDef } from "../registry"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Copy, Trash2, ArrowUp, ArrowDown, Upload, Loader2, Smartphone, Tablet } from "lucide-react"
import { StyleManager } from "./style-manager"
import { ListFieldEditor } from "./list-field-editor"
import { ProductPicker } from "./product-picker"
import { CollectionPicker } from "./collection-picker"

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } finally { setUploading(false) }
  }
  return (
    <div className="flex flex-col gap-1.5">
      {value && <img src={value} alt="" className="h-16 w-full object-cover rounded border" />}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" className="h-7 text-xs" />
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full" onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}{uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  )
}

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const v = (value ?? "") as string
  switch (field.type) {
    case "text":
      return <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs" />
    case "image":
      return <ImageField value={v} onChange={(url) => onChange(url)} />
    case "textarea":
      return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} className="text-xs" />
    case "number":
      return <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} className="h-7 text-xs" />
    case "color":
      return (
        <div className="flex gap-2 items-center">
          <input type="color" value={v || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-5 w-5 rounded-full border cursor-pointer shrink-0 appearance-none" style={{ backgroundColor: v || "#000000" }} />
          <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono" />
        </div>
      )
    case "select":
      return (
        <Select value={v} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="h-7 w-full text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    case "toggle":
      return (
        <div className="flex items-center gap-2">
          <Switch checked={!!value} onCheckedChange={(checked) => onChange(checked)} size="sm" />
        </div>
      )
    case "list":
      return field.listFields ? <ListFieldEditor value={v} onChange={(val) => onChange(val)} listFields={field.listFields} /> : null
    case "product": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return (
        <div className="flex flex-col gap-1.5">
          {parsed && <span className="text-xs text-muted-foreground truncate">{parsed.name} — ${parsed.price}</span>}
          <ProductPicker onSelect={(p) => onChange(JSON.stringify(p))} trigger={<Button variant="outline" size="sm" className="h-7 text-xs w-full">{parsed ? "Change Product" : "Select Product"}</Button>} />
        </div>
      )
    }
    case "collection": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return (
        <div className="flex flex-col gap-1.5">
          {parsed && <span className="text-xs text-muted-foreground truncate">{parsed.name}</span>}
          <CollectionPicker onSelect={(c) => onChange(JSON.stringify(c))} trigger={<Button variant="outline" size="sm" className="h-7 text-xs w-full">{parsed ? "Change Collection" : "Select Collection"}</Button>} />
        </div>
      )
    }
    default:
      return null
  }
}

export function SettingsPanel() {
  const { selectedId, sections, updateProps, duplicateSection, removeSection, moveSection, viewport } = useEditorStore()
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return <div className="p-4 text-xs text-muted-foreground">Select a section to edit</div>

  const block = getBlock(section.type)
  if (!block) return null
  const sectionIndex = sections.findIndex((s) => s.id === selectedId)

  const getFieldValue = (fieldName: string): unknown => {
    if (viewport !== "desktop") {
      const overrides = section.props[`_props_${viewport}`] as Record<string, unknown> | undefined
      if (overrides?.[fieldName] !== undefined) return overrides[fieldName]
    }
    return section.props[fieldName]
  }

  const setFieldValue = (fieldName: string, value: unknown) => {
    if (viewport !== "desktop") {
      const key = `_props_${viewport}`
      const existing = (section.props[key] ?? {}) as Record<string, unknown>
      updateProps(section.id, { [key]: { ...existing, [fieldName]: value } })
    } else {
      updateProps(section.id, { [fieldName]: value })
    }
  }

  const hasOverride = (fieldName: string): string | null => {
    const tabletOverrides = section.props._props_tablet as Record<string, unknown> | undefined
    const mobileOverrides = section.props._props_mobile as Record<string, unknown> | undefined
    if (tabletOverrides?.[fieldName] !== undefined && mobileOverrides?.[fieldName] !== undefined) return "tablet+mobile"
    if (tabletOverrides?.[fieldName] !== undefined) return "tablet"
    if (mobileOverrides?.[fieldName] !== undefined) return "mobile"
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Action row: badge + actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b">
        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 capitalize">{section.type}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(sectionIndex, sectionIndex - 1)} disabled={sectionIndex === 0}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(sectionIndex, sectionIndex + 1)} disabled={sectionIndex === sections.length - 1}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateSection(section.id)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSection(section.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["content", "layout", "appearance", "typography", "border"]} className="border-0">
          <AccordionItem value="content" className="border-b border-border/50">
            <AccordionTrigger className="text-[11px] uppercase tracking-wider text-muted-foreground py-2 px-3">
              Content
            </AccordionTrigger>
            <AccordionContent className="px-3">
              {viewport !== "desktop" && (
                <div className="mb-2 text-[10px] text-primary bg-primary/5 rounded px-2 py-0.5 font-medium flex items-center gap-1">
                  {viewport === "tablet" ? <Tablet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  Editing <span className="capitalize">{viewport}</span> overrides
                </div>
              )}
              <div className="flex flex-col gap-3">
                {block.fields.map((field) => {
                  const override = hasOverride(field.name)
                  return (
                    <div key={field.name} className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{field.label}</Label>
                        {override && (
                          <span className="text-[8px] bg-blue-500/10 text-blue-600 rounded px-1 py-px font-medium">{override}</span>
                        )}
                      </div>
                      <FieldRenderer field={field} value={getFieldValue(field.name)} onChange={(v) => setFieldValue(field.name, v)} />
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <StyleManager sectionId={section.id} />
        </Accordion>
      </div>
    </div>
  )
}
