"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GripVertical, Eye, EyeOff, Plus, Trash2, ChevronDown, Loader2, Monitor, Smartphone, Tablet, PanelLeftClose, PanelLeft, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
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

const SECTION_ICONS: Record<SectionType, string> = {
  header: "🧭", hero: "🖼️", announcement: "📢", "product-grid": "📦",
  categories: "🏷️", banner: "📣", testimonials: "💬", footer: "▤",
}

const VARIANT_GRADIENTS = [
  "from-blue-500/10 to-indigo-500/10", "from-emerald-500/10 to-teal-500/10",
  "from-amber-500/10 to-orange-500/10", "from-rose-500/10 to-pink-500/10",
]

const ADDABLE_TYPES: SectionType[] = ["announcement", "hero", "product-grid", "categories", "banner", "testimonials"]
type Device = "desktop" | "tablet" | "mobile"
const DEVICE_WIDTHS: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "375px" }

export function SectionBuilder({ initialSections, storeSlug }: { initialSections: SectionConfig[]; storeSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sections, setSections] = useState<SectionConfig[]>(initialSections.length > 0 ? initialSections : DEFAULT_SECTIONS)
  const [device, setDevice] = useState<Device>("desktop")
  const [panelOpen, setPanelOpen] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
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
  const removeSection = (id: string) => { setSections(prev => prev.filter(s => s.id !== id)); if (selected === id) setSelected(null) }
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
      {/* Left Panel */}
      {panelOpen && (
        <div className="w-[340px] shrink-0 border-r flex flex-col bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b bg-background">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Sections</h2>
              <Badge variant="secondary" className="text-[10px] tabular-nums">{sections.length}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setPanelOpen(false)}>
              <PanelLeftClose className="size-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sections.map((section) => {
              const variants = SECTION_VARIANTS[section.type]
              const fields = CONTENT_FIELDS[section.type]
              const isFixed = section.type === "header" || section.type === "footer"
              const isSelected = selected === section.id
              const activeVariant = variants.find(v => v.id === section.variant)

              return (
                <Collapsible key={section.id} open={isSelected} onOpenChange={(open) => setSelected(open ? section.id : null)}>
                  <div className={`rounded-lg border transition-all duration-150 ${!section.visible ? "opacity-40" : ""} ${isSelected ? "border-primary/40 bg-background shadow-sm" : "border-transparent hover:border-border/60 hover:bg-background/80"}`}>
                    <div className="group flex items-center gap-1.5 h-10 px-2">
                      <GripVertical className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors shrink-0 cursor-grab" />
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => moveSection(section.id, -1)}><span className="text-[10px]">↑</span></Button>
                        <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => moveSection(section.id, 1)}><span className="text-[10px]">↓</span></Button>
                      </div>

                      <CollapsibleTrigger className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm leading-none">{SECTION_ICONS[section.type]}</span>
                        <span className="text-[13px] font-medium truncate">{SECTION_LABELS[section.type]}</span>
                        {activeVariant && <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0">{activeVariant.name}</Badge>}
                        <ChevronDown className={`size-3 text-muted-foreground ml-auto shrink-0 transition-transform duration-150 ${isSelected ? "rotate-180" : ""}`} />
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-6" onClick={() => updateSection(section.id, { visible: !section.visible })}>
                            {section.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                          </Button>
                        </TooltipTrigger><TooltipContent>{section.visible ? "Hide" : "Show"}</TooltipContent></Tooltip>
                        {!isFixed && (
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-6 text-destructive/60 hover:text-destructive" onClick={() => removeSection(section.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </TooltipTrigger><TooltipContent>Remove</TooltipContent></Tooltip>
                        )}
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-3 border-t border-border/40 pt-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Variant</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {variants.map((v, vi) => (
                              <button key={v.id} onClick={() => updateSection(section.id, { variant: v.id })}
                                className={`relative p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] ${section.variant === v.id ? "border-primary ring-1 ring-primary/30 shadow-sm" : "border-border/50 hover:border-border"}`}>
                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${VARIANT_GRADIENTS[vi % VARIANT_GRADIENTS.length]} opacity-60`} />
                                <div className="relative">
                                  <div className="text-lg mb-1">{v.thumbnail}</div>
                                  <div className="text-[11px] font-medium leading-tight">{v.name}</div>
                                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{v.description}</div>
                                </div>
                                {section.variant === v.id && (
                                  <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="size-2.5 text-primary-foreground" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        {fields.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Content</p>
                            <div className="space-y-2">
                              {fields.map((f) => (
                                <div key={f.key} className="space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
                                  <Input className="h-8 text-[13px]" value={section.content[f.key] ?? ""}
                                    onChange={(e) => updateContent(section.id, f.key, e.target.value)} placeholder={f.label} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-9 mt-2 border-dashed text-muted-foreground hover:text-foreground">
                  <Plus className="size-3.5 mr-1.5" />Add Section
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-1.5" align="start">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">Choose section type</p>
                {ADDABLE_TYPES.map((type) => (
                  <button key={type} onClick={() => addSection(type)}
                    className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-left hover:bg-accent transition-colors">
                    <span className="text-base">{SECTION_ICONS[type]}</span>
                    <div>
                      <div className="text-[13px] font-medium">{SECTION_LABELS[type]}</div>
                      <div className="text-[11px] text-muted-foreground">{SECTION_VARIANTS[type].length} variants</div>
                    </div>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <div className="border-t bg-background px-3 py-2.5">
            <Button className="w-full h-9" onClick={handleSave} disabled={isPending}>
              {isPending ? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving…</> : "Save & Publish"}
            </Button>
          </div>
        </div>
      )}

      {/* Right Panel — Preview */}
      <div className="flex-1 flex flex-col bg-muted/20 min-w-0">
        <div className="flex items-center justify-between px-4 h-12 border-b bg-background">
          <div className="flex items-center gap-2">
            {!panelOpen && (
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setPanelOpen(true)}>
                <PanelLeft className="size-3.5" />
              </Button>
            )}
            <span className="text-[13px] font-medium text-muted-foreground">Preview</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
            {([["desktop", Monitor, "Desktop"], ["tablet", Tablet, "Tablet"], ["mobile", Smartphone, "Mobile"]] as const).map(([d, Icon, label]) => (
              <Tooltip key={d}><TooltipTrigger asChild>
                <button onClick={() => setDevice(d)}
                  className={`p-1.5 rounded-md transition-all ${device === d ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="size-3.5" />
                </button>
              </TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
            ))}
          </div>
          <Tooltip><TooltipTrigger asChild>
            <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-7 text-[12px] gap-1 text-muted-foreground">
                Open store <ExternalLink className="size-3" />
              </Button>
            </a>
          </TooltipTrigger><TooltipContent>Open in new tab</TooltipContent></Tooltip>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-md border overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", height: "100%" }}>
            <iframe ref={iframeRef} className="w-full h-full border-0" title="Store Preview" />
          </div>
        </div>
      </div>
    </div>
  )
}
