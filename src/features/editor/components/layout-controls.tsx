/**
 * LayoutControls - Controls for section layout configuration
 * Allows switching between layout modes and configuring layout-specific settings
 */

"use client"

import { memo, useCallback } from "react"
import { cn } from "@/shared/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlignVerticalCenterIcon,
  GridIcon,
  LayoutLeftIcon,
  Move01Icon,
} from "@hugeicons/core-free-icons"
import type { EnhancedSection, LayoutMode, Alignment } from "@/features/editor/layout"
import { useLayoutStore } from "@/features/editor/layout"


// Layout mode options with icons and descriptions
const LAYOUT_MODES: {
  value: LayoutMode
  label: string
  icon: typeof GridIcon
  description: string
}[] = [
  {
    value: "stack",
    label: "Stack",
    icon: AlignVerticalCenterIcon,
    description: "Vertical stacking (like Shopify)",
  },
  {
    value: "grid",
    label: "Grid",
    icon: GridIcon,
    description: "CSS Grid layout",
  },
  {
    value: "flex",
    label: "Flex",
    icon: LayoutLeftIcon,
    description: "Flexible row/column layout",
  },
  {
    value: "absolute",
    label: "Freeform",
    icon: Move01Icon,
    description: "Absolute positioning (like Wix)",
  },
]

const ALIGNMENT_OPTIONS: { value: Alignment; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
  { value: "space-between", label: "Space Between" },
  { value: "space-around", label: "Space Around" },
]

interface LayoutControlsProps {
  section: EnhancedSection
  className?: string
}

