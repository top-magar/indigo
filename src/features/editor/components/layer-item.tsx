"use client"

import { useCallback } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  DragDropVerticalIcon,
  Copy01Icon,
  Delete02Icon,
  ArrowRight01Icon,
  ArrowDown01Icon as ChevronDownIcon,
  LockIcon,
  SquareUnlock02Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_COLORS } from "@/features/editor/block-constants"
import { useEditorStore } from "@/features/editor/store"

// ============================================================================
// TYPES
// ============================================================================

export type ViewDensity = "comfortable" | "compact" | "minimal"

export interface LayerItemProps {
  block: StoreBlock
  isSelected: boolean
  isHovered: boolean
  isMultiSelected: boolean
  viewDensity: ViewDensity
  depth?: number
  isExpanded?: boolean
  onToggleExpand?: () => void
  hasChildren?: boolean
  onSelect: (e: React.MouseEvent) => void
  onToggleVisibility: () => void
  onToggleLock: () => void
  showCheckbox?: boolean
  onCheckboxChange?: (checked: boolean) => void
  searchHighlight?: string
  isDragOverlay?: boolean
  index?: number
  totalBlocks?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Visual block types that should show thumbnails
const VISUAL_BLOCK_TYPES: BlockType[] = [
  "hero",
  "image",
  "gallery",
  "video",
]

// Height classes for different densities
const DENSITY_HEIGHTS: Record<ViewDensity, string> = {
  comfortable: "h-7",
  compact: "h-6",
  minimal: "h-5",
}

// Icon sizes for different densities
const DENSITY_ICON_SIZES: Record<ViewDensity, string> = {
  comfortable: "h-3.5 w-3.5",
  compact: "h-3 w-3",
  minimal: "h-2.5 w-2.5",
}

// Text sizes for different densities
const DENSITY_TEXT_SIZES: Record<ViewDensity, string> = {
  comfortable: "text-xs",
  compact: "text-[11px]",
  minimal: "text-[10px]",
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ThumbnailPreviewProps {
  block: StoreBlock
  colors: { text: string; bg: string; border: string }
}

function ThumbnailPreview({ block, colors }: ThumbnailPreviewProps) {
  const isVisualBlock = VISUAL_BLOCK_TYPES.includes(block.type)
  const Icon = BLOCK_ICONS[block.type]

  // For visual blocks, show a thumbnail placeholder
  if (isVisualBlock) {
    // Try to get background image from block settings
    const settings = (block as any).settings || {}
    const thumbnailSrc = settings.backgroundImage || settings.src || settings.poster

    if (thumbnailSrc) {
      return (
        <div className="w-6 h-6 rounded overflow-hidden shrink-0 bg-muted">
          <img
            src={thumbnailSrc}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    // Placeholder for visual blocks without image
    return (
      <div className={cn(
        "w-6 h-6 rounded shrink-0 flex items-center justify-center",
        colors.bg.replace("bg-", "bg-").replace("/10", "/20")
      )}>
        <HugeiconsIcon icon={Image01Icon} className="h-3 w-3 text-muted-foreground" />
      </div>
    )
  }

  // For non-visual blocks, show the block type icon
  return (
    <div className={cn(
      "w-6 h-6 rounded shrink-0 flex items-center justify-center",
      colors.bg.replace("bg-", "bg-").replace("/10", "/15")
    )}>
      <HugeiconsIcon icon={Icon} className={cn("h-3 w-3", colors.text)} />
    </div>
  )
}

interface HighlightedTextProps {
  text: string
  highlight?: string
  className?: string
}

function HighlightedText({ text, highlight, className }: HighlightedTextProps) {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}

// ============================================================================
// LAYER ITEM COMPONENT
// ============================================================================

export function LayerItem({
  block,
  isSelected,
  isHovered,
  isMultiSelected,
  viewDensity,
  depth = 0,
  isExpanded = true,
  onToggleExpand,
  hasChildren = false,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  showCheckbox = false,
  onCheckboxChange,
  searchHighlight,
  isDragOverlay = false,
}: LayerItemProps) {
  // Get actions from store
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)
  const duplicateSelectedBlocks = useEditorStore((s) => s.duplicateSelectedBlocks)
  const removeSelectedBlocks = useEditorStore((s) => s.removeSelectedBlocks)
  const hoverBlock = useEditorStore((s) => s.hoverBlock)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({
    id: block.id,
    disabled: isDragOverlay,
  })

  const style = isDragOverlay ? undefined : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const blockMeta = BLOCK_REGISTRY[block.type]
  if (!blockMeta) return null

  const Icon = BLOCK_ICONS[block.type]
  const colors = BLOCK_COLORS[block.type]
  const isProtected = block.type === "header" || block.type === "footer"
  const isLocked = block.locked ?? false
  const isDropTarget = over?.id === block.id && !isDragging

  // Memoized handlers
  const handleDuplicate = useCallback(() => {
    if (isMultiSelected) {
      duplicateSelectedBlocks()
    } else {
      duplicateBlock(block.id)
    }
  }, [duplicateBlock, duplicateSelectedBlocks, block.id, isMultiSelected])

  const handleRemove = useCallback(() => {
    if (isMultiSelected) {
      removeSelectedBlocks()
    } else {
      removeBlock(block.id)
    }
  }, [removeBlock, removeSelectedBlocks, block.id, isMultiSelected])

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleCheckboxChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckboxChange?.(checked === true)
  }, [onCheckboxChange])

  // Density-based classes
  const heightClass = DENSITY_HEIGHTS[viewDensity]
  const iconSizeClass = DENSITY_ICON_SIZES[viewDensity]
  const textSizeClass = DENSITY_TEXT_SIZES[viewDensity]
  const showIcons = viewDensity !== "minimal"
  const showThumbnail = viewDensity === "comfortable"

  const content = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center rounded-md transition-colors cursor-pointer select-none",
        heightClass,
        isDragging && "opacity-30",
        isDragOverlay && "shadow-lg border bg-background",
        isDropTarget && "bg-primary/10",
        // Single selection state
        isSelected && !isDragging && !isMultiSelected && "bg-primary/15",
        // Multi-selection state (different visual)
        isSelected && !isDragging && isMultiSelected && "bg-violet-500/15 ring-1 ring-violet-500/30",
        isHovered && !isSelected && !isDragging && "bg-muted",
        !block.visible && "opacity-50"
      )}
      onClick={onSelect}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {/* Drop indicator */}
      {isDropTarget && (
        <div className="absolute -top-px left-2 right-2 h-0.5 bg-primary rounded-full" />
      )}

      {/* Color indicator */}
      <div
        className={cn(
          "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-opacity",
          colors.bg,
          (isSelected || isHovered) ? "opacity-100" : "opacity-30"
        )}
        style={{ marginLeft: depth * 12 }}
      />

      {/* Indentation spacer */}
      {depth > 0 && (
        <div style={{ width: depth * 12 }} className="shrink-0" />
      )}

      {/* Checkbox (shown on hover or in multi-select mode) */}
      {showCheckbox && (
        <div
          className={cn(
            "shrink-0 w-5 flex items-center justify-center",
            "transition-opacity",
            (isHovered || isMultiSelected) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handleCheckboxClick}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-3 w-3"
          />
        </div>
      )}

      {/* Expand/collapse toggle for containers */}
      {hasChildren ? (
        <button
          className={cn(
            "shrink-0 w-5 h-full flex items-center justify-center",
            "text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
        >
          <HugeiconsIcon
            icon={isExpanded ? ChevronDownIcon : ArrowRight01Icon}
            className={cn("transition-transform", iconSizeClass)}
          />
        </button>
      ) : (
        /* Drag handle for non-containers or leaf nodes */
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "shrink-0 w-5 h-full flex items-center justify-center cursor-grab active:cursor-grabbing",
            "text-muted-foreground/40 hover:text-muted-foreground"
          )}
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} className={iconSizeClass} />
        </button>
      )}

      {/* Thumbnail (comfortable mode only) */}
      {showThumbnail && (
        <ThumbnailPreview block={block} colors={colors} />
      )}

      {/* Icon (comfortable and compact modes) */}
      {showIcons && !showThumbnail && (
        <HugeiconsIcon icon={Icon} className={cn(iconSizeClass, "shrink-0", colors.text)} />
      )}

      {/* Name */}
      <HighlightedText
        text={blockMeta.name}
        highlight={searchHighlight}
        className={cn(
          "flex-1 truncate ml-1.5 mr-1",
          textSizeClass,
          !block.visible && "line-through text-muted-foreground"
        )}
      />

      {/* Status indicators (not shown in minimal mode) */}
      {showIcons && (
        <>
          {/* Hidden indicator */}
          {!block.visible && (
            <HugeiconsIcon
              icon={ViewOffSlashIcon}
              className={cn("text-muted-foreground mr-1", iconSizeClass)}
            />
          )}

          {/* Locked indicator */}
          {isLocked && (
            <HugeiconsIcon
              icon={LockIcon}
              className={cn("text-amber-500 mr-1", iconSizeClass)}
            />
          )}
        </>
      )}

      {/* Hover actions (not shown in minimal mode) */}
      {showIcons && (
        <div className={cn(
          "flex items-center mr-1 transition-opacity",
          (isSelected || isHovered) ? "opacity-100" : "opacity-0"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center rounded hover:bg-muted",
                  viewDensity === "comfortable" ? "h-5 w-5" : "h-4 w-4"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility()
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

  // Wrap with context menu
  if (isDragOverlay) return content

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {content}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem onClick={onToggleVisibility}>
          <HugeiconsIcon
            icon={block.visible ? ViewOffSlashIcon : ViewIcon}
            className="h-4 w-4 mr-2"
          />
          {block.visible ? "Hide" : "Show"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onToggleLock}>
          <HugeiconsIcon
            icon={isLocked ? SquareUnlock02Icon : LockIcon}
            className="h-4 w-4 mr-2"
          />
          {isLocked ? "Unlock" : "Lock"}
        </ContextMenuItem>

        {!isProtected && !isLocked && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDuplicate}>
              <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
              {isMultiSelected ? "Duplicate All" : "Duplicate"}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleRemove} className="text-destructive">
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
              {isMultiSelected ? "Remove All" : "Remove"}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LayerItem
