"use client"

/**
 * EditableBlockWrapper Component
 * 
 * Wraps block components in the InlinePreview to provide:
 * - Selection state (click to select)
 * - Hover state (highlight on hover)
 * - Visual indicators (ring, label)
 * - Event propagation prevention
 * - Hidden block placeholder
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 1.5
 */

import { useCallback, type ReactNode, type MouseEvent } from "react"
import { cn } from "@/shared/utils"
import type { StoreBlock } from "@/types/blocks"

export interface EditableBlockWrapperProps {
  /** The block data */
  block: StoreBlock
  /** Index of the block in the sorted list */
  index: number
  /** Total number of blocks */
  totalBlocks: number
  /** Whether this block is currently selected */
  isSelected: boolean
  /** Whether this block is currently hovered */
  isHovered: boolean
  /** Callback when block is clicked (to select) */
  onSelect: () => void
  /** Callback when hover state changes */
  onHover: (hovered: boolean) => void
  /** The block content to render */
  children: ReactNode
}

/**
 * EditableBlockWrapper provides selection, hover, and editing capabilities
 * for blocks rendered in the InlinePreview.
 * 
 * Key behaviors:
 * - Click handler selects the block (Requirement 2.1)
 * - Hover handlers show highlight state (Requirement 2.2)
 * - Visual indicators show selected/hovered states (Requirement 2.3)
 * - Event propagation is prevented to block content (Requirement 2.4)
 * - Hidden blocks show a dimmed placeholder (Requirement 1.5)
 */
export function EditableBlockWrapper({
  block,
  index,
  totalBlocks,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  children,
}: EditableBlockWrapperProps) {
  /**
   * Handle click events on the wrapper.
   * Prevents propagation to child elements (links, buttons) and selects the block.
   * Requirement 2.4: Event Propagation Prevention
   */
  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  /**
   * Handle mouse enter - show hover highlight
   * Requirement 2.2: Hover state display
   */
  const handleMouseEnter = useCallback(() => {
    onHover(true)
  }, [onHover])

  /**
   * Handle mouse leave - hide hover highlight
   */
  const handleMouseLeave = useCallback(() => {
    onHover(false)
  }, [onHover])

  // Format block type for display (e.g., "product-grid" -> "Product Grid")
  const blockTypeLabel = block.type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div
      data-block-id={block.id}
      data-block-type={block.type}
      data-block-index={index}
      data-block-visible={block.visible}
      data-testid="editable-block-wrapper"
      className={cn(
        "relative transition-all duration-150 cursor-pointer",
        // Hover state - blue ring (Requirement 2.2)
        isHovered && !isSelected && "ring-2 ring-[var(--ds-blue-400)]/50 ring-offset-2",
        // Selected state - primary ring (Requirement 2.3)
        isSelected && "ring-2 ring-primary ring-offset-2",
        // Hidden block styling (Requirement 1.5)
        !block.visible && "opacity-50"
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Block type label - shows on hover or selection (Requirement 2.2, 2.3) */}
      {(isSelected || isHovered) && (
        <div
          data-testid="block-type-label"
          className={cn(
            "absolute -top-7 left-2 z-50 px-2 py-1 text-xs font-medium rounded-t-md",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-[var(--ds-blue-700)] text-white"
          )}
        >
          {blockTypeLabel}
        </div>
      )}

      {/* Hidden block overlay (Requirement 1.5) */}
      {!block.visible && (
        <div 
          data-testid="hidden-block-overlay"
          className="absolute inset-0 bg-muted/80 flex items-center justify-center z-10 pointer-events-none"
        >
          <span className="text-muted-foreground font-medium">Hidden</span>
        </div>
      )}

      {/* 
        Block content wrapper with pointer-events-none
        This prevents clicks from reaching block content (links, buttons)
        Requirement 2.4: Event Propagation Prevention
      */}
      <div 
        data-testid="block-content-wrapper"
        className="pointer-events-none"
      >
        {children}
      </div>
    </div>
  )
}
