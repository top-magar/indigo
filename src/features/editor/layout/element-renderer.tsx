/**
 * ElementRenderer - Renders enhanced elements with positioning
 * 
 * Supports positioning based on parent section's layout mode:
 * - Stack: Order-based vertical positioning
 * - Grid: CSS Grid placement
 * - Flex: Flexbox positioning
 * - Absolute: Freeform x/y positioning (Wix-like)
 */

"use client"

import { memo, useCallback, useMemo, useRef } from "react"
import { cn } from "@/shared/utils"
import type { EnhancedElement, EnhancedSection } from "./types"
import { generateElementCSS } from "./layout-engine"
import { useLayoutStore } from "./layout-store"

// =============================================================================
// ELEMENT RENDERER
// =============================================================================

export interface ElementRendererProps {
  element: EnhancedElement
  parentLayout: EnhancedSection["layout"]
  isEditing?: boolean
  isSelected?: boolean
  isHovered?: boolean
  onClick?: (e: React.MouseEvent) => void
  onHover?: (hovering: boolean) => void
  children?: React.ReactNode
  className?: string
}


export const ElementRenderer = memo(function ElementRenderer({
  element,
  parentLayout,
  isEditing = false,
  isSelected = false,
  isHovered = false,
  onClick,
  onHover,
  children,
  className,
}: ElementRendererProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const { resizingElementId, draggingElementId } = useLayoutStore()

  // Generate CSS for element based on parent layout
  const elementStyle = useMemo(
    () => generateElementCSS(element, parentLayout),
    [element, parentLayout]
  )

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return
    e.stopPropagation()
    onClick?.(e)
  }, [isEditing, onClick])

  // Handle hover
  const handleMouseEnter = useCallback(() => {
    if (!isEditing) return
    onHover?.(true)
  }, [isEditing, onHover])

  const handleMouseLeave = useCallback(() => {
    if (!isEditing) return
    onHover?.(false)
  }, [isEditing, onHover])

  const isResizing = resizingElementId === element.id
  const isDragging = draggingElementId === element.id

  // Don't render hidden elements (unless editing)
  if (!element.visible && !isEditing) {
    return null
  }

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      data-element-type={element.type}
      data-layout-mode={parentLayout.mode}
      className={cn(
        "relative",
        // Editing states
        isEditing && "cursor-pointer",
        isEditing && isHovered && !isSelected && "ring-2 ring-blue-400/50",
        isEditing && isSelected && "ring-2 ring-primary",
        // Hidden state
        !element.visible && isEditing && "opacity-50",
        // Locked state
        element.locked && "pointer-events-none",
        // Dragging state
        isDragging && "opacity-50 scale-[0.98]",
        // Resizing state
        isResizing && "ring-2 ring-primary ring-offset-2",
        className
      )}
      style={elementStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Element label (editing mode) */}
      {isEditing && isSelected && (
        <div className="absolute -top-6 left-0 z-50 px-2 py-0.5 text-xs font-medium rounded bg-primary text-primary-foreground">
          {element.type}
        </div>
      )}

      {/* Hidden overlay */}
      {!element.visible && isEditing && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center z-10 rounded">
          <span className="text-muted-foreground text-xs font-medium">Hidden</span>
        </div>
      )}

      {/* Resize handles for absolute layout */}
      {isEditing && isSelected && parentLayout.mode === "absolute" && !element.locked && (
        <ElementResizeHandles elementId={element.id} />
      )}

      {/* Element content */}
      <div className={cn(!element.visible && isEditing && "pointer-events-none")}>
        {children}
      </div>
    </div>
  )
})


// =============================================================================
// RESIZE HANDLES (for absolute layout)
// =============================================================================

interface ElementResizeHandlesProps {
  elementId: string
}

const ElementResizeHandles = memo(function ElementResizeHandles({
  elementId,
}: ElementResizeHandlesProps) {
  const { setResizingElement } = useLayoutStore()

  const handleMouseDown = useCallback((e: React.MouseEvent, _handle: string) => {
    e.stopPropagation()
    e.preventDefault()
    setResizingElement(elementId)
    // Resize logic would be implemented here with mouse move/up handlers
    // For now, this is a placeholder for the resize functionality
  }, [elementId, setResizingElement])

  const handles = [
    { position: "top-left", cursor: "nwse-resize", className: "-top-1 -left-1" },
    { position: "top-center", cursor: "ns-resize", className: "-top-1 left-1/2 -translate-x-1/2" },
    { position: "top-right", cursor: "nesw-resize", className: "-top-1 -right-1" },
    { position: "middle-left", cursor: "ew-resize", className: "top-1/2 -left-1 -translate-y-1/2" },
    { position: "middle-right", cursor: "ew-resize", className: "top-1/2 -right-1 -translate-y-1/2" },
    { position: "bottom-left", cursor: "nesw-resize", className: "-bottom-1 -left-1" },
    { position: "bottom-center", cursor: "ns-resize", className: "-bottom-1 left-1/2 -translate-x-1/2" },
    { position: "bottom-right", cursor: "nwse-resize", className: "-bottom-1 -right-1" },
  ]

  return (
    <>
      {handles.map((handle) => (
        <div
          key={handle.position}
          className={cn(
            "absolute w-2.5 h-2.5 bg-primary border border-background rounded-sm z-50",
            handle.className
          )}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleMouseDown(e, handle.position)}
        />
      ))}
    </>
  )
})
