"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GripVertical, Eye, EyeOff, Plus, Trash2, ChevronDown, Loader2, Monitor, Smartphone, Tablet, PanelLeftClose, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SECTION_VARIANTS, SECTION_LABELS, DEFAULT_SECTIONS,
  type SectionConfig, type SectionType,
} from "@/features/store/section-registry"
import { saveSections } from "./actions"

const CONTENT_FIELDS: Record<SectionType, Array<{ key: string; label: string; type?: "text" | "url" }>> = {
  header: [],
  hero: [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
    { key: "cta", label: "Button Text" },
    { key: "imageUrl", label: "Background Image", type: "url" },
  ],
  announcement: [{ key: "text", label: "Message" }],
  "product-grid": [
    { key: "title", label: "Section Title" },
    { key: "limit", label: "Number of Products" },
  ],
  categories: [{ key: "title", label: "Section Title" }],
  banner: [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
    { key: "cta", label: "Button Text" },
    { key: "ctaUrl", label: "Button Link", type: "url" },
    { key: "imageUrl", label: "Image", type: "url" },
  ],
  testimonials: [{ key: "title", label: "Section Title" }],
  footer: [],
}

const ADDABLE_TYPES: SectionType[] = ["announcement", "hero", "product-grid", "categories", "banner", "testimonials"]

type Device = "desktop" | "tablet" | "mobile"
const DEVICE_WIDTHS: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "375px" }

export function SectionBuilder({ initialSections, storeSlug }: { initialSections: SectionConfig[]; storeSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sections, setSections] = useState<SectionConfig[]>(initialSections.length > 0 ? initialSections : DEFAULT_SECTIONS)
  const [device, setDevice] = useState<Device>("desktop")
  const [panelOpen, setPanelOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return
    fetch(`/api/store/${storeSlug}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections, primaryColor: "#3b82f6" }),
    }).then(r => r.text()).then(html => {
      const doc = iframeRef.current?.contentDocument
      if (doc) { doc.open(); doc.write(html); doc.close() }
    }).catch(() => {})
  }, [sections, storeSlug])

  useEffect(() => { const t = setTimeout(updatePreview, 300); return () => clearTimeout(t) }, [updatePreview])

  const updateSection = (id: string, updates: Partial<SectionConfig>) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  const updateContent = (id: string, key: string, value: string) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s))
  const addSection = (type: SectionType) => {
    const variants = SECTION_VARIANTS[type]
    setSections(prev => [...prev, { id: `s-${Date.now()}`, type, variant: variants[0].id, content: {}, visible: true, order: prev.length }])
  }
  const removeSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id))
  const moveSection = (id: string, dir: -1 | 1) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx < 0) return prev
      const ni = idx + dir
      if (ni < 0 || ni >= prev.length) return prev
      const c = [...prev]; [c[idx], c[ni]] = [c[ni], c[idx]]
      return c.map((s, i) => ({ ...s, order: i }))
    })
  }
  const handleSave = () => {
    startTransition(async () => {
      const result = await saveSections(sections)
      if (result.error) toast.error(result.error)
      else { toast.success("Store layout published!"); router.refresh() }
    })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-6 -mt-2">
      {/* Left Panel — Section Editor */}
      {panelOpen && (
        <div className="w-[380px] shrink-0 border-r flex flex-col bg-background overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Sections</h2>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setPanelOpen(false)}>
                <PanelLeftClose className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Section List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
            {sections.map((section) => {
              const variants = SECTION_VARIANTS[section.type]
              const fields = CONTENT_FIELDS[section.type]
              const isFixed = section.type === "header" || section.type === "footer"

              return (
                <Collapsible key={section.id}>
                  <div className={`rounded-lg border ${!section.visible ? "opacity-40" : ""} ${section.type === "header" || section.type === "footer" ? "bg-muted/30" : "bg-background"}`}>
                    <div className="flex items-center gap-1 px-2 py-2">
                      <GripVertical className="size-3.5 text-muted-foreground/30 shrink-0" />
                      <Button variant="ghost" size="icon" className="size-5" onClick={() => moveSection(section.id, -1)}><span className="text-[10px]">↑</span></Button>
                      <Button variant="ghost" size="icon" className="size-5" onClick={() => moveSection(section.id, 1)}><span className="text-[10px]">↓</span></Button>

                      <CollapsibleTrigger className="flex items-center gap-1.5 flex-1 text-left min-w-0">
                        <span className="text-xs font-medium truncate">{SECTION_LABELS[section.type]}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{variants.find(v => v.id === section.variant)?.name}</span>
                        <ChevronDown className="size-3 text-muted-foreground ml-auto shrink-0" />
                      </CollapsibleTrigger>

                      <Button variant="ghost" size="icon" className="size-5" onClick={() => updateSection(section.id, { visible: !section.visible })}>
                        {section.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      </Button>
                      {!isFixed && (
                        <Button variant="ghost" size="icon" className="size-5 text-destructive/60 hover:text-destructive" onClick={() => removeSection(section.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>

                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-3 border-t pt-3">
                        {/* Variant picker */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {variants.map((v) => (
                            <button key={v.id} onClick={() => updateSection(section.id, { variant: v.id })}
                              className={`p-2 rounded-md border text-left transition-all ${section.variant === v.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"}`}>
                              <div className="text-sm mb-0.5">{v.thumbnail}</div>
                              <div className="text-[10px] font-medium leading-tight">{v.name}</div>
                            </button>
                          ))}
                        </div>
                        {/* Content fields */}
                        {fields.length > 0 && (
                          <div className="space-y-2">
                            {fields.map((f) => (
                              <div key={f.key}>
                                <Label className="text-[10px] text-muted-foreground">{f.label}</Label>
                                <Input className="h-7 text-xs mt-0.5" value={section.content[f.key] ?? ""}
                                  onChange={(e) => updateContent(section.id, f.key, e.target.value)} placeholder={f.label} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}

            {/* Add section */}
            <div className="pt-2 pb-1">
              <p className="text-[10px] text-muted-foreground mb-1.5 px-1">Add section</p>
              <div className="flex flex-wrap gap-1">
                {ADDABLE_TYPES.map((type) => (
                  <Button key={type} variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => addSection(type)}>
                    <Plus className="size-3 mr-0.5" />{SECTION_LABELS[type]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="border-t px-3 py-2.5 flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={isPending}>
              {isPending ? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving…</> : "Save & Publish"}
            </Button>
          </div>
        </div>
      )}

      {/* Right Panel — Live Preview */}
      <div className="flex-1 flex flex-col bg-muted/30 min-w-0">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="flex items-center gap-2">
            {!panelOpen && (
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setPanelOpen(true)}>
                <PanelLeft className="size-3.5" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-md border p-0.5">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d)}
                className={`p-1 rounded transition-colors ${device === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
          <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Open store ↗
          </a>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", height: "100%" }}>
            <iframe ref={iframeRef} className="w-full h-full border-0" title="Store Preview" />
          </div>
        </div>
      </div>
    </div>
  )
}
