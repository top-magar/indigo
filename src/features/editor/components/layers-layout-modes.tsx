"use client"

import { useCallback, useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  LockIcon,
  SquareUnlock02Icon,
  Copy01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/utils"
import type { StoreBlock } from "@/types/blocks"
import { isContainerBlock, flattenBlocks, findParentBlock } from "@/types/blocks"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_COLORS, BLOCK_NAMES } from "@/features/editor/block-constants"
import { LayerItem, type ViewDensity } from "./layer-item"
import { useEditorStore } from "@/features/editor/store"

// ============================================================================
// TYPES
// ============================================================================

export type LayoutMode = "tree" | "list" | "grid"

export interface LayoutModeProps {
  blocks: StoreBlock[]
  selectedIds: Set<string>
  hoveredBlockId: string | null
  viewDensity: ViewDensity
  searchQuery: string
  onSelect: (blockId: string, e: React.MouseEvent) => void
  onToggleVisibility: (blockId: string) => void
  onToggleLock: (blockId: string) => void
  onCheckboxChange: (blockId: string, checked: boolean) => void
  showCheckboxes: boolean
}

// Visual block types that should show thumbnails
const VISUAL_BLOCK_TYPES = ["hero", "image", "gallery", "video"]

// ============================================================================
// TREE VIEW (Default - Hierarchical)
// ============================================================================

interface TreeViewProps extends LayoutModeProps {
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
}

export function TreeView({
  blocks,
  selectedIds,
  hoveredBlockId,
  viewDensity,
  searchQuery,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onCheckboxChange,
  showCheckboxes,
  expandedIds,
  onToggleExpand,
}: TreeViewProps) {
  const renderBlock = useCallback(
    (block: StoreBlock, depth: number = 0, index: number = 0) => {
      const isContainer = isContainerBlock(block)
      const children = isContainer ? (block as any).children || [] : []
      const hasChildren = children.length > 0
      const isExpanded = expandedIds.has(block.id)
      const isSelected = selectedIds.has(block.id)
      const isMultiSelected = isSelected && selectedIds.size > 1

      return (
        <div key={block.id}>
          <LayerItem
            block={block}
            index={index}
            totalBlocks={blocks.length}
            isSelected={isSelected}
            isHovered={hoveredBlockId === block.id}
            isMultiSelected={isMultiSelected}
            viewDensity={viewDensity}
            depth={depth}
            isExpanded={isExpanded}
            onToggleExpand={() => onToggleExpand(block.id)}
            hasChildren={hasChildren}
            onSelect={(e) => onSelect(block.id, e)}
            onToggleVisibility={() => onToggleVisibility(block.id)}
            onToggleLock={() => onToggleLock(block.id)}
            showCheckbox={showCheckboxes}
            onCheckboxChange={(checked) => onCheckboxChange(block.id, checked)}
            searchHighlight={searchQuery}
          />
          {hasChildren && isExpanded && (
            <div>
              {children.map((child: StoreBlock, childIndex: number) =>
                renderBlock(child, depth + 1, childIndex)
              )}
            </div>
          )}
        </div>
      )
    },
    [
      blocks.length,
      selectedIds,
      hoveredBlockId,
      viewDensity,
      expandedIds,
      onToggleExpand,
      onSelect,
      onToggleVisibility,
      onToggleLock,
      showCheckboxes,
      onCheckboxChange,
      searchQuery,
    ]
  )

  return (
    <div
      className={cn(
        "space-y-0.5",
        viewDensity === "compact" && "space-y-px",
        viewDensity === "minimal" && "space-y-0"
      )}
    >
      {blocks.map((block, index) => renderBlock(block, 0, index))}
    </div>
  )
}

// ============================================================================
// LIST VIEW (Flat - Photoshop Style)
// ============================================================================

