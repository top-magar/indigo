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
import { Copy, Trash2, ArrowUp, ArrowDown, Upload, Loader2 } from "lucide-react"
import { StyleManager } from "./style-manager"
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
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" className="h-7 text-xs" />
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
      return <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs" />
    case "image":
      return <ImageField value={v} onChange={(url) => onChange(url)} />
    case "textarea":
      return <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} className="text-xs" />
    case "number":
      return <Input type="number" value={v} onChange={(e) => onChange(Number(e.target.value))} className="h-7 text-xs" />
    case "color":
      return (
        <div className="flex gap-2">
          <input type="color" value={v || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 rounded border cursor-pointer shrink-0" />
          <Input value={v} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono" />
        </div>
      )
    case "select":
      return (
        <select value={v} onChange={(e) => onChange(e.target.value)} className="h-7 w-full rounded border bg-background px-2 text-xs">
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
  const [tab, setTab] = useState<"content" | "style">("content")
  const section = sections.find((s) => s.id === selectedId)

  if (!section) return <div className="p-4 text-sm text-muted-foreground">Select a section to edit</div>

  const block = getBlock(section.type)
  if (!block) return null
  const sectionIndex = sections.findIndex((s) => s.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      {/* Tab toggle */}
      <div className="flex border-b shrink-0">
        <button onClick={() => setTab("content")} className={cn("flex-1 text-xs font-medium py-2 border-b-2 transition-colors", tab === "content" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>Content</button>
        <button onClick={() => setTab("style")} className={cn("flex-1 text-xs font-medium py-2 border-b-2 transition-colors", tab === "style" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>Style</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "content" ? (
          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-xs capitalize text-muted-foreground">{section.type}</h3>
            {block.fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <Label className="text-xs">{field.label}</Label>
                <FieldRenderer field={field} value={section.props[field.name]} onChange={(v) => updateProps(section.id, { [field.name]: v })} />
              </div>
            ))}
          </div>
        ) : (
          <StyleManager sectionId={section.id} />
        )}
      </div>

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
