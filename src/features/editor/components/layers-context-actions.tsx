"use client"

import { useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Layers,
  PanelTop,
  PanelBottom,
  Plus,
  Lightbulb,
  Grid3x3,
  Menu,
  Maximize2,
  Minimize2,
  AlignVerticalJustifyCenter,
  AlignVerticalDistributeCenter,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { isContainerBlock } from "@/types/blocks"
import { BLOCK_ICONS } from "@/features/editor/block-constants"

// =============================================================================
// TYPES
// =============================================================================

export type ContextAction =
  | { type: "edit" }
  | { type: "duplicate" }
  | { type: "delete" }
  | { type: "move"; direction: "up" | "down" }
  | { type: "group" }
  | { type: "ungroup" }
  | { type: "align"; alignment: "top" | "center" | "bottom" }
  | { type: "distribute" }
  | { type: "add-block"; blockType: BlockType; position: "before" | "after" | "inside" }
  | { type: "collapse-all" }
  | { type: "expand-all" }
  | { type: "add-child" }

export interface SmartSuggestion {
  id: string
  message: string
  action: ContextAction
  icon: LucideIcon
}

export interface LayersContextActionsProps {
  selectedBlocks: StoreBlock[]
  allBlocks: StoreBlock[]
  onAction: (action: ContextAction) => void
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

interface KeyboardShortcut {
  action: ContextAction["type"]
  keys: string
  label: string
}

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { action: "delete", keys: "⌫", label: "Delete" },
  { action: "duplicate", keys: "⌘D", label: "Duplicate" },
  { action: "move", keys: "⌥↑", label: "Move up" },
  { action: "move", keys: "⌥↓", label: "Move down" },
  { action: "group", keys: "⌘G", label: "Group" },
  { action: "ungroup", keys: "⇧⌘G", label: "Ungroup" },
]

function getShortcutForAction(actionType: ContextAction["type"], direction?: "up" | "down"): string | undefined {
  if (actionType === "move") {
    return direction === "up" ? "⌥↑" : "⌥↓"
  }
  return KEYBOARD_SHORTCUTS.find(s => s.action === actionType)?.keys
}

// =============================================================================
// ACTION BUTTON COMPONENT
// =============================================================================

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  shortcut?: string
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

function ActionButton({ icon: Icon, label, shortcut, onClick, variant = "default", disabled }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            variant === "destructive" && "text-destructive hover:text-destructive hover:bg-destructive/10"
          )}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs flex items-center gap-1.5">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

// =============================================================================
// SMART SUGGESTIONS LOGIC
// =============================================================================

function generateSmartSuggestions(
  selectedBlocks: StoreBlock[],
  allBlocks: StoreBlock[]
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []

  // Empty page suggestion
  if (allBlocks.length === 0) {
    suggestions.push({
      id: "add-header",
      message: "Start with a header?",
      action: { type: "add-block", blockType: "header", position: "after" },
      icon: Menu,
    })
    return suggestions
  }

  // After adding hero suggestion
  const hasHero = allBlocks.some(b => b.type === "hero")
  const hasProductGrid = allBlocks.some(b => b.type === "product-grid")
  if (hasHero && !hasProductGrid && selectedBlocks.length === 1 && selectedBlocks[0].type === "hero") {
    suggestions.push({
      id: "add-product-grid",
      message: "Add a product grid below?",
      action: { type: "add-block", blockType: "product-grid", position: "after" },
      icon: Grid3x3,
    })
  }

  // Multiple similar blocks suggestion
  if (selectedBlocks.length >= 2) {
    const types = selectedBlocks.map(b => b.type)
    const allSameType = types.every(t => t === types[0])
    if (allSameType) {
      suggestions.push({
        id: "group-similar",
        message: "Group these together?",
        action: { type: "group" },
        icon: Layers,
      })
    }
  }

  // No header suggestion
  const hasHeader = allBlocks.some(b => b.type === "header")
  if (!hasHeader && allBlocks.length > 0 && selectedBlocks.length === 0) {
    suggestions.push({
      id: "add-header-top",
      message: "Add a header at the top?",
      action: { type: "add-block", blockType: "header", position: "before" },
      icon: PanelTop,
    })
  }

  // No footer suggestion
  const hasFooter = allBlocks.some(b => b.type === "footer")
  if (!hasFooter && allBlocks.length > 2 && selectedBlocks.length === 0) {
    suggestions.push({
      id: "add-footer",
      message: "Add a footer?",
      action: { type: "add-block", blockType: "footer", position: "after" },
      icon: PanelBottom,
    })
  }

  // Limit to 3 suggestions
  return suggestions.slice(0, 3)
}

