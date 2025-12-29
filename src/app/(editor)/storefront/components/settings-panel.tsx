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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Copy01Icon,
  Delete02Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
  MouseLeftClick01Icon,
  AiPhone01Icon,
  LaptopIcon,
  TabletConnectedWifiIcon,
  LockIcon,
  SquareUnlock02Icon,
} from "@hugeicons/core-free-icons"
import type { StoreBlock, BlockType, ResponsiveVisibility } from "@/types/blocks"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS } from "@/lib/editor/block-constants"
import { getBlockFieldSchema } from "@/lib/editor/fields"
import { AutoField } from "@/lib/editor/fields/components/auto-field"
import type { FieldSchema } from "@/lib/editor/fields/types"
import { cn } from "@/lib/utils"
import {
  useEditorStore,
  selectBlocks,
  selectSelectedBlock,
  selectSelectedBlockIds,
} from "@/lib/editor/store"

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
  const blockTypes = [...new Set(selectedBlocks.map(b => b.type))]
  
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-violet-500/10 flex items-center justify-center">
            <span className="text-sm font-bold text-violet-500">{selectedBlocks.length}</span>
          </div>
          <div>
            <p className="text-sm font-medium">Blocks selected</p>
            <p className="text-[10px] text-muted-foreground">
              {blockTypes.length === 1 
                ? `All ${BLOCK_REGISTRY[blockTypes[0] as BlockType]?.name || blockTypes[0]}`
                : `${blockTypes.length} types`
              }
            </p>
          </div>
        </div>
        <button
          onClick={onClearSelection}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-muted-foreground mb-4">
          Select a single block to edit its settings, or use bulk actions below.
        </p>
        
        <div className="space-y-2 w-full max-w-[180px]">
          <button
            onClick={onDuplicate}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-md text-xs bg-muted hover:bg-muted/80 transition-colors"
          >
            <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
            Duplicate All
          </button>
          <button
            onClick={onRemove}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-md text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
            Remove All
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="shrink-0 p-3 border-t bg-muted/30">
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Clear selection</span>
            <kbd className="px-1 rounded bg-muted">Esc</kbd>
          </div>
          <div className="flex justify-between">
            <span>Duplicate</span>
            <kbd className="px-1 rounded bg-muted">⌘D</kbd>
          </div>
          <div className="flex justify-between">
            <span>Delete</span>
            <kbd className="px-1 rounded bg-muted">⌫</kbd>
          </div>
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
          <HugeiconsIcon icon={MouseLeftClick01Icon} className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium mb-1">No block selected</p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Click a block in the preview or layers panel to edit its settings
        </p>
      </div>
      
      {/* Keyboard hints */}
      <div className="shrink-0 p-3 border-t bg-muted/30">
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Command palette</span>
            <kbd className="px-1 rounded bg-muted">⌘K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Save</span>
            <kbd className="px-1 rounded bg-muted">⌘S</kbd>
          </div>
          <div className="flex justify-between">
            <span>Undo / Redo</span>
            <kbd className="px-1 rounded bg-muted">⌘Z</kbd>
          </div>
        </div>
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
      <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-muted/50 focus:ring-0 gap-2 px-2">
        <div className="flex items-center gap-2 min-w-0">
          <HugeiconsIcon icon={Icon} className={cn("h-4 w-4 shrink-0", color)} />
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
                <HugeiconsIcon icon={BlockIcon} className={cn("h-4 w-4", blockColor)} />
                <span className={cn(!block.visible && "text-muted-foreground line-through")}>
                  {meta?.name}
                </span>
                {!block.visible && (
                  <HugeiconsIcon icon={ViewOffSlashIcon} className="h-3 w-3 text-muted-foreground ml-auto" />
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
      <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
        Layout
      </Label>
      <div className="grid grid-cols-2 gap-1.5">
        {blockMeta.variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onChangeVariant(variant.id)}
            className={cn(
              "relative px-2.5 py-1.5 rounded-md text-xs text-left transition-colors",
              "border hover:border-primary/50",
              block.variant === variant.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50"
            )}
          >
            <span className="truncate block">{variant.name}</span>
            {block.variant === variant.id && (
              <HugeiconsIcon 
                icon={CheckmarkCircle02Icon} 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3" 
              />
            )}
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
    <div className="space-y-4">
      {filteredFields.map(([key, config]) => (
        <AutoField
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

export function SettingsPanel() {
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
      <aside className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
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
      <aside className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
        <EmptyState />
      </aside>
    )
  }

  const isProtected = block.type === "header" || block.type === "footer"
  const hasFields = Object.keys(fieldSchema).length > 0

  return (
    <aside className="border-l bg-background flex flex-col h-full overflow-hidden w-[280px]">
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
                  "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                  "hover:bg-muted",
                  !block.visible && "text-muted-foreground"
                )}
              >
                <HugeiconsIcon 
                  icon={block.visible ? ViewIcon : ViewOffSlashIcon} 
                  className="h-4 w-4" 
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{block.visible ? "Hide" : "Show"}</TooltipContent>
          </Tooltip>

          {/* Close */}
          <button
            onClick={handleClose}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Variant picker */}
      <VariantPicker block={block} onChangeVariant={handleChangeVariant} />

      {/* Search (only if many fields) */}
      {hasFields && Object.keys(fieldSchema).length > 4 && (
        <div className="shrink-0 px-3 py-2 border-b">
          <div className="relative">
            <HugeiconsIcon 
              icon={Search01Icon} 
              className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" 
            />
            <Input
              placeholder="Search settings..."
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

          {/* Advanced section - Responsive visibility & Custom class */}
          <div className="mt-6 pt-4 border-t">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
              Advanced
            </Label>

            {/* Responsive visibility */}
            <div className="mb-4">
              <Label className="text-xs font-medium mb-2 block">Show on</Label>
              <div className="flex gap-1">
                {[
                  { key: 'mobile' as const, icon: AiPhone01Icon, label: 'Mobile' },
                  { key: 'tablet' as const, icon: TabletConnectedWifiIcon, label: 'Tablet' },
                  { key: 'desktop' as const, icon: LaptopIcon, label: 'Desktop' },
                ].map(({ key, icon, label }) => {
                  const visibility = block.responsiveVisibility || { mobile: true, tablet: true, desktop: true }
                  const isVisible = visibility[key]
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleResponsiveVisibilityChange(key, !isVisible)}
                          className={cn(
                            "flex-1 h-8 flex items-center justify-center rounded-md border transition-colors",
                            isVisible
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <HugeiconsIcon icon={icon} className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{label}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* Custom CSS class */}
            <div className="mb-4">
              <Label className="text-xs font-medium mb-2 block">Custom CSS Class</Label>
              <Input
                placeholder="e.g. my-custom-class"
                value={block.customClass || ''}
                onChange={(e) => handleCustomClassChange(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Add custom classes for advanced styling
              </p>
            </div>

            {/* Lock toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium block">Lock Block</Label>
                <p className="text-[10px] text-muted-foreground">
                  Prevent editing and moving
                </p>
              </div>
              <button
                onClick={handleToggleLock}
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-md border transition-colors",
                  block.locked
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <HugeiconsIcon icon={block.locked ? LockIcon : SquareUnlock02Icon} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 border-t bg-muted/30">
        {!isProtected && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDuplicate}
                  className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                  <span>Duplicate</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Duplicate block</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRemove}
                  className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded-md text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Remove block</TooltipContent>
            </Tooltip>
          </>
        )}

        {isProtected && (
          <p className="flex-1 text-[10px] text-muted-foreground text-center">
            {block.type === "header" ? "Header" : "Footer"} cannot be removed
          </p>
        )}
      </div>
    </aside>
  )
}
