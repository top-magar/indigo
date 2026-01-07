"use client"

import { useState, useCallback, useRef } from "react"
import { useEditorStore } from "@/features/editor/store"
import type { ResizeDirection, ResizeConstraints } from "@/features/editor/components/resize-handles"
import type { BlockType } from "@/types/blocks"

export interface UseBlockResizeOptions {
  blockId: string
  blockType: BlockType
  initialWidth?: number
  initialHeight?: number
  constraints?: ResizeConstraints
  onResizeComplete?: (width: number, height: number) => void
}

export interface UseBlockResizeReturn {
  isResizing: boolean
  currentWidth: number
  currentHeight: number
  handleResizeStart: (direction: ResizeDirection) => void
  handleResize: (deltaX: number, deltaY: number, direction: ResizeDirection) => void
  handleResizeEnd: (finalWidth: number, finalHeight: number) => void
  constraints: ResizeConstraints
}

// Block types that support width resizing
const WIDTH_RESIZABLE_BLOCKS: BlockType[] = [
  'image',
  'button',
  'divider',
  'spacer',
  'rich-text',
]

// Block types that support height resizing
const HEIGHT_RESIZABLE_BLOCKS: BlockType[] = [
  'image',
  'spacer',
  'section',
]

// Default constraints per block type
const DEFAULT_CONSTRAINTS: Partial<Record<BlockType, ResizeConstraints>> = {
  image: {
    minWidth: 100,
    maxWidth: 1200,
    minHeight: 50,
    maxHeight: 800,
  },
  button: {
    minWidth: 80,
    maxWidth: 400,
    minHeight: 32,
    maxHeight: 64,
  },
  spacer: {
    minWidth: 50,
    maxWidth: 2000,
    minHeight: 8,
    maxHeight: 200,
  },
  divider: {
    minWidth: 50,
    maxWidth: 2000,
    minHeight: 1,
    maxHeight: 8,
  },
  section: {
    minWidth: 200,
    maxWidth: 2000,
    minHeight: 100,
    maxHeight: 1000,
  },
  'rich-text': {
    minWidth: 200,
    maxWidth: 1200,
    minHeight: 50,
    maxHeight: 2000,
  },
}

/**
 * Hook for managing block resize operations.
 * Handles resize state, constraints, and updates to the store.
 */
export function useBlockResize({
  blockId,
  blockType,
  initialWidth,
  initialHeight,
  constraints: customConstraints,
  onResizeComplete,
}: UseBlockResizeOptions): UseBlockResizeReturn {
  const updateBlockSettings = useEditorStore((s) => s.updateBlockSettings)
  
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(initialWidth ?? 0)
  const [currentHeight, setCurrentHeight] = useState(initialHeight ?? 0)
  
  const startDimsRef = useRef({ width: 0, height: 0 })

  // Merge default and custom constraints
  const constraints: ResizeConstraints = {
    ...DEFAULT_CONSTRAINTS[blockType],
    ...customConstraints,
  }

  // Check if this block type supports resizing
  const canResizeWidth = WIDTH_RESIZABLE_BLOCKS.includes(blockType)
  const canResizeHeight = HEIGHT_RESIZABLE_BLOCKS.includes(blockType)

  const handleResizeStart = useCallback((direction: ResizeDirection) => {
    setIsResizing(true)
    startDimsRef.current = { width: currentWidth, height: currentHeight }
  }, [currentWidth, currentHeight])

  const handleResize = useCallback((deltaX: number, deltaY: number, direction: ResizeDirection) => {
    let newWidth = startDimsRef.current.width
    let newHeight = startDimsRef.current.height

    // Calculate new dimensions based on direction
    if (canResizeWidth) {
      if (direction.includes('e')) newWidth += deltaX
      if (direction.includes('w')) newWidth -= deltaX
    }
    
    if (canResizeHeight) {
      if (direction.includes('s')) newHeight += deltaY
      if (direction.includes('n')) newHeight -= deltaY
    }

    // Apply constraints
    const { minWidth = 50, maxWidth = 2000, minHeight = 20, maxHeight = 2000 } = constraints

    if (canResizeWidth) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setCurrentWidth(newWidth)
    }
    
    if (canResizeHeight) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
      setCurrentHeight(newHeight)
    }
  }, [canResizeWidth, canResizeHeight, constraints])

  const handleResizeEnd = useCallback((finalWidth: number, finalHeight: number) => {
    setIsResizing(false)

    // Update block settings with new dimensions
    const updates: Record<string, unknown> = {}
    
    if (canResizeWidth && finalWidth !== startDimsRef.current.width) {
      updates.width = Math.round(finalWidth)
    }
    
    if (canResizeHeight && finalHeight !== startDimsRef.current.height) {
      updates.height = Math.round(finalHeight)
    }

    if (Object.keys(updates).length > 0) {
      updateBlockSettings(blockId, updates)
      onResizeComplete?.(finalWidth, finalHeight)
    }
  }, [blockId, canResizeWidth, canResizeHeight, updateBlockSettings, onResizeComplete])

  return {
    isResizing,
    currentWidth,
    currentHeight,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    constraints,
  }
}

/**
 * Check if a block type supports resizing
 */
export function isResizableBlock(blockType: BlockType): boolean {
  return WIDTH_RESIZABLE_BLOCKS.includes(blockType) || HEIGHT_RESIZABLE_BLOCKS.includes(blockType)
}

/**
 * Get resize capabilities for a block type
 */
export function getResizeCapabilities(blockType: BlockType): { width: boolean; height: boolean } {
  return {
    width: WIDTH_RESIZABLE_BLOCKS.includes(blockType),
    height: HEIGHT_RESIZABLE_BLOCKS.includes(blockType),
  }
}