// =============================================================================
// SUGGESTED BLOCK TYPES FOR EMPTY STATE
// =============================================================================

const SUGGESTED_BLOCKS: { type: BlockType; label: string }[] = [
  { type: "header", label: "Header" },
  { type: "hero", label: "Hero" },
  { type: "product-grid", label: "Products" },
  { type: "rich-text", label: "Text" },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LayersContextActions({
  selectedBlocks,
  allBlocks,
  onAction,
}: LayersContextActionsProps) {
  const selectionCount = selectedBlocks.length
  const isSingleSelection = selectionCount === 1
  const isMultiSelection = selectionCount > 1
  const hasSelection = selectionCount > 0
  const isContainerSelected = isSingleSelection && isContainerBlock(selectedBlocks[0])

  // Check if selected block can move
  const canMoveUp = useMemo(() => {
    if (!isSingleSelection) return false
    const block = selectedBlocks[0]
    const index = allBlocks.findIndex(b => b.id === block.id)
    return index > 0
  }, [selectedBlocks, allBlocks, isSingleSelection])

  const canMoveDown = useMemo(() => {
    if (!isSingleSelection) return false
    const block = selectedBlocks[0]
    const index = allBlocks.findIndex(b => b.id === block.id)
    return index < allBlocks.length - 1
  }, [selectedBlocks, allBlocks, isSingleSelection])

  // Check if blocks are grouped
  const areBlocksGrouped = useMemo(() => {
    if (!isMultiSelection) return false
    const groupIds = selectedBlocks.map(b => b.groupId).filter(Boolean)
    return groupIds.length > 0 && new Set(groupIds).size === 1
  }, [selectedBlocks, isMultiSelection])

  // Generate smart suggestions
  const suggestions = useMemo(
    () => generateSmartSuggestions(selectedBlocks, allBlocks),
    [selectedBlocks, allBlocks]
  )

  // Action handlers
  const handleEdit = useCallback(() => onAction({ type: "edit" }), [onAction])
  const handleDuplicate = useCallback(() => onAction({ type: "duplicate" }), [onAction])
  const handleDelete = useCallback(() => onAction({ type: "delete" }), [onAction])
  const handleMoveUp = useCallback(() => onAction({ type: "move", direction: "up" }), [onAction])
  const handleMoveDown = useCallback(() => onAction({ type: "move", direction: "down" }), [onAction])
  const handleGroup = useCallback(() => onAction({ type: "group" }), [onAction])
  const handleUngroup = useCallback(() => onAction({ type: "ungroup" }), [onAction])
  const handleCollapseAll = useCallback(() => onAction({ type: "collapse-all" }), [onAction])
  const handleExpandAll = useCallback(() => onAction({ type: "expand-all" }), [onAction])
  const handleAddChild = useCallback(() => onAction({ type: "add-child" }), [onAction])
  const handleAlign = useCallback((alignment: "top" | "center" | "bottom") => 
    onAction({ type: "align", alignment }), [onAction])
  const handleDistribute = useCallback(() => onAction({ type: "distribute" }), [onAction])
  const handleAddBlock = useCallback((blockType: BlockType) => 
    onAction({ type: "add-block", blockType, position: "after" }), [onAction])

  // Render single selection actions
  const renderSingleSelectionActions = () => (
    <>
      <ActionButton
        icon={Pencil}
        label="Edit"
        onClick={handleEdit}
      />
      <ActionButton
        icon={Copy}
        label="Duplicate"
        shortcut={getShortcutForAction("duplicate")}
        onClick={handleDuplicate}
      />
      <ActionButton
        icon={ChevronUp}
        label="Move up"
        shortcut={getShortcutForAction("move", "up")}
        onClick={handleMoveUp}
        disabled={!canMoveUp}
      />
      <ActionButton
        icon={ChevronDown}
        label="Move down"
        shortcut={getShortcutForAction("move", "down")}
        onClick={handleMoveDown}
        disabled={!canMoveDown}
      />
      <div className="w-px h-4 bg-border mx-0.5" />
      <ActionButton
        icon={Trash2}
        label="Delete"
        shortcut={getShortcutForAction("delete")}
        onClick={handleDelete}
        variant="destructive"
      />
    </>
  )

  // Render multi-selection actions
  const renderMultiSelectionActions = () => (
    <>
      {areBlocksGrouped ? (
        <ActionButton
          icon={Layers}
          label="Ungroup"
          shortcut={getShortcutForAction("ungroup")}
          onClick={handleUngroup}
        />
      ) : (
        <ActionButton
          icon={Layers}
          label="Group"
          shortcut={getShortcutForAction("group")}
          onClick={handleGroup}
        />
      )}
      
      {/* Alignment dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Align</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-32">
          <DropdownMenuItem onClick={() => handleAlign("top")}>
            <ChevronUp className="h-4 w-4 mr-2" />
            Align top
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAlign("center")}>
            <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" />
            Align center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAlign("bottom")}>
            <ChevronDown className="h-4 w-4 mr-2" />
            Align bottom
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDistribute}>
            <AlignVerticalDistributeCenter className="h-4 w-4 mr-2" />
            Distribute
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionButton
        icon={Copy}
        label="Duplicate all"
        onClick={handleDuplicate}
      />
      <div className="w-px h-4 bg-border mx-0.5" />
      <ActionButton
        icon={Trash2}
        label="Delete all"
        shortcut={getShortcutForAction("delete")}
        onClick={handleDelete}
        variant="destructive"
      />
    </>
  )

  // Render container-specific actions
  const renderContainerActions = () => (
    <>
      <ActionButton
        icon={Plus}
        label="Add child"
        onClick={handleAddChild}
      />
      <ActionButton
        icon={Minimize2}
        label="Collapse all"
        onClick={handleCollapseAll}
      />
      <ActionButton
        icon={Maximize2}
        label="Expand all"
        onClick={handleExpandAll}
      />
      <div className="w-px h-4 bg-border mx-0.5" />
    </>
  )

  // Render no selection state (add block suggestions)
  const renderNoSelectionActions = () => (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground mr-1">Add:</span>
      {SUGGESTED_BLOCKS.map(({ type, label }) => {
        const Icon = BLOCK_ICONS[type]
        return (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleAddBlock(type)}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Add {label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )

  // Render suggestions dropdown
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-[var(--ds-amber-700)] hover:text-[var(--ds-amber-800)] hover:bg-[var(--ds-amber-700)]/10"
              >
                <Lightbulb className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Suggestions
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          {suggestions.map((suggestion) => {
            const SuggestionIcon = suggestion.icon
            return (
              <DropdownMenuItem
                key={suggestion.id}
                onClick={() => onAction(suggestion.action)}
                className="gap-2"
              >
                <SuggestionIcon className="h-4 w-4 text-[var(--ds-amber-700)]" />
                <span className="text-xs">{suggestion.message}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="shrink-0 border-t bg-muted/30">
      <div className="flex items-center justify-between px-2 py-1.5 gap-1">
        {/* Primary actions */}
        <div className="flex items-center gap-0.5">
          {!hasSelection && renderNoSelectionActions()}
          {isContainerSelected && renderContainerActions()}
          {isSingleSelection && !isContainerSelected && renderSingleSelectionActions()}
          {isMultiSelection && renderMultiSelectionActions()}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex items-center">
            {renderSuggestions()}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LayersContextActions
