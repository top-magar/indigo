"use client"

import { useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SeoIcon,
  Image01Icon,
  Share01Icon,
  CodeIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
// Simplified SEO interface for the panel
interface PageSEO {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  twitterCard?: "summary" | "summary_large_image"
  canonicalUrl?: string
  noIndex?: boolean
  noFollow?: boolean
}

// ============================================================================
// TYPES
// ============================================================================

interface SEOPanelProps {
  seo: PageSEO
  onChange: (seo: PageSEO) => void
  storeName: string
}

// ============================================================================
// CHARACTER COUNTER
// ============================================================================

interface CharCountProps {
  current: number
  max: number
  warn?: number
}

function CharCount({ current, max, warn = max - 10 }: CharCountProps) {
  const isOver = current > max
  const isWarn = current > warn && !isOver
  return (
    <span className={cn(
      "text-[10px]",
      isOver && "text-destructive",
      isWarn && "text-amber-500",
      !isOver && !isWarn && "text-muted-foreground"
    )}>
      {current}/{max}
    </span>
  )
}


// ============================================================================
// SOCIAL PREVIEW
// ============================================================================

interface SocialPreviewProps {
  title: string
  description: string
  image?: string
  url: string
}

function SocialPreview({ title, description, image, url }: SocialPreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      {image ? (
        <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
          <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={Image01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="p-2">
        <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        <p className="text-xs font-medium line-clamp-1">{title || "Page Title"}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-2">
          {description || "Page description will appear here..."}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SEOPanel({ seo, onChange, storeName }: SEOPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "social"])

  const handleChange = useCallback(<K extends keyof PageSEO>(key: K, value: PageSEO[K]) => {
    onChange({ ...seo, [key]: value })
  }, [seo, onChange])

  const storeUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/store/${storeName.toLowerCase().replace(/\s+/g, "-")}`
    : ""

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b">
        <HugeiconsIcon icon={SeoIcon} className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">SEO Settings</span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="px-3 py-2"
        >
          {/* Basic SEO */}
          <AccordionItem value="basic" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              Basic SEO
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Page Title</Label>
                  <CharCount current={seo.title?.length || 0} max={60} />
                </div>
                <Input
                  value={seo.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder={storeName}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Meta Description</Label>
                  <CharCount current={seo.description?.length || 0} max={160} />
                </div>
                <Textarea
                  value={seo.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your store..."
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Keywords</Label>
                <Input
                  value={seo.keywords?.join(", ") || ""}
                  onChange={(e) => handleChange("keywords", e.target.value.split(",").map(k => k.trim()))}
                  placeholder="keyword1, keyword2, keyword3"
                  className="h-8 text-xs"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Social Sharing */}
          <AccordionItem value="social" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Share01Icon} className="h-3.5 w-3.5" />
                Social Sharing
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <SocialPreview
                title={seo.ogTitle || seo.title || storeName}
                description={seo.ogDescription || seo.description || ""}
                image={seo.ogImage}
                url={storeUrl}
              />
              <div>
                <Label className="text-[10px] text-muted-foreground">OG Title</Label>
                <Input
                  value={seo.ogTitle || ""}
                  onChange={(e) => handleChange("ogTitle", e.target.value)}
                  placeholder={seo.title || "Same as page title"}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">OG Description</Label>
                <Textarea
                  value={seo.ogDescription || ""}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  placeholder={seo.description || "Same as meta description"}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">OG Image URL</Label>
                <Input
                  value={seo.ogImage || ""}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Twitter Card</Label>
                <Select
                  value={seo.twitterCard || "summary_large_image"}
                  onValueChange={(v) => handleChange("twitterCard", v as PageSEO["twitterCard"])}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="summary_large_image">Large Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced */}
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CodeIcon} className="h-3.5 w-3.5" />
                Advanced
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground">Canonical URL</Label>
                <Input
                  value={seo.canonicalUrl || ""}
                  onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                  placeholder={storeUrl}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">No Index</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Hide from search engines
                  </p>
                </div>
                <Switch
                  checked={seo.noIndex || false}
                  onCheckedChange={(v) => handleChange("noIndex", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">No Follow</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Don't follow links
                  </p>
                </div>
                <Switch
                  checked={seo.noFollow || false}
                  onCheckedChange={(v) => handleChange("noFollow", v)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}
