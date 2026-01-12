/**
 * SectionSettings - Layout settings for section-type blocks
 * 
 * Provides layout mode controls (stack, grid, flex) for blocks that
 * act as sections/containers. This bridges the current block-based
 * editor with the enhanced layout system.
 */

"use client"

import { memo, useCallback, useMemo } from "react"
import { cn } from "@/shared/utils"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlignVerticalJustifyCenter,
  Grid,
  PanelLeft,
  type LucideIcon,
} from "lucide-react"
import type { StoreBlock } from "@/types/blocks"

// Layout mode options
type LayoutMode = "stack" | "grid" | "flex"
type Alignment = "start" | "center" | "end" | "stretch" | "space-between"

const LAYOUT_MODES: {
  value: LayoutMode
  label: string
  icon: LucideIcon
  description: string
}[] = [
  {
    value: "stack",
    label: "Stack",
    icon: AlignVerticalJustifyCenter,
    description: "Vertical stacking",
  },
  {
    value: "grid",
    label: "Grid",
    icon: Grid,
    description: "Grid layout",
  },
  {
    value: "flex",
    label: "Flex",
    icon: PanelLeft,
    description: "Flexible layout",
  },
]

const ALIGNMENT_OPTIONS: { value: Alignment; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
  { value: "space-between", label: "Space Between" },
]

// Blocks that support section-level layout settings
const SECTION_BLOCKS = [
  "hero",
  "featured-collection",
  "product-grid",
  "collection-list",
  "multicolumn",
  "testimonials",
  "image-with-text",
  "rich-text",
  "newsletter",
  "custom-content",
]

interface SectionLayoutSettings {
  layoutMode?: LayoutMode
  gap?: number
  alignment?: Alignment
  columns?: number
  columnGap?: number
  rowGap?: number
  flexDirection?: "row" | "column"
  flexWrap?: boolean
}

interface SectionSettingsProps {
  block: StoreBlock
  onSettingsChange: (settings: Record<string, unknown>) => void
  className?: string
}

export const SectionSettings = memo(function SectionSettings({
  block,
  onSettingsChange,
  className,
}: SectionSettingsProps) {
  // Check if this block supports section settings
  const supportsLayout = useMemo(() => {
    return SECTION_BLOCKS.includes(block.type)
  }, [block.type])

  // Get current layout settings from block
  const layoutSettings = useMemo((): SectionLayoutSettings => {
    const settings = block.settings as Record<string, unknown>
    return {
      layoutMode: (settings.layoutMode as LayoutMode) || "stack",
      gap: (settings.gap as number) || 24,
      alignment: (settings.alignment as Alignment) || "stretch",
      columns: (settings.columns as number) || 3,
      columnGap: (settings.columnGap as number) || 24,
      rowGap: (settings.rowGap as number) || 24,
      flexDirection: (settings.flexDirection as "row" | "column") || "row",
      flexWrap: (settings.flexWrap as boolean) ?? true,
    }
  }, [block.settings])

  // Handle layout mode change
  const handleLayoutModeChange = useCallback(
    (mode: LayoutMode) => {
      onSettingsChange({ layoutMode: mode })
    },
    [onSettingsChange]
  )

  // Handle gap change
  const handleGapChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ gap: value[0] })
    },
    [onSettingsChange]
  )

  // Handle alignment change
  const handleAlignmentChange = useCallback(
    (value: Alignment) => {
      onSettingsChange({ alignment: value })
    },
    [onSettingsChange]
  )

  // Handle columns change
  const handleColumnsChange = useCallback(
    (value: string) => {
      onSettingsChange({ columns: parseInt(value, 10) })
    },
    [onSettingsChange]
  )

  // Handle column gap change
  const handleColumnGapChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ columnGap: value[0] })
    },
    [onSettingsChange]
  )

  // Handle row gap change
  const handleRowGapChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ rowGap: value[0] })
    },
    [onSettingsChange]
  )

  // Handle flex direction change
  const handleFlexDirectionChange = useCallback(
    (value: "row" | "column") => {
      onSettingsChange({ flexDirection: value })
    },
    [onSettingsChange]
  )

  // Handle flex wrap change
  const handleFlexWrapChange = useCallback(
    (value: string) => {
      onSettingsChange({ flexWrap: value === "wrap" })
    },
    [onSettingsChange]
  )

  if (!supportsLayout) {
    return null
  }

  return (
    <Accordion type="single" collapsible className={className}>
      <AccordionItem value="layout" className="border-none">
        <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
          <div className="flex items-center gap-2">
            <Grid className="h-3.5 w-3.5" />
            Section Layout
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-3 space-y-4">
          {/* Layout Mode Selector */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Layout Mode</Label>
            <div className="grid grid-cols-3 gap-1">
              {LAYOUT_MODES.map((mode) => {
                const ModeIcon = mode.icon
                return (
                  <Tooltip key={mode.value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleLayoutModeChange(mode.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded border transition-colors",
                          layoutSettings.layoutMode === mode.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-accent"
                        )}
                      >
                        <ModeIcon className="h-4 w-4" />
                        <span className="text-[10px] font-medium">{mode.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{mode.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          {/* Stack Mode Settings */}
          {layoutSettings.layoutMode === "stack" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Gap</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {layoutSettings.gap}px
                  </span>
                </div>
                <Slider
                  value={[layoutSettings.gap || 24]}
                  onValueChange={handleGapChange}
                  min={0}
                  max={80}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Alignment</Label>
                <Select
                  value={layoutSettings.alignment}
                  onValueChange={handleAlignmentChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGNMENT_OPTIONS.slice(0, 4).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Grid Mode Settings */}
          {layoutSettings.layoutMode === "grid" && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Columns</Label>
                <Select
                  value={String(layoutSettings.columns)}
                  onValueChange={handleColumnsChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "column" : "columns"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Column Gap</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {layoutSettings.columnGap}px
                  </span>
                </div>
                <Slider
                  value={[layoutSettings.columnGap || 24]}
                  onValueChange={handleColumnGapChange}
                  min={0}
                  max={64}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Row Gap</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {layoutSettings.rowGap}px
                  </span>
                </div>
                <Slider
                  value={[layoutSettings.rowGap || 24]}
                  onValueChange={handleRowGapChange}
                  min={0}
                  max={64}
                  step={4}
                />
              </div>
            </>
          )}

          {/* Flex Mode Settings */}
          {layoutSettings.layoutMode === "flex" && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <Select
                  value={layoutSettings.flexDirection}
                  onValueChange={handleFlexDirectionChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Row (horizontal)</SelectItem>
                    <SelectItem value="column">Column (vertical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Wrap</Label>
                <Select
                  value={layoutSettings.flexWrap ? "wrap" : "nowrap"}
                  onValueChange={handleFlexWrapChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wrap">Wrap</SelectItem>
                    <SelectItem value="nowrap">No Wrap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Gap</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {layoutSettings.gap}px
                  </span>
                </div>
                <Slider
                  value={[layoutSettings.gap || 24]}
                  onValueChange={handleGapChange}
                  min={0}
                  max={64}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Justify</Label>
                <Select
                  value={layoutSettings.alignment}
                  onValueChange={handleAlignmentChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGNMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
})

export default SectionSettings
