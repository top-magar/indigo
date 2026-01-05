"use client"

import { useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PaintBrushIcon,
  TextFontIcon,
  ColorsIcon,
  LayoutLeftIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  useGlobalStylesStore,
  selectGlobalStyles,
  selectActivePreset,
  selectIsDirty,
} from "@/lib/editor/global-styles/store"
import { themePresets, getPresetNames } from "@/lib/editor/global-styles/presets"
import type { ThemePreset, GlobalStyles } from "@/lib/editor/global-styles/types"

// Convert presets to array format for UI
const THEME_PRESETS = getPresetNames().map((id) => ({
  id,
  name: themePresets[id].name,
  description: getPresetDescription(id),
  styles: themePresets[id],
}))

function getPresetDescription(preset: ThemePreset): string {
  const descriptions: Record<ThemePreset, string> = {
    minimal: "Clean, modern aesthetic",
    bold: "Strong, impactful design",
    elegant: "Sophisticated, refined",
    playful: "Fun, energetic design",
    corporate: "Professional, trustworthy",
  }
  return descriptions[preset]
}

// ============================================================================
// COLOR PICKER
// ============================================================================

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded border cursor-pointer shrink-0"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement("input")
          input.type = "color"
          input.value = value
          input.onchange = (e) => onChange((e.target as HTMLInputElement).value)
          input.click()
        }}
      />
      <div className="flex-1 min-w-0">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 text-xs font-mono"
        />
      </div>
    </div>
  )
}

// ============================================================================
// PRESET SELECTOR
// ============================================================================

interface PresetSelectorProps {
  activePreset: ThemePreset | "custom"
  onSelect: (preset: ThemePreset) => void
}

function PresetSelector({ activePreset, onSelect }: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {THEME_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id as ThemePreset)}
          className={cn(
            "relative p-3 rounded-lg border text-left transition-all",
            "hover:border-primary/50 hover:bg-muted/50",
            activePreset === preset.id
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          {/* Color preview */}
          <div className="flex gap-1 mb-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: preset.styles.colors.primary }}
            />
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: preset.styles.colors.secondary }}
            />
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: preset.styles.colors.accent }}
            />
          </div>
          <p className="text-xs font-medium">{preset.name}</p>
          <p className="text-[10px] text-muted-foreground line-clamp-1">
            {preset.description}
          </p>
          {activePreset === preset.id && (
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="absolute top-2 right-2 h-4 w-4 text-primary"
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GlobalStylesPanel() {
  const styles = useGlobalStylesStore(selectGlobalStyles)
  const activePreset = useGlobalStylesStore(selectActivePreset)
  const isDirty = useGlobalStylesStore(selectIsDirty)
  
  const updateColors = useGlobalStylesStore((s) => s.updateColors)
  const updateTypography = useGlobalStylesStore((s) => s.updateTypography)
  const updateBorderRadius = useGlobalStylesStore((s) => s.updateBorderRadius)
  const applyPreset = useGlobalStylesStore((s) => s.applyPreset)
  const resetToDefault = useGlobalStylesStore((s) => s.resetToDefault)

  const [expandedSections, setExpandedSections] = useState<string[]>(["presets", "colors"])

  const handleColorChange = useCallback((key: keyof typeof styles.colors, value: string) => {
    updateColors({ [key]: value })
  }, [updateColors])

  const handleFontChange = useCallback((key: keyof typeof styles.typography.fontFamily, value: string) => {
    updateTypography({
      fontFamily: { ...styles.typography.fontFamily, [key]: value }
    })
  }, [updateTypography, styles.typography.fontFamily])

  const handleRadiusChange = useCallback((key: keyof typeof styles.borderRadius, value: string) => {
    updateBorderRadius({ [key]: value })
  }, [updateBorderRadius])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Global Styles</span>
          {isDirty && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={resetToDefault}
            >
              <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to default</TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="px-3 py-2"
        >
          {/* Presets */}
          <AccordionItem value="presets" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={LayoutLeftIcon} className="h-3.5 w-3.5" />
                Theme Presets
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <PresetSelector activePreset={activePreset} onSelect={applyPreset} />
            </AccordionContent>
          </AccordionItem>

          {/* Colors */}
          <AccordionItem value="colors" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ColorsIcon} className="h-3.5 w-3.5" />
                Colors
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <ColorInput
                label="Primary"
                value={styles.colors.primary}
                onChange={(v) => handleColorChange("primary", v)}
              />
              <ColorInput
                label="Secondary"
                value={styles.colors.secondary}
                onChange={(v) => handleColorChange("secondary", v)}
              />
              <ColorInput
                label="Accent"
                value={styles.colors.accent}
                onChange={(v) => handleColorChange("accent", v)}
              />
              <ColorInput
                label="Background"
                value={styles.colors.background}
                onChange={(v) => handleColorChange("background", v)}
              />
              <ColorInput
                label="Foreground"
                value={styles.colors.foreground}
                onChange={(v) => handleColorChange("foreground", v)}
              />
              <ColorInput
                label="Muted"
                value={styles.colors.muted}
                onChange={(v) => handleColorChange("muted", v)}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Typography */}
          <AccordionItem value="typography" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={TextFontIcon} className="h-3.5 w-3.5" />
                Typography
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground">Heading Font</Label>
                <Select
                  value={styles.typography.fontFamily.heading}
                  onValueChange={(v) => handleFontChange("heading", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Body Font</Label>
                <Select
                  value={styles.typography.fontFamily.body}
                  onValueChange={(v) => handleFontChange("body", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Border Radius */}
          <AccordionItem value="radius" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                Border Radius
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <div key={size}>
                    <Label className="text-[10px] text-muted-foreground uppercase">{size}</Label>
                    <Input
                      value={styles.borderRadius[size]}
                      onChange={(e) => handleRadiusChange(size, e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Changes apply to all blocks in your store
        </p>
      </div>
    </div>
  )
}
