"use client"

import { useState, useRef } from "react"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import type { FieldDef } from "../registry"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Copy, Trash2, ArrowUp, ArrowDown, Upload, Loader2 } from "lucide-react"
import { StyleManager } from "./style-manager"
import { ListFieldEditor } from "./list-field-editor"
import { ProductPicker } from "./product-picker"
import { CollectionPicker } from "./collection-picker"
import { cn } from "@/shared/utils"

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
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" className="h-8 text-xs" />
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}{uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  )
}

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const v = (value ?? "") as string
  switch (field.type) {
    case "text":
      return <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
    case "image":
      return <ImageField value={v} onChange={(url) => onChange(url)} />
    case "textarea":
      return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} className="text-xs" />
    case "number":
      return <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} className="h-8 text-xs" />
    case "color":
      return (
        <div className="flex gap-2">
          <input type="color" value={v || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded border cursor-pointer shrink-0" />
          <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono" />
        </div>
      )
    case "select":
      return (
        <Select value={v} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="h-8 w-full text-xs"><SelectValue /></SelectTrigger>
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
  const { selectedId, sections, updateProps, duplicateSection, removeSection, moveSection } = useEditorStore()
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return <div className="p-4 text-sm text-muted-foreground">Select a section to edit</div>

  const block = getBlock(section.type)
  if (!block) return null
  const sectionIndex = sections.findIndex((s) => s.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="content" className="flex flex-col h-full gap-0">
        <TabsList variant="line" className="w-full shrink-0 border-b rounded-none px-1">
          <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-xs capitalize text-muted-foreground">{section.type}</h3>
            {block.fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label className="text-xs text-sidebar-foreground">{field.label}</Label>
                <FieldRenderer field={field} value={section.props[field.name]} onChange={(v) => updateProps(section.id, { [field.name]: v })} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="style" className="flex-1 overflow-y-auto p-3">
          <StyleManager sectionId={section.id} />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="border-t p-3 flex flex-col gap-1.5 shrink-0">
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => moveSection(sectionIndex, sectionIndex - 1)} disabled={sectionIndex === 0}>
            <ArrowUp className="h-3 w-3 mr-1" />Up
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => moveSection(sectionIndex, sectionIndex + 1)} disabled={sectionIndex === sections.length - 1}>
            <ArrowDown className="h-3 w-3 mr-1" />Down
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => duplicateSection(section.id)}>
            <Copy className="h-3 w-3 mr-1" />Duplicate
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 h-7 text-xs" onClick={() => removeSection(section.id)}>
            <Trash2 className="h-3 w-3 mr-1" />Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
