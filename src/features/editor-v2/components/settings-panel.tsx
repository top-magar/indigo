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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Trash2, ArrowUp, ArrowDown, Upload, Loader2, Smartphone, Tablet, Monitor, Type, Image, Hash, Palette, ToggleLeft, List, ShoppingBag, Store, ChevronUp, ChevronDown, Paintbrush } from "lucide-react"
import { StyleManager } from "./style-manager"
import { ListFieldEditor } from "./list-field-editor"
import { ProductPicker } from "./product-picker"
import { CollectionPicker } from "./collection-picker"

const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type, textarea: Type, number: Hash, color: Palette, select: List,
  toggle: ToggleLeft, image: Image, list: List, product: ShoppingBag, collection: Store,
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const upload = async (file: File) => {
    setUploading(true)
    try { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/upload", { method: "POST", body: fd }); const data = await res.json(); if (data.url) onChange(data.url) } finally { setUploading(false) }
  }
  return (
    <div className="flex flex-col gap-1">
      {value && <img src={value} alt="" className="h-14 w-full object-cover rounded border border-border/30" />}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="h-6 text-[10px]" />
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <button onClick={() => ref.current?.click()} disabled={uploading} className="flex items-center justify-center gap-1 h-6 text-[9px] text-muted-foreground hover:text-foreground hover:bg-white/5 rounded transition-colors">
        {uploading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Upload className="h-2.5 w-2.5" />}
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  )
}

function FieldRenderer({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const v = (value ?? "") as string
  switch (field.type) {
    case "text": return <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px]" />
    case "image": return <ImageField value={v} onChange={(url) => onChange(url)} />
    case "textarea": return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={2} className="text-[10px] min-h-[48px]" />
    case "number": return (
      <div className="relative">
        <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} className="h-6 text-[10px] text-right tabular-nums pr-5" />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground pointer-events-none">#</span>
      </div>
    )
    case "color": return (
      <div className="flex gap-1.5 items-center">
        <div className="relative h-5 w-5 rounded-full ring-1 ring-white/10 shrink-0 cursor-pointer" style={{ backgroundColor: v || "#000" }}>
          <input type="color" value={v || "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-6 text-[9px] font-mono" />
      </div>
    )
    case "select": return (
      <Select value={v} onValueChange={(val) => onChange(val)}>
        <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
        <SelectContent>{field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    )
    case "toggle": return <Switch checked={!!value} onCheckedChange={(checked) => onChange(checked)} />
    case "list": return field.listFields ? <ListFieldEditor value={v} onChange={(val) => onChange(val)} listFields={field.listFields} /> : null
    case "product": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return (
        <div className="flex flex-col gap-1">
          {parsed && <span className="text-[10px] text-muted-foreground truncate">{parsed.name} — ${parsed.price}</span>}
          <ProductPicker onSelect={(p) => onChange(JSON.stringify(p))} trigger={<button className="h-6 text-[9px] text-muted-foreground hover:text-foreground hover:bg-white/5 rounded px-2 transition-colors w-full text-left">{parsed ? "Change…" : "Select product…"}</button>} />
        </div>
      )
    }
    case "collection": {
      const parsed = v ? (() => { try { return JSON.parse(v) } catch { return null } })() : null
      return (
        <div className="flex flex-col gap-1">
          {parsed && <span className="text-[10px] text-muted-foreground truncate">{parsed.name}</span>}
          <CollectionPicker onSelect={(c) => onChange(JSON.stringify(c))} trigger={<button className="h-6 text-[9px] text-muted-foreground hover:text-foreground hover:bg-white/5 rounded px-2 transition-colors w-full text-left">{parsed ? "Change…" : "Select collection…"}</button>} />
        </div>
      )
    }
    default: return null
  }
}

export function SettingsPanel() {
  const { selectedId, sections, updateProps, duplicateSection, removeSection, moveSection, viewport } = useEditorStore()
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return (
    <div className="flex flex-col items-center gap-1 py-12 text-muted-foreground">
      <Monitor className="h-5 w-5 opacity-20" />
      <span className="text-[10px]">Select a section</span>
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
      {/* Action row */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/30 shrink-0">
        <span className="text-[9px] bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5 capitalize font-medium">{section.type}</span>
        <span className="flex-1" />
        <Tooltip><TooltipTrigger asChild><button onClick={() => moveSection(idx, idx - 1)} disabled={idx === 0} className="p-0.5 hover:bg-white/10 rounded disabled:opacity-20"><ChevronUp className="h-3 w-3 text-muted-foreground" /></button></TooltipTrigger><TooltipContent side="bottom" className="text-[9px]">Move up</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><button onClick={() => moveSection(idx, idx + 1)} disabled={idx === sections.length - 1} className="p-0.5 hover:bg-white/10 rounded disabled:opacity-20"><ChevronDown className="h-3 w-3 text-muted-foreground" /></button></TooltipTrigger><TooltipContent side="bottom" className="text-[9px]">Move down</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><button onClick={() => duplicateSection(section.id)} className="p-0.5 hover:bg-white/10 rounded"><Copy className="h-3 w-3 text-muted-foreground" /></button></TooltipTrigger><TooltipContent side="bottom" className="text-[9px]">Duplicate</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><button onClick={() => removeSection(section.id)} className="p-0.5 hover:bg-white/10 rounded"><Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button></TooltipTrigger><TooltipContent side="bottom" className="text-[9px]">Delete</TooltipContent></Tooltip>
      </div>

      {/* Content / Design tabs */}
      <Tabs defaultValue="content" className="flex flex-col flex-1 min-h-0">
        <TabsList className="bg-transparent border-b border-border/30 rounded-none h-8 p-0 w-full shrink-0">
          <TabsTrigger value="content" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[10px] h-8">
            <Type className="h-3 w-3 mr-1" />Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[10px] h-8">
            <Paintbrush className="h-3 w-3 mr-1" />Design
          </TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content" className="flex-1 overflow-y-auto overscroll-contain m-0 p-3">
          {viewport !== "desktop" && (
            <div className="mb-3 text-[9px] text-blue-400 bg-blue-500/5 rounded px-2 py-1 font-medium flex items-center gap-1">
              {viewport === "tablet" ? <Tablet className="h-2.5 w-2.5" /> : <Smartphone className="h-2.5 w-2.5" />}
              Editing {viewport} overrides
            </div>
          )}
          <div className="flex flex-col gap-3">
            {block.fields.map((field) => {
              const override = hasOverride(field.name)
              const FieldIcon = FIELD_ICONS[field.type] ?? Type
              return (
                <div key={field.name} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <FieldIcon className="h-2.5 w-2.5 text-muted-foreground/50" />
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{field.label}</span>
                    {override && <span className="text-[7px] bg-blue-500/10 text-blue-400 rounded px-1 font-semibold">{override}</span>}
                  </div>
                  <FieldRenderer field={field} value={getVal(field.name)} onChange={(v) => setVal(field.name, v)} />
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="design" className="flex-1 overflow-y-auto overscroll-contain m-0">
          <Accordion type="multiple" defaultValue={["layout", "appearance", "typography", "border"]} className="border-0">
            <StyleManager sectionId={section.id} />
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
