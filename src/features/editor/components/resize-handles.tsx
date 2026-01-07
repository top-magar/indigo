"use client"

import { memo, useCallback, useState, useRef, useEffect } from "react"
import { cn } from "@/shared/utils"

export type ResizeDirection = 
  | 'n' | 's' | 'e' | 'w' 
  | 'ne' | 'nw' | 'se' | 'sw'

export interface ResizeConstraints {
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  aspectRatio?: number // width / height
  lockAspectRatio?: boolean
}

export interface ResizeHandlesProps {
  /** Whether the block is currently selected */
  isSelected: boolean
  /** Whether to show all 8 handles or just corners */
  showAllHandles?: boolean
  /** Constraints for resizing */
  constraints?: ResizeConstraints
  /** Current dimensions */
  width?: number
  height?: number
  /** Callback when resize starts */
  onResizeStart?: (direction: ResizeDirection) => void
  /** Callback during resize with delta values */
  onResize?: (deltaX: number, deltaY: number, direction: ResizeDirection) => void
  /** Callback when resize ends */
  onResizeEnd?: (finalWidth: number, finalHeight: number) => void
  /** Whether resizing is disabled */
  disabled?: boolean
}

interface HandleProps {
  direction: ResizeDirection
  onMouseDown: (e: React.MouseEvent, direction: ResizeDirection) => void
  disabled?: boolean
}

const Handle = memo(function Handle({ direction, onMouseDown, disabled }: HandleProps) {
  // Position classes based on direction
  const positionClasses: Record<ResizeDirection, string> = {
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
    e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
    w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  }

  // Corner handles are larger
  const isCorner = ['ne', 'nw', 'se', 'sw'].includes(direction)

  return (
    <div
      className={cn(
        "absolute z-50 rounded-sm border-2 border-primary bg-background shadow-sm",
        "transition-transform duration-75 hover:scale-125",
        isCorner ? "h-3 w-3" : "h-2.5 w-2.5",
        positionClasses[direction],
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onMouseDown={(e) => !disabled && onMouseDown(e, direction)}
      data-resize-handle={direction}
    />
  )
})

/**
 * ResizeHandles component provides visual resize handles around a selected block.
 * Supports 8-directional resizing with constraints.
 */
export const ResizeHandles = memo(function ResizeHandles({
  isSelected,
  showAllHandles = false,
  constraints = {},
  width,
  height,
  onResizeStart,
  onResize,
  onResizeEnd,
  disabled = false,
}: ResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [activeDirection, setActiveDirection] = useState<ResizeDirection | null>(null)
  const [dimensions, setDimensions] = useState({ width: width ?? 0, height: height ?? 0 })
  const startPosRef = useRef({ x: 0, y: 0 })
  const startDimsRef = useRef({ width: 0, height: 0 })

  // Update dimensions when props change
  useEffect(() => {
    if (width !== undefined) setDimensions(d => ({ ...d, width }))
    if (height !== undefined) setDimensions(d => ({ ...d, height }))
  }, [width, height])

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setActiveDirection(direction)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    startDimsRef.current = { width: dimensions.width, height: dimensions.height }
    
    onResizeStart?.(direction)
  }, [dimensions, onResizeStart])

  // Handle mouse move during resize
  useEffect(() => {
    if (!isResizing || !activeDirection) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y

      let newWidth = startDimsRef.current.width
      let newHeight = startDimsRef.current.height

      // Calculate new dimensions based on direction
      if (activeDirection.includes('e')) newWidth += deltaX
      if (activeDirection.includes('w')) newWidth -= deltaX
      if (activeDirection.includes('s')) newHeight += deltaY
      if (activeDirection.includes('n')) newHeight -= deltaY

      // Apply constraints
      const { minWidth = 50, maxWidth = 2000, minHeight = 20, maxHeight = 2000, aspectRatio, lockAspectRatio } = constraints

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

      // Lock aspect ratio if needed
      if (lockAspectRatio && aspectRatio) {
        if (activeDirection.includes('e') || activeDirection.includes('w')) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }

      setDimensions({ width: newWidth, height: newHeight })
      onResize?.(deltaX, deltaY, activeDirection)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setActiveDirection(null)
      onResizeEnd?.(dimensions.width, dimensions.height)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, activeDirection, constraints, dimensions, onResize, onResizeEnd])

  if (!isSelected) return null

  // Corner handles (always shown when selected)
  const cornerHandles: ResizeDirection[] = ['ne', 'nw', 'se', 'sw']
  // Edge handles (shown when showAllHandles is true)
  const edgeHandles: ResizeDirection[] = ['n', 's', 'e', 'w']

  return (
    <>
      {/* Corner handles */}
      {cornerHandles.map((dir) => (
        <Handle
          key={dir}
          direction={dir}
          onMouseDown={handleMouseDown}
          disabled={disabled}
        />
      ))}

      {/* Edge handles */}
      {showAllHandles && edgeHandles.map((dir) => (
        <Handle
          key={dir}
          direction={dir}
          onMouseDown={handleMouseDown}
          disabled={disabled}
        />
      ))}

      {/* Dimension display during resize */}
      {isResizing && (
        <div
          className={cn(
            "absolute -bottom-8 left-1/2 -translate-x-1/2 z-50",
            "px-2 py-1 rounded bg-primary text-primary-foreground",
            "text-[10px] font-medium whitespace-nowrap shadow-lg"
          )}
        >
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>
      )}
    </>
  )
})
