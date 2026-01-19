"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Search,
  MousePointer,
  Smartphone,
  Laptop,
  Tablet,
  Lock,
  Unlock,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AnimationPicker } from "./animation-picker"
import { SectionSettings } from "./section-settings"
import { BlockAISettings } from "@/features/editor/ai/components"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS } from "@/features/editor/block-constants"
import { getBlockFieldSchema } from "@/features/editor/fields"
import { MinimalAutoField } from "@/features/editor/fields/components/minimal-auto-field"
import type { FieldSchema } from "@/features/editor/fields/types"
import { cn } from "@/shared/utils"
import {
  useEditorStore,
  selectBlocks,
  selectSelectedBlock,
  selectSelectedBlockIds,
} from "@/features/editor/store"

// ============================================================================
// MULTI-SELECT STATE
// ============================================================================

interface MultiSelectStateProps {
  selectedBlocks: StoreBlock[]
  onDuplicate: () => void
  onRemove: () => void
  onClearSelection: () => void
}

function MultiSelectState({ selectedBlocks, onDuplicate, onRemove, onClearSelection }: MultiSelectStateProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{selectedBlocks.length} selected</span>
        </div>
        <button
          onClick={onClearSelection}
          className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="space-y-2 w-full max-w-[180px]">
          <button
            onClick={onDuplicate}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-sm text-xs bg-muted hover:bg-muted/80 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate All
          </button>
          <button
            onClick={onRemove}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-sm text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove All
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MousePointer className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium mb-1">No block selected</p>
        <p className="text-xs text-muted-foreground">
          Click a block to edit its settings
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// BLOCK SWITCHER
// ============================================================================

interface BlockSwitcherProps {
  currentBlock: StoreBlock
  blocks: StoreBlock[]
  onSelect: (id: string) => void
}

function BlockSwitcher({ currentBlock, blocks, onSelect }: BlockSwitcherProps) {
  const blockMeta = BLOCK_REGISTRY[currentBlock.type]
  const Icon = BLOCK_ICONS[currentBlock.type]
  const color = BLOCK_TEXT_COLORS[currentBlock.type]

  return (
    <Select value={currentBlock.id} onValueChange={onSelect}>
      <SelectTrigger size="sm" className="border-0 bg-transparent hover:bg-muted/50 focus:ring-0 gap-2 px-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("h-4 w-4 shrink-0", color)} />
          <span className="text-sm font-medium truncate">{blockMeta?.name}</span>
        </div>
      </SelectTrigger>
      <SelectContent align="start" className="w-[220px]">
        {blocks.map((block) => {
          const meta = BLOCK_REGISTRY[block.type]
          const BlockIcon = BLOCK_ICONS[block.type]
          const blockColor = BLOCK_TEXT_COLORS[block.type]
          return (
            <SelectItem key={block.id} value={block.id} className="py-2">
              <div className="flex items-center gap-2">
                <BlockIcon className={cn("h-4 w-4", blockColor)} />
                <span className={cn(!block.visible && "text-muted-foreground line-through")}>
                  {meta?.name}
                </span>
                {!block.visible && (
                  <EyeOff className="h-3 w-3 text-muted-foreground ml-auto" />
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// ============================================================================
// VARIANT PICKER
// ============================================================================

interface VariantPickerProps {
  block: StoreBlock
  onChangeVariant: (variant: string) => void
}

function VariantPicker({ block, onChangeVariant }: VariantPickerProps) {
  const blockMeta = BLOCK_REGISTRY[block.type]
  if (!blockMeta || blockMeta.variants.length <= 1) return null

  return (
    <div className="px-3 py-2 border-b">
      <Label className="text-xs font-medium mb-2 block">Layout</Label>
      <div className="grid grid-cols-2 gap-1">
        {blockMeta.variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onChangeVariant(variant.id)}
            className={cn(
              "px-2 py-1.5 rounded text-xs text-left transition-colors border",
              block.variant === variant.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50"
            )}
          >
            {variant.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// SETTINGS FIELDS
// ============================================================================

interface SettingsFieldsProps {
  settings: Record<string, unknown>
  schema: FieldSchema
  searchQuery: string
  onSettingChange: (key: string, value: unknown) => void
}

function SettingsFields({ settings, schema, searchQuery, onSettingChange }: SettingsFieldsProps) {
  // Filter fields by search
  const filteredFields = useMemo(() => {
    const entries = Object.entries(schema)
    if (!searchQuery) return entries
    
    const q = searchQuery.toLowerCase()
    return entries.filter(([key, config]) => {
      return (
        key.toLowerCase().includes(q) ||
        config.label?.toLowerCase().includes(q) ||
        config.description?.toLowerCase().includes(q)
      )
    })
  }, [schema, searchQuery])

  if (filteredFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-xs text-muted-foreground">
          {searchQuery ? `No settings match "${searchQuery}"` : "No settings available"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredFields.map(([key, config]) => (
        <MinimalAutoField
          key={key}
          config={config}
          value={settings[key]}
          onChange={(value) => onSettingChange(key, value)}
          allValues={settings}
        />
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface SettingsPanelProps {
  /** Store name for AI context (optional) */
  storeName?: string
  /** Product name for AI context (optional) */
  productName?: string
}

export function SettingsPanel({ storeName, productName }: SettingsPanelProps = {}) {
  // Read state from store
  const blocks = useEditorStore(selectBlocks)
  const block = useEditorStore(selectSelectedBlock)
  const selectedBlockIds = useEditorStore(selectSelectedBlockIds)
  
  // Derive selectedBlocks with useMemo to avoid infinite loop
  const selectedBlocks = useMemo(() => 
    blocks.filter(b => selectedBlockIds.includes(b.id)),
    [blocks, selectedBlockIds]
  )

  // Get actions from store
  const selectBlock = useEditorStore((s) => s.selectBlock)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const updateBlockSettings = useEditorStore((s) => s.updateBlockSettings)
  const changeBlockVariant = useEditorStore((s) => s.changeBlockVariant)
  const toggleBlockVisibility = useEditorStore((s) => s.toggleBlockVisibility)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)
  const duplicateSelectedBlocks = useEditorStore((s) => s.duplicateSelectedBlocks)
  const removeSelectedBlocks = useEditorStore((s) => s.removeSelectedBlocks)
  const toggleBlockLock = useEditorStore((s) => s.toggleBlockLock)
  const setBlockResponsiveVisibility = useEditorStore((s) => s.setBlockResponsiveVisibility)
  const setBlockCustomClass = useEditorStore((s) => s.setBlockCustomClass)

  // Local state
  const [localSettings, setLocalSettings] = useState<Record<string, unknown>>({})
  const [searchQuery, setSearchQuery] = useState("")

  // Get field schema
  const fieldSchema = useMemo(() => {
    if (!block) return {}
    return getBlockFieldSchema(block.type as BlockType)
  }, [block?.type])

  // Sync local settings with block
  useEffect(() => {
    if (block) {
      setLocalSettings({ ...block.settings })
      setSearchQuery("") // Reset search when block changes
    }
  }, [block?.id, block?.settings])

  // Handle setting change
  const handleSettingChange = useCallback((key: string, value: unknown) => {
    if (!block) return
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    updateBlockSettings(block.id, { [key]: value })
  }, [block, updateBlockSettings])

  // Handle variant change
  const handleChangeVariant = useCallback((variant: string) => {
    if (!block) return
    changeBlockVariant(block.id, variant)
  }, [block, changeBlockVariant])

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(() => {
    if (!block) return
    toggleBlockVisibility(block.id)
  }, [block, toggleBlockVisibility])

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    if (!block) return
    duplicateBlock(block.id)
  }, [block, duplicateBlock])

  // Handle remove
  const handleRemove = useCallback(() => {
    if (!block) return
    removeBlock(block.id)
  }, [block, removeBlock])

  // Handle close (deselect)
  const handleClose = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // Handle lock toggle
  const handleToggleLock = useCallback(() => {
    if (!block) return
    toggleBlockLock(block.id)
  }, [block, toggleBlockLock])

  // Handle responsive visibility change
  const handleResponsiveVisibilityChange = useCallback((viewport: 'mobile' | 'tablet' | 'desktop', visible: boolean) => {
    if (!block) return
    const current = block.responsiveVisibility || { mobile: true, tablet: true, desktop: true }
    setBlockResponsiveVisibility(block.id, { ...current, [viewport]: visible })
  }, [block, setBlockResponsiveVisibility])

  // Handle custom class change
  const handleCustomClassChange = useCallback((className: string) => {
    if (!block) return
    setBlockCustomClass(block.id, className)
  }, [block, setBlockCustomClass])

  // Multi-select state (more than 1 block selected)
  if (selectedBlockIds.length > 1) {
    return (
      <aside data-testid="settings-panel" className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
        <MultiSelectState
          selectedBlocks={selectedBlocks}
          onDuplicate={duplicateSelectedBlocks}
          onRemove={removeSelectedBlocks}
          onClearSelection={clearSelection}
        />
      </aside>
    )
  }

  // Empty state
  if (!block) {
    return (
      <aside data-testid="settings-panel" className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
        <EmptyState />
      </aside>
    )
  }

  const isProtected = block.type === "header" || block.type === "footer"
  const hasFields = Object.keys(fieldSchema).length > 0

  return (
    <aside data-testid="settings-panel" className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-1 py-1.5 border-b">
        <BlockSwitcher 
          currentBlock={block} 
          blocks={blocks} 
          onSelect={selectBlock} 
        />
        <div className="flex items-center gap-0.5 pr-1">
          {/* Visibility */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleVisibility}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-sm transition-colors",
                  "hover:bg-muted",
                  !block.visible && "text-muted-foreground"
                )}
              >
                {block.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{block.visible ? "Hide" : "Show"}</TooltipContent>
          </Tooltip>

          {/* Close */}
          <button
            onClick={handleClose}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Variant picker */}
      <VariantPicker block={block} onChangeVariant={handleChangeVariant} />

      {/* Section layout settings (for section-type blocks) */}
      <div className="px-3 py-2 border-b">
        <SectionSettings
          block={block}
          onSettingsChange={(settings) => {
            if (!block) return
            updateBlockSettings(block.id, settings)
          }}
        />
      </div>

      {/* Search (only if many fields) */}
      {hasFields && Object.keys(fieldSchema).length > 8 && (
        <div className="shrink-0 px-3 py-2 border-b">
          <div className="relative">
            <Search 
              className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" 
            />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Settings fields */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3">
          {hasFields ? (
            <SettingsFields
              settings={localSettings}
              schema={fieldSchema}
              searchQuery={searchQuery}
              onSettingChange={handleSettingChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-muted-foreground">
                No settings available for this block
              </p>
            </div>
          )}

          {/* AI Settings Section */}
          <div className="mt-3 pt-3 border-t border-[var(--ds-purple-200)]">
            <BlockAISettings
              blockType={block.type as BlockType}
              settings={localSettings}
              onSettingChange={handleSettingChange}
              storeName={storeName}
              productName={productName}
            />
          </div>

          {/* Advanced section - Collapsed by default */}
          <Accordion type="multiple" className="mt-4 pt-3 border-t">
            {/* Animation */}
            <AccordionItem value="animation" className="border-none">
              <AccordionTrigger className="py-1.5 text-xs font-medium hover:no-underline">
                Animation
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <AnimationPicker
                  animation={(block as any).animation}
                  onChange={(animation) => handleSettingChange("animation", animation)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Responsive visibility */}
            <AccordionItem value="visibility" className="border-none">
              <AccordionTrigger className="py-1.5 text-xs font-medium hover:no-underline">
                Responsive
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="flex gap-1">
                  {[
                    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                    { key: 'desktop' as const, icon: Laptop, label: 'Desktop' },
                  ].map(({ key, icon: IconComponent, label }) => {
                    const visibility = block.responsiveVisibility || { mobile: true, tablet: true, desktop: true }
                    const isVisible = visibility[key]
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleResponsiveVisibilityChange(key, !isVisible)}
                            className={cn(
                              "flex-1 h-7 flex items-center justify-center rounded border transition-colors",
                              isVisible
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <IconComponent className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{label}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Advanced options */}
            <AccordionItem value="advanced" className="border-none">
              <AccordionTrigger className="py-1.5 text-xs font-medium hover:no-underline">
                Advanced
              </AccordionTrigger>
              <AccordionContent className="pb-2 space-y-3">
                {/* Custom CSS class */}
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Custom CSS Class</Label>
                  <Input
                    placeholder="my-custom-class"
                    value={block.customClass || ''}
                    onChange={(e) => handleCustomClassChange(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>

                {/* Lock toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Lock Block</Label>
                  <button
                    onClick={handleToggleLock}
                    className={cn(
                      "h-7 w-7 flex items-center justify-center rounded border transition-colors",
                      block.locked
                        ? "border-[var(--ds-amber-700)] bg-[var(--ds-amber-700)]/10 text-[var(--ds-amber-700)]"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {block.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 border-t">
        {!isProtected && (
          <>
            <button
              onClick={handleDuplicate}
              className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded-sm text-xs hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </button>

            <div className="w-px h-4 bg-border" />

            <button
              onClick={handleRemove}
              className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded-sm text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
