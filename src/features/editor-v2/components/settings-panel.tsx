"use client"

import { useState, useRef } from "react"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import type { FieldDef } from "../registry"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Trash2, Upload, Loader2, Smartphone, Tablet, Monitor, ChevronUp, ChevronDown, Paintbrush, PenLine, Code } from "lucide-react"
import { StyleManager } from "./style-manager"
import { InspectPanel } from "./inspect-panel"
import { ListFieldEditor } from "./list-field-editor"
import { RichTextField } from "./rich-text-field"
import { ProductPicker } from "./product-picker"
import { CollectionPicker } from "./collection-picker"
import { LinkPicker } from "./link-picker"

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const upload = async (file: File) => {
    setUploading(true)
    try { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/upload", { method: "POST", body: fd }); const data = await res.json(); if (data.url) onChange(data.url) } finally { setUploading(false) }
  }
  return (
    <div className="flex flex-col gap-1.5">
      {value && <img src={value} alt="" className="h-20 w-full object-cover rounded-md border border-border/20" />}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL…" className="h-7 text-xs" />
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Upload className="h-3 w-3 mr-1.5" />}
        {uploading ? "Uploading…" : "Upload image"}
      </Button>
    </div>
  )
}

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const v = (value ?? "") as string
  switch (field.type) {
    case "text": return <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs" />
    case "richtext": return <RichTextField value={v} onChange={(html) => onChange(html)} />
    case "image": return <ImageField value={v} onChange={(url) => onChange(url)} />
    case "textarea": return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} className="text-xs min-h-[64px]" />
    case "number": return <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} className="h-7 text-xs" />
    case "color": return (
      <div className="flex gap-2 items-center">
        <div className="relative h-7 w-7 rounded-md ring-1 ring-border/30 shrink-0 cursor-pointer" style={{ backgroundColor: v || "#000" }}>
          <input type="color" value={v || "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono flex-1" />
      </div>
    )
    case "select": return (
      <Select value={v} onValueChange={(val) => onChange(val)}>
        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    )
    case "toggle": return (
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{v ? "Enabled" : "Disabled"}</span><Switch checked={!!value} onCheckedChange={(checked) => onChange(checked)} /></div>
    )
    case "list": return field.listFields ? <ListFieldEditor value={v} onChange={(val) => onChange(val)} listFields={field.listFields} /> : null
    case "product": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return <ProductPicker onSelect={(p) => onChange(JSON.stringify(p))} trigger={<Button variant="outline" size="sm" className="h-7 text-xs w-full justify-start">{parsed ? `${parsed.name} — $${parsed.price}` : "Select product…"}</Button>} />
    }
    case "collection": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return <CollectionPicker onSelect={(c) => onChange(JSON.stringify(c))} trigger={<Button variant="outline" size="sm" className="h-7 text-xs w-full justify-start">{parsed ? parsed.name : "Select collection…"}</Button>} />
    }
    case "link": return <LinkPicker value={v} onChange={(url) => onChange(url)} />
    default: return null
  }
}

export function SettingsPanel() {
  const { selectedId, selectedIds, sections, updateProps, duplicateSection, removeSection, moveSection, viewport } = useEditorStore()

  if (selectedIds.length > 1) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <span className="text-sm font-medium">{selectedIds.length} sections selected</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => selectedIds.forEach((id) => duplicateSection(id))}><Copy className="h-3.5 w-3.5" />Duplicate All</Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => selectedIds.forEach((id) => removeSection(id))}><Trash2 className="h-3.5 w-3.5" />Delete All</Button>
        </div>
      </div>
    )
  }

  const section = sections.find((s) => s.id === selectedId)

  if (!section) return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
      <Monitor className="h-8 w-8 opacity-15" />
      <span className="text-xs">Select a section to edit</span>
    </div>
  )

  const block = getBlock(section.type)
  if (!block) return null
  const idx = sections.findIndex((s) => s.id === selectedId)

  const getVal = (name: string): unknown => {
    if (viewport !== "desktop") {
      const ov = section.props[`_props_${viewport}`] as Record<string, unknown> | undefined
      if (ov?.[name] !== undefined) return ov[name]
    }
    return section.props[name]
  }

  const setVal = (name: string, value: unknown) => {
    if (viewport !== "desktop") {
      const key = `_props_${viewport}`
      const existing = (section.props[key] ?? {}) as Record<string, unknown>
      updateProps(section.id, { [key]: { ...existing, [name]: value } })
    } else {
      updateProps(section.id, { [name]: value })
    }
  }

  const hasOverride = (name: string): string | null => {
    const t = section.props._props_tablet as Record<string, unknown> | undefined
    const m = section.props._props_mobile as Record<string, unknown> | undefined
    if (t?.[name] !== undefined && m?.[name] !== undefined) return "T+M"
    if (t?.[name] !== undefined) return "T"
    if (m?.[name] !== undefined) return "M"
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b border-border/30 shrink-0 gap-2">
        <span className="text-[10px] bg-blue-500/10 text-blue-400 rounded-md px-2 py-0.5 capitalize font-medium">{section.type}</span>
        <span className="flex-1" />
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(idx, idx - 1)} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Move up</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(idx, idx + 1)} disabled={idx === sections.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Move down</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateSection(section.id)}><Copy className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Duplicate</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => removeSection(section.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Delete</TooltipContent></Tooltip>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="flex flex-col flex-1 min-h-0">
        <TabsList className="bg-transparent border-b border-border/30 rounded-none h-9 p-0 w-full shrink-0">
          <TabsTrigger value="content" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs gap-1.5 h-9">
            <PenLine className="h-3.5 w-3.5" />Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs gap-1.5 h-9">
            <Paintbrush className="h-3.5 w-3.5" />Design
          </TabsTrigger>
          <TabsTrigger value="inspect" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs gap-1.5 h-9">
            <Code className="h-3.5 w-3.5" />Inspect
          </TabsTrigger>
        </TabsList>

        {/* Content: full-width stacked fields with labels above */}
        <TabsContent value="content" className="flex-1 overflow-y-auto overscroll-contain m-0">
          {viewport !== "desktop" && (
            <div className="mx-3 mt-3 text-[10px] text-blue-400 bg-blue-500/5 rounded-md px-3 py-1.5 font-medium flex items-center gap-1.5">
              {viewport === "tablet" ? <Tablet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
              Editing {viewport} overrides
            </div>
          )}
          <div className="p-3 flex flex-col gap-4">
            {block.fields.map((field) => {
              const override = hasOverride(field.name)
              return (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-sidebar-foreground">{field.label}</span>
                    {override && <span className="text-[8px] bg-blue-500/10 text-blue-400 rounded px-1 py-px font-semibold">{override}</span>}
                  </div>
                  <FieldRenderer field={field} value={getVal(field.name)} onChange={(v) => setVal(field.name, v)} />
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Design: style sections */}
        <TabsContent value="design" className="flex-1 overflow-y-auto overscroll-contain m-0">
          <StyleManager sectionId={section.id} />
        </TabsContent>

        {/* Inspect: computed CSS */}
        <TabsContent value="inspect" className="flex-1 overflow-y-auto overscroll-contain m-0">
          <InspectPanel sectionId={section.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