export const LayoutControls = memo(function LayoutControls({
  section,
  className,
}: LayoutControlsProps) {
  const { updateSection } = useLayoutStore()

  // Handle layout mode change
  const handleLayoutModeChange = useCallback(
    (mode: LayoutMode) => {
      const updates: Partial<EnhancedSection["layout"]> = { mode }

      // Set default settings for each mode
      switch (mode) {
        case "stack":
          updates.gap = section.layout.gap ?? 24
          updates.alignment = section.layout.alignment ?? "stretch"
          break
        case "grid":
          updates.grid = section.layout.grid ?? {
            columns: 3,
            columnGap: 24,
            rowGap: 24,
          }
          break
        case "flex":
          updates.flex = section.layout.flex ?? {
            direction: "row",
            wrap: true,
            justifyContent: "start",
            alignItems: "stretch",
            gap: 24,
          }
          break
        case "absolute":
          updates.absolute = section.layout.absolute ?? {
            width: 1200,
            height: 600,
            snapToGrid: true,
            gridSize: 8,
          }
          break
      }

      updateSection(section.id, { layout: { ...section.layout, ...updates } })
    },
    [section, updateSection]
  )

  // Handle gap change
  const handleGapChange = useCallback(
    (value: number[]) => {
      updateSection(section.id, {
        layout: { ...section.layout, gap: value[0] },
      })
    },
    [section, updateSection]
  )

  // Handle alignment change
  const handleAlignmentChange = useCallback(
    (value: Alignment) => {
      updateSection(section.id, {
        layout: { ...section.layout, alignment: value },
      })
    },
    [section, updateSection]
  )

  // Handle grid columns change
  const handleGridColumnsChange = useCallback(
    (value: string) => {
      const columns = parseInt(value, 10)
      if (isNaN(columns)) return
      updateSection(section.id, {
        layout: {
          ...section.layout,
          grid: { ...section.layout.grid!, columns },
        },
      })
    },
    [section, updateSection]
  )

  // Handle grid gap change
  const handleGridGapChange = useCallback(
    (value: number[], type: "column" | "row") => {
      const key = type === "column" ? "columnGap" : "rowGap"
      updateSection(section.id, {
        layout: {
          ...section.layout,
          grid: { ...section.layout.grid!, [key]: value[0] },
        },
      })
    },
    [section, updateSection]
  )

  // Handle flex direction change
  const handleFlexDirectionChange = useCallback(
    (value: "row" | "column") => {
      updateSection(section.id, {
        layout: {
          ...section.layout,
          flex: { ...section.layout.flex!, direction: value },
        },
      })
    },
    [section, updateSection]
  )

  // Handle flex wrap change
  const handleFlexWrapChange = useCallback(
    (checked: boolean) => {
      updateSection(section.id, {
        layout: {
          ...section.layout,
          flex: { ...section.layout.flex!, wrap: checked },
        },
      })
    },
    [section, updateSection]
  )

  // Handle absolute canvas size change
  const handleCanvasSizeChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num)) return
      updateSection(section.id, {
        layout: {
          ...section.layout,
          absolute: { ...section.layout.absolute!, [dimension]: num },
        },
      })
    },
    [section, updateSection]
  )

  // Handle snap to grid toggle
  const handleSnapToGridChange = useCallback(
    (checked: boolean) => {
      updateSection(section.id, {
        layout: {
          ...section.layout,
          absolute: { ...section.layout.absolute!, snapToGrid: checked },
        },
      })
    },
    [section, updateSection]
  )

  // Handle grid size change
  const handleGridSizeChange = useCallback(
    (value: number[]) => {
      updateSection(section.id, {
        layout: {
          ...section.layout,
          absolute: { ...section.layout.absolute!, gridSize: value[0] },
        },
      })
    },
    [section, updateSection]
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Layout Mode Selector */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Layout Mode
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUT_MODES.map((mode) => (
            <Tooltip key={mode.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleLayoutModeChange(mode.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors",
                    section.layout.mode === mode.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <HugeiconsIcon icon={mode.icon} className="h-5 w-5" />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{mode.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Stack Mode Settings */}
      {section.layout.mode === "stack" && (
        <StackLayoutSettings
          gap={section.layout.gap ?? 24}
          alignment={section.layout.alignment ?? "stretch"}
          onGapChange={handleGapChange}
          onAlignmentChange={handleAlignmentChange}
        />
      )}

      {/* Grid Mode Settings */}
      {section.layout.mode === "grid" && section.layout.grid && (
        <GridLayoutSettings
          columns={section.layout.grid.columns as number}
          columnGap={section.layout.grid.columnGap}
          rowGap={section.layout.grid.rowGap}
          onColumnsChange={handleGridColumnsChange}
          onColumnGapChange={(v) => handleGridGapChange(v, "column")}
          onRowGapChange={(v) => handleGridGapChange(v, "row")}
        />
      )}

      {/* Flex Mode Settings */}
      {section.layout.mode === "flex" && section.layout.flex && (
        <FlexLayoutSettings
          direction={section.layout.flex.direction}
          wrap={section.layout.flex.wrap}
          justifyContent={section.layout.flex.justifyContent}
          alignItems={section.layout.flex.alignItems}
          gap={section.layout.flex.gap}
          onDirectionChange={handleFlexDirectionChange}
          onWrapChange={handleFlexWrapChange}
          onJustifyChange={(v) =>
            updateSection(section.id, {
              layout: {
                ...section.layout,
                flex: { ...section.layout.flex!, justifyContent: v },
              },
            })
          }
          onAlignChange={(v) =>
            updateSection(section.id, {
              layout: {
                ...section.layout,
                flex: { ...section.layout.flex!, alignItems: v },
              },
            })
          }
          onGapChange={(v) =>
            updateSection(section.id, {
              layout: {
                ...section.layout,
                flex: { ...section.layout.flex!, gap: v[0] },
              },
            })
          }
        />
      )}

      {/* Absolute Mode Settings */}
      {section.layout.mode === "absolute" && section.layout.absolute && (
        <AbsoluteLayoutSettings
          width={section.layout.absolute.width}
          height={section.layout.absolute.height}
          snapToGrid={section.layout.absolute.snapToGrid}
          gridSize={section.layout.absolute.gridSize}
          onWidthChange={(v) => handleCanvasSizeChange("width", v)}
          onHeightChange={(v) => handleCanvasSizeChange("height", v)}
          onSnapToGridChange={handleSnapToGridChange}
          onGridSizeChange={handleGridSizeChange}
        />
      )}
    </div>
  )
})


// =============================================================================
// STACK LAYOUT SETTINGS
// =============================================================================

interface StackLayoutSettingsProps {
  gap: number
  alignment: Alignment
  onGapChange: (value: number[]) => void
  onAlignmentChange: (value: Alignment) => void
}

const StackLayoutSettings = memo(function StackLayoutSettings({
  gap,
  alignment,
  onGapChange,
  onAlignmentChange,
}: StackLayoutSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Gap</Label>
          <span className="text-xs text-muted-foreground">{gap}px</span>
        </div>
        <Slider
          value={[gap]}
          onValueChange={onGapChange}
          min={0}
          max={100}
          step={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Alignment</Label>
        <Select value={alignment} onValueChange={onAlignmentChange}>
          <SelectTrigger>
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
    </div>
  )
})

// =============================================================================
// GRID LAYOUT SETTINGS
// =============================================================================

interface GridLayoutSettingsProps {
  columns: number
  columnGap: number
  rowGap: number
  onColumnsChange: (value: string) => void
  onColumnGapChange: (value: number[]) => void
  onRowGapChange: (value: number[]) => void
}

const GridLayoutSettings = memo(function GridLayoutSettings({
  columns,
  columnGap,
  rowGap,
  onColumnsChange,
  onColumnGapChange,
  onRowGapChange,
}: GridLayoutSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Columns</Label>
        <Select value={String(columns)} onValueChange={onColumnsChange}>
          <SelectTrigger>
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
          <Label className="text-sm">Column Gap</Label>
          <span className="text-xs text-muted-foreground">{columnGap}px</span>
        </div>
        <Slider
          value={[columnGap]}
          onValueChange={onColumnGapChange}
          min={0}
          max={64}
          step={4}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Row Gap</Label>
          <span className="text-xs text-muted-foreground">{rowGap}px</span>
        </div>
        <Slider
          value={[rowGap]}
          onValueChange={onRowGapChange}
          min={0}
          max={64}
          step={4}
        />
      </div>
    </div>
  )
})

// =============================================================================
// FLEX LAYOUT SETTINGS
// =============================================================================

interface FlexLayoutSettingsProps {
  direction: "row" | "column"
  wrap: boolean
  justifyContent: Alignment
  alignItems: Alignment
  gap: number
  onDirectionChange: (value: "row" | "column") => void
  onWrapChange: (checked: boolean) => void
  onJustifyChange: (value: Alignment) => void
  onAlignChange: (value: Alignment) => void
  onGapChange: (value: number[]) => void
}

const FlexLayoutSettings = memo(function FlexLayoutSettings({
  direction,
  wrap,
  justifyContent,
  alignItems,
  gap,
  onDirectionChange,
  onWrapChange,
  onJustifyChange,
  onAlignChange,
  onGapChange,
}: FlexLayoutSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Direction</Label>
        <Select value={direction} onValueChange={onDirectionChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">Row (horizontal)</SelectItem>
            <SelectItem value="column">Column (vertical)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm">Wrap</Label>
        <Switch checked={wrap} onCheckedChange={onWrapChange} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Justify Content</Label>
        <Select value={justifyContent} onValueChange={onJustifyChange}>
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label className="text-sm">Align Items</Label>
        <Select value={alignItems} onValueChange={onAlignChange}>
          <SelectTrigger>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Gap</Label>
          <span className="text-xs text-muted-foreground">{gap}px</span>
        </div>
        <Slider
          value={[gap]}
          onValueChange={onGapChange}
          min={0}
          max={64}
          step={4}
        />
      </div>
    </div>
  )
})

// =============================================================================
// ABSOLUTE LAYOUT SETTINGS
// =============================================================================

interface AbsoluteLayoutSettingsProps {
  width: number
  height: number
  snapToGrid: boolean
  gridSize: number
  onWidthChange: (value: string) => void
  onHeightChange: (value: string) => void
  onSnapToGridChange: (checked: boolean) => void
  onGridSizeChange: (value: number[]) => void
}

const AbsoluteLayoutSettings = memo(function AbsoluteLayoutSettings({
  width,
  height,
  snapToGrid,
  gridSize,
  onWidthChange,
  onHeightChange,
  onSnapToGridChange,
  onGridSizeChange,
}: AbsoluteLayoutSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Canvas Width</Label>
          <Input
            type="number"
            value={width}
            onChange={(e) => onWidthChange(e.target.value)}
            min={200}
            max={2000}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Canvas Height</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            min={100}
            max={2000}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm">Snap to Grid</Label>
        <Switch checked={snapToGrid} onCheckedChange={onSnapToGridChange} />
      </div>

      {snapToGrid && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Grid Size</Label>
            <span className="text-xs text-muted-foreground">{gridSize}px</span>
          </div>
          <Slider
            value={[gridSize]}
            onValueChange={onGridSizeChange}
            min={4}
            max={32}
            step={4}
          />
        </div>
      )}
    </div>
  )
})

export default LayoutControls
