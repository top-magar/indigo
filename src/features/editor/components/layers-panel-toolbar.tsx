"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Search,
  X,
  Eye,
  Lock,
  Copy,
  Trash2,
  Menu,
  AlignJustify,
  StretchHorizontal,
  Network,
  List,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"
import { BlockPalette } from "./block-palette"
import type { BlockType } from "@/types/blocks"
import type { LayoutMode } from "./layers-layout-modes"

// =============================================================================
// TYPES
// =============================================================================

type ViewDensity = "comfortable" | "compact" | "minimal"

interface LayersPanelToolbarProps {
  viewDensity: ViewDensity
  onViewDensityChange: (density: ViewDensity) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onBulkVisibility: () => void
  onBulkLock: () => void
  onBulkDuplicate: () => void
  onBulkDelete: () => void
  onClearSelection: () => void
  onAddBlock: (type: BlockType, variant: string) => void
  existingBlockTypes: BlockType[]
  layoutMode: LayoutMode
  onLayoutModeChange: (mode: LayoutMode) => void
  isCollapsed?: boolean
  filterMenu?: ReactNode
  presetsMenu?: ReactNode
}

// =============================================================================
// VIEW DENSITY ICONS
// =============================================================================

const VIEW_DENSITY_CONFIG: Record<ViewDensity, { icon: LucideIcon; label: string }> = {
  comfortable: { icon: Menu, label: "Comfortable" },
  compact: { icon: AlignJustify, label: "Compact" },
  minimal: { icon: StretchHorizontal, label: "Minimal" },
}

const LAYOUT_MODE_CONFIG: Record<LayoutMode, { icon: LucideIcon; label: string }> = {
  tree: { icon: Network, label: "Tree" },
  list: { icon: List, label: "List" },
  grid: { icon: LayoutGrid, label: "Grid" },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LayersPanelToolbar({
  viewDensity,
  onViewDensityChange,
  searchQuery,
  onSearchChange,
  selectedCount,
  onBulkVisibility,
  onBulkLock,
  onBulkDuplicate,
  onBulkDelete,
  onClearSelection,
  onAddBlock,
  existingBlockTypes,
  layoutMode,
  onLayoutModeChange,
  isCollapsed = false,
  filterMenu,
  presetsMenu,
}: LayersPanelToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const showBulkActions = selectedCount > 1

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search (when not in an input)
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Escape to clear search
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        onSearchChange("")
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onSearchChange])

  // Collapsed state - show minimal toolbar
  if (isCollapsed) {
    return (
      <div className="shrink-0 border-b p-1.5 flex flex-col items-center gap-1">
        <BlockPalette 
          onAddBlock={onAddBlock} 
          existingBlockTypes={existingBlockTypes} 
        />
      </div>
    )
  }

  return (
    <div className="shrink-0 border-b">
      {/* Main toolbar row */}
      <div className="flex items-center justify-between p-1.5 gap-1">
        {/* View density toggle */}
        <div className="flex items-center bg-muted/50 rounded-sm p-0.5">
          {(Object.keys(VIEW_DENSITY_CONFIG) as ViewDensity[]).map((density) => {
            const config = VIEW_DENSITY_CONFIG[density]
            const isActive = viewDensity === density
            return (
              <Tooltip key={density}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewDensityChange(density)}
                    className={cn(
                      "h-5 w-5 flex items-center justify-center rounded transition-colors",
                      isActive 
                        ? "bg-background shadow-sm" 
                        : "hover:bg-background/50 text-muted-foreground"
                    )}
                  >
                    <config.icon className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {config.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Layout mode toggle */}
        <div className="flex items-center bg-muted/50 rounded-sm p-0.5">
          {(Object.keys(LAYOUT_MODE_CONFIG) as LayoutMode[]).map((mode) => {
            const config = LAYOUT_MODE_CONFIG[mode]
            const isActive = layoutMode === mode
            return (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onLayoutModeChange(mode)}
                    className={cn(
                      "h-5 w-5 flex items-center justify-center rounded transition-colors",
                      isActive 
                        ? "bg-background shadow-sm" 
                        : "hover:bg-background/50 text-muted-foreground"
                    )}
                  >
                    <config.icon className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {config.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Filter menu */}
        {filterMenu}

        {/* Presets menu */}
        {presetsMenu}

        {/* Add block button */}
        <BlockPalette 
          onAddBlock={onAddBlock} 
          existingBlockTypes={existingBlockTypes} 
        />
      </div>

      {/* Search row */}
      <div className="px-1.5 pb-1.5">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none"
          />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-6 pl-7 pr-8 text-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-4 px-1 text-[10px] font-mono text-muted-foreground bg-muted rounded">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {showBulkActions && (
        <div className="px-1.5 pb-1.5">
          <div className="flex items-center gap-1 p-1 bg-[var(--ds-purple-700)]/10 rounded-sm">
            {/* Selection count */}
            <span className="text-[10px] font-medium text-[var(--ds-purple-700)] px-1.5">
              {selectedCount} selected
            </span>

            <div className="flex-1" />

            {/* Bulk action buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onBulkVisibility}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Toggle Visibility
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onBulkLock}
                >
                  <Lock className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Toggle Lock
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onBulkDuplicate}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Duplicate
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onBulkDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Delete
              </TooltipContent>
            </Tooltip>

            {/* Clear selection */}
            <div className="w-px h-3 bg-[var(--ds-purple-700)]/20 mx-0.5" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onClearSelection}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Clear Selection
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}
