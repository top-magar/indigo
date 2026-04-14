"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GripVertical, Eye, EyeOff, Plus, Trash2, ChevronDown, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SECTION_VARIANTS, SECTION_LABELS, DEFAULT_SECTIONS,
  type SectionConfig, type SectionType,
} from "@/features/store/section-registry"
import { saveSections } from "./actions"

/** Content fields per section type */
const CONTENT_FIELDS: Record<SectionType, Array<{ key: string; label: string; type?: "text" | "textarea" | "url" }>> = {
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

export function SectionBuilder({ initialSections, storeSlug }: { initialSections: SectionConfig[]; storeSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sections, setSections] = useState<SectionConfig[]>(
    initialSections.length > 0 ? initialSections : DEFAULT_SECTIONS
  )
  const [showPreview, setShowPreview] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Update preview iframe whenever sections change
  const updatePreview = useCallback(() => {
    if (!showPreview || !iframeRef.current) return
    fetch(`/api/store/${storeSlug}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections, primaryColor: "#3b82f6" }),
    })
      .then(r => r.text())
      .then(html => {
        const doc = iframeRef.current?.contentDocument
        if (doc) { doc.open(); doc.write(html); doc.close() }
      })
      .catch(() => {})
  }, [sections, showPreview, storeSlug])

  useEffect(() => { updatePreview() }, [updatePreview])

  const updateSection = (id: string, updates: Partial<SectionConfig>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const updateContent = (id: string, key: string, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s))
  }

  const addSection = (type: SectionType) => {
    const variants = SECTION_VARIANTS[type]
    const newSection: SectionConfig = {
      id: `s-${Date.now()}`,
      type,
      variant: variants[0].id,
      content: {},
      visible: true,
      order: sections.length,
    }
    setSections(prev => [...prev, newSection])
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const moveSection = (id: string, direction: -1 | 1) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx < 0) return prev
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]
      return copy.map((s, i) => ({ ...s, order: i }))
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveSections(sections)
      if (result.error) toast.error(result.error)
      else { toast.success("Store layout saved!"); router.refresh() }
    })
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.4px]">Store Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Pick sections and design variants for your store.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              Open Store <ExternalLink className="size-3.5 ml-1.5" />
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving…</> : "Save & Publish"}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <Card className="overflow-hidden">
          <CardHeader className="py-2 px-4 border-b bg-muted/30">
            <CardTitle className="text-xs text-muted-foreground">Live Preview</CardTitle>
          </CardHeader>
          <iframe ref={iframeRef} className="w-full h-[500px] border-0" title="Store Preview" />
        </Card>
      )}

      {/* Section list */}
      <div className="space-y-2">
        {sections.map((section) => {
          const variants = SECTION_VARIANTS[section.type]
          const fields = CONTENT_FIELDS[section.type]
          const isFixed = section.type === "header" || section.type === "footer"

          return (
            <Collapsible key={section.id}>
              <Card className={!section.visible ? "opacity-50" : ""}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground/40 cursor-grab shrink-0" />

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => moveSection(section.id, -1)}><span className="text-xs">↑</span></Button>
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => moveSection(section.id, 1)}><span className="text-xs">↓</span></Button>
                    </div>

                    <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                      <span className="text-sm font-medium">{SECTION_LABELS[section.type]}</span>
                      <span className="text-xs text-muted-foreground">
                        {variants.find(v => v.id === section.variant)?.name}
                      </span>
                      <ChevronDown className="size-3.5 text-muted-foreground ml-auto" />
                    </CollapsibleTrigger>

                    <Button variant="ghost" size="icon" className="size-7" onClick={() => updateSection(section.id, { visible: !section.visible })}>
                      {section.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </Button>

                    {!isFixed && (
                      <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeSection(section.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4 space-y-4">
                    {/* Variant picker */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Design Variant</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {variants.map((v) => (
                          <button key={v.id} onClick={() => updateSection(section.id, { variant: v.id })}
                            className={`p-2.5 rounded-lg border-2 text-left transition-colors ${section.variant === v.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                            <div className="text-lg mb-1">{v.thumbnail}</div>
                            <div className="text-xs font-medium">{v.name}</div>
                            <div className="text-[10px] text-muted-foreground">{v.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content fields */}
                    {fields.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-xs text-muted-foreground">Content</Label>
                        {fields.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                              value={section.content[field.key] ?? ""}
                              onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                              placeholder={field.label}
                              type={field.type === "url" ? "url" : "text"}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* Add section */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2"><Plus className="size-4 inline mr-1" />Add section:</span>
            {ADDABLE_TYPES.map((type) => (
              <Button key={type} variant="outline" size="sm" onClick={() => addSection(type)}>
                {SECTION_LABELS[type]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving…</> : "Save & Publish"}
        </Button>
      </div>
    </div>
  )
}