export function ListView({
  blocks,
  selectedIds,
  hoveredBlockId,
  viewDensity,
  searchQuery,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onCheckboxChange,
  showCheckboxes,
}: LayoutModeProps) {
  const hoverBlock = useEditorStore((s) => s.hoverBlock)

  // Flatten all blocks for flat list view
  const flatBlocks = useMemo(() => flattenBlocks(blocks), [blocks])

  // Get parent name for a block
  const getParentName = useCallback(
    (block: StoreBlock): string | null => {
      const parent = findParentBlock(blocks, block.id)
      if (parent) {
        return BLOCK_NAMES[parent.type] || parent.type
      }
      return null
    },
    [blocks]
  )

  // Highlight search text
  const highlightText = useCallback(
    (text: string) => {
      if (!searchQuery.trim()) return text
      const regex = new RegExp(
        `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      )
      const parts = text.split(regex)
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )
    },
    [searchQuery]
  )

  // Density-based classes
  const heightClass =
    viewDensity === "comfortable"
      ? "h-7"
      : viewDensity === "compact"
        ? "h-6"
        : "h-5"
  const iconSizeClass =
    viewDensity === "comfortable"
      ? "h-3.5 w-3.5"
      : viewDensity === "compact"
        ? "h-3 w-3"
        : "h-2.5 w-2.5"
  const textSizeClass =
    viewDensity === "comfortable"
      ? "text-xs"
      : viewDensity === "compact"
        ? "text-[11px]"
        : "text-[10px]"

  return (
    <div
      className={cn(
        "space-y-0.5",
        viewDensity === "compact" && "space-y-px",
        viewDensity === "minimal" && "space-y-0"
      )}
    >
      {flatBlocks.map((block) => {
        const blockMeta = BLOCK_REGISTRY[block.type]
        if (!blockMeta) return null

        const Icon = BLOCK_ICONS[block.type]
        const colors = BLOCK_COLORS[block.type]
        const isSelected = selectedIds.has(block.id)
        const isHovered = hoveredBlockId === block.id
        const isMultiSelected = isSelected && selectedIds.size > 1
        const isLocked = block.locked ?? false
        const parentName = getParentName(block)

        return (
          <div
            key={block.id}
            className={cn(
              "group relative flex items-center rounded-md transition-colors cursor-pointer select-none px-1",
              heightClass,
              isSelected && !isMultiSelected && "bg-primary/15",
              isSelected && isMultiSelected && "bg-violet-500/15 ring-1 ring-violet-500/30",
              isHovered && !isSelected && "bg-muted",
              !block.visible && "opacity-50"
            )}
            onClick={(e) => onSelect(block.id, e)}
            onMouseEnter={() => hoverBlock(block.id)}
            onMouseLeave={() => hoverBlock(null)}
          >
            {/* Color indicator */}
            <div
              className={cn(
                "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-opacity",
                colors.bg,
                isSelected || isHovered ? "opacity-100" : "opacity-30"
              )}
            />

            {/* Checkbox */}
            {showCheckboxes && (
              <div
                className={cn(
                  "shrink-0 w-5 flex items-center justify-center transition-opacity",
                  isHovered || isMultiSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onCheckboxChange(block.id, checked === true)
                  }
                  className="h-3 w-3"
                />
              </div>
            )}

            {/* Icon */}
            <HugeiconsIcon
              icon={Icon}
              className={cn(iconSizeClass, "shrink-0 ml-1", colors.text)}
            />

            {/* Name */}
            <span
              className={cn(
                "flex-1 truncate ml-1.5 mr-1",
                textSizeClass,
                !block.visible && "line-through text-muted-foreground"
              )}
            >
              {highlightText(blockMeta.name)}
            </span>

            {/* Parent badge */}
            {parentName && viewDensity !== "minimal" && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[9px] font-normal text-muted-foreground shrink-0"
              >
                {parentName}
              </Badge>
            )}

            {/* Status indicators */}
            {viewDensity !== "minimal" && (
              <>
                {!block.visible && (
                  <HugeiconsIcon
                    icon={ViewOffSlashIcon}
                    className={cn("text-muted-foreground mr-1", iconSizeClass)}
                  />
                )}
                {isLocked && (
                  <HugeiconsIcon
                    icon={LockIcon}
                    className={cn("text-amber-500 mr-1", iconSizeClass)}
                  />
                )}
              </>
            )}

            {/* Hover actions */}
            {viewDensity !== "minimal" && (
              <div
                className={cn(
                  "flex items-center mr-1 transition-opacity",
                  isSelected || isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-center rounded hover:bg-muted",
                        viewDensity === "comfortable" ? "h-5 w-5" : "h-4 w-4"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleVisibility(block.id)
                      }}
                    >
                      <HugeiconsIcon
                        icon={block.visible ? ViewIcon : ViewOffSlashIcon}
                        className={cn("text-muted-foreground", iconSizeClass)}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {block.visible ? "Hide" : "Show"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// GRID VIEW (Thumbnail Grid)
// ============================================================================

export function GridView({
  blocks,
  selectedIds,
  hoveredBlockId,
  viewDensity,
  searchQuery,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onCheckboxChange,
  showCheckboxes,
}: LayoutModeProps) {
  const hoverBlock = useEditorStore((s) => s.hoverBlock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)

  // Flatten all blocks for grid view
  const flatBlocks = useMemo(() => flattenBlocks(blocks), [blocks])

  // Highlight search text
  const highlightText = useCallback(
    (text: string) => {
      if (!searchQuery.trim()) return text
      const regex = new RegExp(
        `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      )
      const parts = text.split(regex)
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )
    },
    [searchQuery]
  )

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {flatBlocks.map((block) => {
        const blockMeta = BLOCK_REGISTRY[block.type]
        if (!blockMeta) return null

        const Icon = BLOCK_ICONS[block.type]
        const colors = BLOCK_COLORS[block.type]
        const isSelected = selectedIds.has(block.id)
        const isHovered = hoveredBlockId === block.id
        const isMultiSelected = isSelected && selectedIds.size > 1
        const isLocked = block.locked ?? false
        const isVisualBlock = VISUAL_BLOCK_TYPES.includes(block.type)

        // Try to get thumbnail from block settings
        const settings = (block as any).settings || {}
        const thumbnailSrc =
          settings.backgroundImage || settings.src || settings.poster

        return (
          <div
            key={block.id}
            className={cn(
              "group relative flex flex-col rounded-md border transition-all cursor-pointer select-none overflow-hidden",
              "bg-card hover:bg-muted/50",
              isSelected && !isMultiSelected && "ring-2 ring-primary border-primary",
              isSelected && isMultiSelected && "ring-2 ring-violet-500 border-violet-500",
              isHovered && !isSelected && "border-muted-foreground/30",
              !block.visible && "opacity-50"
            )}
            onClick={(e) => onSelect(block.id, e)}
            onMouseEnter={() => hoverBlock(block.id)}
            onMouseLeave={() => hoverBlock(null)}
          >
            {/* Thumbnail area */}
            <div
              className={cn(
                "relative w-full h-12 flex items-center justify-center",
                colors.bg.replace("/10", "/5")
              )}
            >
              {/* Checkbox overlay */}
              {showCheckboxes && (
                <div
                  className={cn(
                    "absolute top-1 left-1 z-10 transition-opacity",
                    isHovered || isMultiSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onCheckboxChange(block.id, checked === true)
                    }
                    className="h-3.5 w-3.5 bg-background/80 backdrop-blur-sm"
                  />
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5">
                {!block.visible && (
                  <div className="h-4 w-4 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ViewOffSlashIcon}
                      className="h-2.5 w-2.5 text-muted-foreground"
                    />
                  </div>
                )}
                {isLocked && (
                  <div className="h-4 w-4 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <HugeiconsIcon
                      icon={LockIcon}
                      className="h-2.5 w-2.5 text-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail content */}
              {isVisualBlock && thumbnailSrc ? (
                <img
                  src={thumbnailSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <HugeiconsIcon
                  icon={Icon}
                  className={cn("h-6 w-6", colors.text)}
                />
              )}

              {/* Quick actions on hover */}
              <div
                className={cn(
                  "absolute bottom-1 right-1 flex items-center gap-0.5 transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="h-5 w-5 rounded bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleVisibility(block.id)
                      }}
                    >
                      <HugeiconsIcon
                        icon={block.visible ? ViewIcon : ViewOffSlashIcon}
                        className="h-3 w-3 text-muted-foreground"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {block.visible ? "Hide" : "Show"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="h-5 w-5 rounded bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleLock(block.id)
                      }}
                    >
                      <HugeiconsIcon
                        icon={isLocked ? SquareUnlock02Icon : LockIcon}
                        className="h-3 w-3 text-muted-foreground"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isLocked ? "Unlock" : "Lock"}
                  </TooltipContent>
                </Tooltip>

                {!isLocked && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="h-5 w-5 rounded bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateBlock(block.id)
                          }}
                        >
                          <HugeiconsIcon
                            icon={Copy01Icon}
                            className="h-3 w-3 text-muted-foreground"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Duplicate
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="h-5 w-5 rounded bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeBlock(block.id)
                          }}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="h-3 w-3 text-destructive"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Delete
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* Block name */}
            <div className="px-1.5 py-1 border-t">
              <span
                className={cn(
                  "text-[10px] truncate block text-center",
                  !block.visible && "line-through text-muted-foreground"
                )}
              >
                {highlightText(blockMeta.name)}
              </span>
            </div>

            {/* Color indicator */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 transition-opacity",
                colors.bg,
                isSelected || isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TreeView,
  ListView,
  GridView,
}
