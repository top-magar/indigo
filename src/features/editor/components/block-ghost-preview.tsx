"use client"

import { cn } from "@/shared/utils"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS, BLOCK_BG_COLORS, BLOCK_NAMES } from "@/features/editor/block-constants"
import type { StoreBlock } from "@/types/blocks"

/**
 * BlockGhostPreview - Semi-transparent preview showing the final position during drag
 * 
 * Requirements: 2.3
 * - WHEN dragging over a block, THE InlinePreview SHALL display a ghost preview showing the final position
 */
export interface BlockGhostPreviewProps {
  /** The block being dragged */
  block: StoreBlock
  /** Target index where the block will be placed */
  targetIndex: number
  /** Total number of blocks */
  totalBlocks: number
  /** Additional CSS classes */
  className?: string
}

export function BlockGhostPreview({
  block,
  targetIndex,
  totalBlocks,
  className,
}: BlockGhostPreviewProps) {
  const BlockIcon = BLOCK_ICONS[block.type]
  const blockColor = BLOCK_TEXT_COLORS[block.type]
  const bgColor = BLOCK_BG_COLORS[block.type]
  const blockName = BLOCK_NAMES[block.type]

  // Calculate position label
  const positionLabel = `Position ${targetIndex + 1} of ${totalBlocks}`

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed border-primary/50 bg-primary/5",
        "p-4 transition-all duration-200 ease-out",
        "animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      data-testid="block-ghost-preview"
      data-block-type={block.type}
      data-target-index={targetIndex}
    >
      {/* Ghost content */}
      <div className="flex items-center gap-3 opacity-60">
        {/* Block icon */}
        <div className={cn("shrink-0 p-2 rounded-sm", bgColor)}>
          <BlockIcon className={cn("h-5 w-5", blockColor)} />
        </div>

        {/* Block info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{blockName}</span>
          <span className="text-xs text-muted-foreground">{positionLabel}</span>
        </div>

        {/* Position badge */}
        <div className="shrink-0 px-2 py-1 rounded-sm bg-primary/10 text-primary text-xs font-medium">
          #{targetIndex + 1}
        </div>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary/20 animate-pulse pointer-events-none" />
    </div>
  )
}

export default BlockGhostPreview
