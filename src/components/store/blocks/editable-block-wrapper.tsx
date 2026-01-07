"use client"

import { useCallback, useState, type ReactNode } from "react"
import { cn } from "@/shared/utils"
import type { BlockType } from "@/types/blocks"
import { BlockActionBar } from "./block-action-bar"

interface EditableBlockWrapperProps {
  blockId: string
  blockType: BlockType
  blockIndex: number
  totalBlocks: number
  isSelected: boolean
  isHighlighted: boolean
  isInEditor: boolean
  onBlockClick: (blockId: string, blockType: BlockType) => void
  onBlockHover: (blockId: string | null) => void
  onMoveUp?: (blockId: string) => void
  onMoveDown?: (blockId: string) => void
  onDuplicate?: (blockId: string) => void
  onDelete?: (blockId: string) => void
  onAddBelow?: (blockId: string) => void
  children: ReactNode
}

export function EditableBlockWrapper({
  blockId,
  blockType,
  blockIndex,
  totalBlocks,
  isSelected,
  isHighlighted,
  isInEditor,
  onBlockClick,
  onBlockHover,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAddBelow,
  children,
}: EditableBlockWrapperProps) {
  // Track if action bar is being interacted with to prevent hiding on mouse leave
  const [isActionBarHovered, setIsActionBarHovered] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isInEditor) return
      e.stopPropagation()
      onBlockClick(blockId, blockType)
    },
    [isInEditor, blockId, blockType, onBlockClick]
  )

  const handleMouseEnter = useCallback(() => {
    if (!isInEditor) return
    onBlockHover(blockId)
  }, [isInEditor, blockId, onBlockHover])

  const handleMouseLeave = useCallback(() => {
    if (!isInEditor) return
    // Don't hide if action bar is being hovered
    if (isActionBarHovered) return
    onBlockHover(null)
  }, [isInEditor, onBlockHover, isActionBarHovered])

  const handleActionBarMouseEnter = useCallback(() => {
    setIsActionBarHovered(true)
  }, [])

  const handleActionBarMouseLeave = useCallback(() => {
    setIsActionBarHovered(false)
    // Also trigger block mouse leave to hide the action bar
    if (!isSelected) {
      onBlockHover(null)
    }
  }, [isSelected, onBlockHover])

  // If not in editor, just render children
  if (!isInEditor) {
    return <>{children}</>
  }

  // Show action bar on hover (isHighlighted) or selection (isSelected)
  const showActionBar = isSelected || isHighlighted

  return (
    <div
      data-block-id={blockId}
      data-block-type={blockType}
      className={cn(
        "relative transition-all duration-150",
        // Hover state
        isHighlighted && !isSelected && "ring-2 ring-blue-400/50 ring-offset-2",
        // Selected state
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Selection indicator */}
      {(isSelected || isHighlighted) && (
        <div
          className={cn(
            "absolute -top-7 left-2 z-50 px-2 py-1 text-xs font-medium rounded-t-md",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-blue-500 text-white"
          )}
        >
          {blockType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </div>
      )}

      {/* Block action bar - shows on hover or selection (Requirement 10.1, 10.4, 10.5) */}
      {showActionBar && (
        <div 
          className="absolute -top-7 right-2 z-50"
          onMouseEnter={handleActionBarMouseEnter}
          onMouseLeave={handleActionBarMouseLeave}
        >
          <BlockActionBar position="top">
            <BlockActionBar.BlockActions
              onMoveUp={onMoveUp ? () => onMoveUp(blockId) : undefined}
              onMoveDown={onMoveDown ? () => onMoveDown(blockId) : undefined}
              onAddBelow={onAddBelow ? () => onAddBelow(blockId) : undefined}
              onDuplicate={onDuplicate ? () => onDuplicate(blockId) : undefined}
              onDelete={onDelete ? () => onDelete(blockId) : undefined}
              canMoveUp={blockIndex > 0}
              canMoveDown={blockIndex < totalBlocks - 1}
            />
          </BlockActionBar>
        </div>
      )}

      {/* Block content */}
      {children}

      {/* Click overlay for better hit detection */}
      <div
        className={cn(
          "absolute inset-0 cursor-pointer",
          isSelected ? "pointer-events-none" : "pointer-events-auto"
        )}
        style={{ zIndex: isSelected ? -1 : 1 }}
      />
    </div>
  )
}
