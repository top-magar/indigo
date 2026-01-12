/**
 * SectionPalette - Section picker for adding new sections
 * Similar to Shopify's "Add section" panel
 */

"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { cn } from "@/shared/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Image,
  Type,
  Grid,
  PanelLeft,
  Star,
  Mail,
  Quote,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { getAllSectionPresets, getSectionSchema } from "@/features/editor/layout"
import type { SectionPreset, EnhancedSection, LayoutMode } from "@/features/editor/layout"

// Section category icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Hero: Image,
  Text: Type,
  Collection: ShoppingBag,
  Image: Image,
  "Social proof": Quote,
  Newsletter: Mail,
  Custom: Grid,
}

// Section type icons
const SECTION_TYPE_ICONS: Record<string, LucideIcon> = {
  hero: Image,
  "featured-collection": ShoppingBag,
  "rich-text": Type,
  "image-with-text": PanelLeft,
  multicolumn: Grid,
  testimonials: Quote,
  newsletter: Mail,
  "custom-content": Star,
}

interface SectionPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSection: (section: EnhancedSection) => void
  insertIndex?: number // Where to insert the new section
}

export const SectionPalette = memo(function SectionPalette({
  open,
  onOpenChange,
  onAddSection,
  insertIndex,
}: SectionPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get all presets with section type info
  const allPresets = useMemo(() => getAllSectionPresets(), [])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    allPresets.forEach((preset) => {
      if (preset.category) cats.add(preset.category)
    })
    return ["all", ...Array.from(cats)]
  }, [allPresets])

  // Filter presets by search and category
  const filteredPresets = useMemo(() => {
    return allPresets.filter((preset) => {
      const matchesSearch =
        searchQuery === "" ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.sectionType.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || preset.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [allPresets, searchQuery, selectedCategory])

  // Group presets by category for display
  const groupedPresets = useMemo(() => {
    const groups: Record<string, typeof filteredPresets> = {}
    filteredPresets.forEach((preset) => {
      const cat = preset.category || "Other"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(preset)
    })
    return groups
  }, [filteredPresets])

  // Handle preset selection
  const handleSelectPreset = useCallback(
    (preset: SectionPreset & { sectionType: string }) => {
      const schema = getSectionSchema(preset.sectionType)
      if (!schema) return

      // Create new section from preset
      const newSection: EnhancedSection = {
        id: `section-${Date.now()}`,
        type: "section",
        name: preset.name,
        layout: {
          mode: (preset.settings.layout_mode as LayoutMode) || "stack",
          gap: 24,
          alignment: "stretch",
        },
        style: {
          padding: { top: 40, right: 24, bottom: 40, left: 24, unit: "px" },
          margin: { top: 0, right: 0, bottom: 0, left: 0, unit: "px" },
          maxWidth: "contained",
          backgroundColor: preset.settings.background_color as string,
        },
        settings: preset.settings,
        elements: preset.blocks.map((block, index) => ({
          id: `element-${Date.now()}-${index}`,
          type: block.type,
          position: { order: index },
          settings: block.settings,
          visible: true,
        })),
        order: insertIndex ?? 0,
        visible: true,
      }

      onAddSection(newSection)
      onOpenChange(false)
      setSearchQuery("")
    },
    [onAddSection, onOpenChange, insertIndex]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[380px] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Add Section</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="flex-1"
        >
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="px-3 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                >
                  {cat === "all" ? "All" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={selectedCategory} className="mt-0 flex-1">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-6">
                {Object.entries(groupedPresets).map(([category, presets]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      {(() => {
                        const CategoryIcon = CATEGORY_ICONS[category] || Grid
                        return <CategoryIcon className="h-4 w-4" />
                      })()}
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {presets.map((preset) => (
                        <SectionPresetCard
                          key={`${preset.sectionType}-${preset.name}`}
                          preset={preset}
                          onClick={() => handleSelectPreset(preset)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {filteredPresets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No sections found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
})


// =============================================================================
// SECTION PRESET CARD
// =============================================================================

interface SectionPresetCardProps {
  preset: SectionPreset & { sectionType: string }
  onClick: () => void
}

const SectionPresetCard = memo(function SectionPresetCard({
  preset,
  onClick,
}: SectionPresetCardProps) {
  const Icon = SECTION_TYPE_ICONS[preset.sectionType] || Grid

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center p-4 rounded-xl border bg-card",
        "hover:border-primary hover:bg-accent/50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      {/* Preview thumbnail placeholder */}
      <div className="w-full aspect-video rounded bg-muted/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-center line-clamp-2">
        {preset.name}
      </span>
    </button>
  )
})

export default SectionPalette
