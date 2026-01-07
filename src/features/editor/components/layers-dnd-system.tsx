"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import {
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/shared/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { isContainerBlock, getBlockPath, findBlockById } from "@/types/blocks"
import { BLOCK_ICONS, BLOCK_COLORS, BLOCK_NAMES } from "@/features/editor/block-constants"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Drop position relative to target element
 */
export type DropPosition = "before" | "after" | "inside"

/**
 * Props for drop indicator component (matches requested interface)
 */
export interface DropIndicatorProps {
  isVisible: boolean
  position: DropPosition
  depth?: number
  // Extended props for internal use
  targetId?: string | null
  targetType?: BlockType
}

/**
 * Props for nested drop zone component
 */
export interface NestedDropZoneProps {
  containerId: string
  isActive: boolean
  onDrop: (blockId: string, containerId: string) => void
  children?: React.ReactNode
  acceptedTypes?: BlockType[]
  className?: string
}

/**
 * Props for drag preview component (matches requested interface)
 */
export interface DragPreviewProps {
  block: StoreBlock
  count?: number // For multi-drag
}

/**
 * Props for multi-block drag preview (internal)
 */
export interface MultiDragPreviewProps {
  blocks: StoreBlock[]
  count: number
}

/**
 * Drop zone state returned by useDropZone hook
 */
export interface DropZoneState {
  isOver: boolean
  position: DropPosition | null
  targetId: string | null
  canDrop: boolean
}

/**
 * Drop zone configuration
 */
export interface DropZoneConfig {
  blockId: string
  block: StoreBlock
  allBlocks: StoreBlock[]
  draggedBlockId: string | null
  draggedBlocks?: StoreBlock[]
  acceptsChildren?: boolean
}

/**
 * Drag state for the entire DnD context
 */
export interface DragState {
  isDragging: boolean
  draggedBlockId: string | null
  draggedBlocks: StoreBlock[]
  dropTarget: {
    id: string | null
    position: DropPosition | null
  }
}

/**
 * Auto-scroll configuration
 */
export interface AutoScrollConfig {
  threshold: number // Distance from edge to trigger scroll (px)
  speed: number // Scroll speed (px per frame)
  enabled: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DROP_ZONE_THRESHOLD = 0.25 // Top/bottom 25% for before/after
const CONTAINER_INSIDE_THRESHOLD = 0.5 // Middle 50% for inside (containers only)

// Auto-scroll defaults
const DEFAULT_AUTO_SCROLL_CONFIG: AutoScrollConfig = {
  threshold: 60, // 60px from edge
  speed: 8, // 8px per frame
  enabled: true,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if dropping a block into a target would create a circular reference
 * (i.e., dropping a parent into its own child)
 */
export function wouldCreateCircularReference(
  draggedBlockId: string,
  targetBlockId: string,
  allBlocks: StoreBlock[]
): boolean {
  // Get the path from root to target
  const targetPath = getBlockPath(allBlocks, targetBlockId)
  
  // If the dragged block is in the target's path, it would create a circular reference
  return targetPath.includes(draggedBlockId)
}

/**
 * Check if a block can be dropped at a specific position
 */
export function canDropAtPosition(
  draggedBlock: StoreBlock,
  targetBlock: StoreBlock,
  position: DropPosition,
  allBlocks: StoreBlock[]
): boolean {
  // Can't drop on self
  if (draggedBlock.id === targetBlock.id) return false
  
  // Can't drop into own children (circular reference)
  if (position === "inside" && wouldCreateCircularReference(draggedBlock.id, targetBlock.id, allBlocks)) {
    return false
  }
  
  // Can only drop "inside" containers
  if (position === "inside" && !isContainerBlock(targetBlock)) {
    return false
  }
  
  // Column blocks can only be inside columns containers
  if (draggedBlock.type === "column" && position !== "inside") {
    // Columns can only be reordered within their parent columns block
    const targetParentPath = getBlockPath(allBlocks, targetBlock.id)
    const draggedParentPath = getBlockPath(allBlocks, draggedBlock.id)
    
    // If they don't share the same parent, can't drop
    if (targetParentPath.length === 0 || draggedParentPath.length === 0) return false
    if (targetParentPath[targetParentPath.length - 1] !== draggedParentPath[draggedParentPath.length - 1]) {
      return false
    }
  }
  
  // Columns container can only accept column children
  if (position === "inside" && targetBlock.type === "columns" && draggedBlock.type !== "column") {
    return false
  }
  
  return true
}

/**
 * Calculate drop position based on mouse position relative to element
 */
export function calculateDropPosition(
  mouseY: number,
  elementRect: DOMRect,
  isContainer: boolean
): DropPosition {
  const relativeY = mouseY - elementRect.top
  const height = elementRect.height
  const ratio = relativeY / height
  
  if (isContainer) {
    // For containers: top 25% = before, middle 50% = inside, bottom 25% = after
    if (ratio < DROP_ZONE_THRESHOLD) return "before"
    if (ratio > 1 - DROP_ZONE_THRESHOLD) return "after"
    return "inside"
  }
  
  // For non-containers: top 50% = before, bottom 50% = after
  return ratio < 0.5 ? "before" : "after"
}

// ============================================================================
// AUTO-SCROLL HOOK
// ============================================================================

/**
 * Hook to handle auto-scrolling when dragging near container edges
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  config: Partial<AutoScrollConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_AUTO_SCROLL_CONFIG, ...config }
  const animationFrameRef = useRef<number | null>(null)
  const scrollDirectionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  
  const startAutoScroll = useCallback((direction: { x: number; y: number }) => {
    scrollDirectionRef.current = direction
    
    if (animationFrameRef.current !== null) return
    
    const scroll = () => {
      const container = containerRef.current
      if (!container || !mergedConfig.enabled) {
        animationFrameRef.current = null
        return
      }
      
      const { x, y } = scrollDirectionRef.current
      
      if (x !== 0 || y !== 0) {
        container.scrollBy({
          left: x * mergedConfig.speed,
          top: y * mergedConfig.speed,
        })
        animationFrameRef.current = requestAnimationFrame(scroll)
      } else {
        animationFrameRef.current = null
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(scroll)
  }, [containerRef, mergedConfig.enabled, mergedConfig.speed])
  
  const stopAutoScroll = useCallback(() => {
    scrollDirectionRef.current = { x: 0, y: 0 }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])
  
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container || !mergedConfig.enabled) return
    
    const rect = container.getBoundingClientRect()
    const { threshold } = mergedConfig
    
    let x = 0
    let y = 0
    
    // Check horizontal edges
    if (clientX < rect.left + threshold) {
      x = -1 // Scroll left
    } else if (clientX > rect.right - threshold) {
      x = 1 // Scroll right
    }
    
    // Check vertical edges
    if (clientY < rect.top + threshold) {
      y = -1 // Scroll up
    } else if (clientY > rect.bottom - threshold) {
      y = 1 // Scroll down
    }
    
    if (x !== 0 || y !== 0) {
      startAutoScroll({ x, y })
    } else {
      stopAutoScroll()
    }
  }, [containerRef, mergedConfig.enabled, mergedConfig.threshold, startAutoScroll, stopAutoScroll])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  return {
    handleDragMove,
    stopAutoScroll,
  }
}

// ============================================================================
// DROP INDICATOR COMPONENT
// ============================================================================

/**
 * Visual indicator showing where a block will be dropped
 */
export function DropIndicator({
  isVisible,
  position,
  depth = 0,
  targetId,
  targetType,
}: DropIndicatorProps) {
  if (!isVisible) return null
  
  const colors = targetType ? BLOCK_COLORS[targetType] : { bg: "bg-primary", border: "border-primary" }
  
  // Inside indicator (for containers)
  if (position === "inside") {
    return (
      <div
        className={cn(
          "absolute inset-0 rounded-md pointer-events-none z-10",
          "border-2 border-dashed",
          colors.border,
          "bg-primary/5",
          "animate-in fade-in-0 duration-150"
        )}
        style={{ marginLeft: depth * 12 }}
      >
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "px-1.5 py-0.5 rounded text-[10px] font-medium",
          "bg-primary text-primary-foreground"
        )}>
          Drop inside
        </div>
      </div>
    )
  }
  
  // Before/After indicator (insertion line)
  return (
    <div
      className={cn(
        "absolute left-0 right-0 h-0.5 pointer-events-none z-10",
        position === "before" ? "-top-px" : "-bottom-px",
        "animate-in fade-in-0 slide-in-from-left-2 duration-150"
      )}
      style={{ marginLeft: depth * 12 + 8 }}
    >
      {/* Line */}
      <div className={cn("h-full rounded-full", colors.bg)} />
      
      {/* Circle indicator at start */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -left-1",
          "w-2 h-2 rounded-full",
          colors.bg
        )}
      />
    </div>
  )
}

// ============================================================================
// DRAG PREVIEW COMPONENT
// ============================================================================

/**
 * Custom drag preview showing block info (matches requested interface)
 */
export function DragPreview({ block, count = 1 }: DragPreviewProps) {
  const Icon = BLOCK_ICONS[block.type]
  const colors = BLOCK_COLORS[block.type]
  const name = BLOCK_NAMES[block.type]
  
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-md",
        "bg-background/95 backdrop-blur-sm",
        "border shadow-lg",
        "pointer-events-none select-none",
        "animate-in zoom-in-95 duration-150"
      )}
    >
      {/* Block icon with color */}
      <div className={cn(
        "flex items-center justify-center w-5 h-5 rounded",
        colors.bg.replace("bg-", "bg-").replace("/10", "/20")
      )}>
        <HugeiconsIcon icon={Icon} className={cn("h-3 w-3", colors.text)} />
      </div>
      
      {/* Block name */}
      <span className="text-xs font-medium truncate max-w-[120px]">
        {name}
      </span>
      
      {/* Count badge for multiple blocks */}
      {count > 1 && (
        <div className={cn(
          "flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1 rounded-full",
          "bg-violet-500 text-white",
          "text-[10px] font-semibold"
        )}>
          {count}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MULTI-BLOCK DRAG PREVIEW
// ============================================================================

/**
 * Stacked preview for dragging multiple blocks (internal use)
 */
export function MultiBlockDragPreview({ blocks, count }: MultiDragPreviewProps) {
  if (blocks.length === 0) return null
  
  // Show up to 3 stacked previews
  const visibleBlocks = blocks.slice(0, 3)
  const primaryBlock = blocks[0]
  
  return (
    <div className="relative">
      {/* Stacked background cards */}
      {visibleBlocks.length > 1 && (
        <>
          {visibleBlocks.length > 2 && (
            <div
              className={cn(
                "absolute inset-0 rounded-md bg-muted/50 border",
                "transform translate-x-2 translate-y-2"
              )}
            />
          )}
          <div
            className={cn(
              "absolute inset-0 rounded-md bg-muted/70 border",
              "transform translate-x-1 translate-y-1"
            )}
          />
        </>
      )}
      
      {/* Main preview */}
      <DragPreview block={primaryBlock} count={count} />
    </div>
  )
}

// ============================================================================
// NESTED DROP ZONE COMPONENT
// ============================================================================

/**
 * Drop zone inside container blocks for accepting child blocks
 */
export function NestedDropZone({
  containerId,
  isActive,
  onDrop,
  children,
  acceptedTypes,
  className,
}: NestedDropZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `nested-${containerId}`,
    data: {
      containerId,
      type: "nested-drop-zone",
      acceptedTypes,
    },
  })
  
  // Determine if the current drag item is valid for this drop zone
  const isValidDrop = useMemo(() => {
    if (!active?.data?.current) return true
    if (!acceptedTypes || acceptedTypes.length === 0) return true
    
    const draggedType = active.data.current.type as BlockType | undefined
    if (!draggedType) return true
    
    return acceptedTypes.includes(draggedType)
  }, [active, acceptedTypes])
  
  const showDropFeedback = isActive && isOver
  const showInvalidFeedback = isActive && isOver && !isValidDrop
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[40px] rounded-md transition-all duration-200",
        // Active state (dragging is happening)
        isActive && !isOver && "border-2 border-dashed border-muted-foreground/20",
        // Hover state (dragging over this zone)
        showDropFeedback && isValidDrop && [
          "border-2 border-dashed border-primary",
          "bg-primary/5",
          "ring-2 ring-primary/20",
        ],
        // Invalid drop state
        showInvalidFeedback && [
          "border-2 border-dashed border-destructive",
          "bg-destructive/5",
        ],
        className
      )}
      data-container-id={containerId}
    >
      {/* Drop feedback overlay */}
      {showDropFeedback && isValidDrop && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "pointer-events-none z-10"
        )}>
          <div className={cn(
            "px-2 py-1 rounded-md",
            "bg-primary text-primary-foreground",
            "text-[10px] font-medium",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}>
            Drop here
          </div>
        </div>
      )}
      
      {/* Invalid drop feedback */}
      {showInvalidFeedback && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "pointer-events-none z-10"
        )}>
          <div className={cn(
            "px-2 py-1 rounded-md",
            "bg-destructive text-destructive-foreground",
            "text-[10px] font-medium",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}>
            Cannot drop here
          </div>
        </div>
      )}
      
      {/* Children content */}
      <div className={cn(
        "relative",
        showDropFeedback && "opacity-50"
      )}>
        {children}
      </div>
      
      {/* Empty state placeholder */}
      {!children && (
        <div className={cn(
          "flex items-center justify-center h-full min-h-[40px]",
          "text-[10px] text-muted-foreground/50"
        )}>
          {isActive ? "Drop blocks here" : "Empty container"}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// USE DROP ZONE HOOK
// ============================================================================

/**
 * Hook to manage drop zone state for a block
 */
export function useDropZone(config: DropZoneConfig): DropZoneState & {
  dropRef: React.RefObject<HTMLDivElement>
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: () => void
} {
  const { blockId, block, allBlocks, draggedBlockId, draggedBlocks = [] } = config
  const dropRef = useRef<HTMLDivElement>(null)
  
  const [state, setState] = useState<DropZoneState>({
    isOver: false,
    position: null,
    targetId: null,
    canDrop: false,
  })
  
  const isContainer = isContainerBlock(block)
  
  // Calculate if drop is valid
  const canDrop = useMemo(() => {
    if (!draggedBlockId || draggedBlockId === blockId) return false
    
    const draggedBlock = findBlockById(allBlocks, draggedBlockId)
    if (!draggedBlock) return false
    
    // Check all dragged blocks if multi-select
    for (const db of draggedBlocks.length > 0 ? draggedBlocks : [draggedBlock]) {
      if (!canDropAtPosition(db, block, state.position || "after", allBlocks)) {
        return false
      }
    }
    
    return true
  }, [draggedBlockId, blockId, block, allBlocks, draggedBlocks, state.position])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!draggedBlockId || !dropRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = dropRef.current.getBoundingClientRect()
    const position = calculateDropPosition(e.clientY, rect, isContainer)
    
    setState({
      isOver: true,
      position,
      targetId: blockId,
      canDrop,
    })
  }, [draggedBlockId, blockId, isContainer, canDrop])
  
  const handleDragLeave = useCallback(() => {
    setState({
      isOver: false,
      position: null,
      targetId: null,
      canDrop: false,
    })
  }, [])
  
  return {
    ...state,
    canDrop,
    dropRef: dropRef as React.RefObject<HTMLDivElement>,
    handleDragOver,
    handleDragLeave,
  }
}

// ============================================================================
// USE LAYERS DND HOOK
// ============================================================================

export interface UseLayersDndOptions {
  blocks: StoreBlock[]
  selectedBlockIds: Set<string>
  onMoveBlock: (fromIndex: number, toIndex: number) => void
  onMoveBlockToContainer?: (blockId: string, containerId: string, index?: number) => void
  onMoveBlockWithinContainer?: (containerId: string, fromIndex: number, toIndex: number) => void
  containerRef?: React.RefObject<HTMLElement | null>
  autoScrollConfig?: Partial<AutoScrollConfig>
}

export interface UseLayersDndReturn {
  dragState: DragState
  handleDragStart: (e: DragStartEvent) => void
  handleDragMove: (e: DragMoveEvent) => void
  handleDragOver: (e: DragOverEvent) => void
  handleDragEnd: (e: DragEndEvent) => void
  handleDragCancel: () => void
  getDragOverlay: () => React.ReactNode
}

/**
 * Main hook for managing layers panel drag and drop
 */
export function useLayersDnd(options: UseLayersDndOptions): UseLayersDndReturn {
  const { 
    blocks, 
    selectedBlockIds, 
    onMoveBlock, 
    onMoveBlockToContainer, 
    onMoveBlockWithinContainer,
    containerRef,
    autoScrollConfig,
  } = options
  
  // Auto-scroll support
  const defaultContainerRef = useRef<HTMLElement | null>(null)
  const scrollContainerRef = containerRef || defaultContainerRef
  const { handleDragMove: handleAutoScroll, stopAutoScroll } = useAutoScroll(
    scrollContainerRef,
    autoScrollConfig
  )
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedBlockId: null,
    draggedBlocks: [],
    dropTarget: {
      id: null,
      position: null,
    },
  })
  
  // Get all blocks being dragged (selected blocks if dragging a selected block)
  const getDraggedBlocks = useCallback((blockId: string): StoreBlock[] => {
    const block = findBlockById(blocks, blockId)
    if (!block) return []
    
    // If the dragged block is selected and there are multiple selections,
    // drag all selected blocks
    if (selectedBlockIds.has(blockId) && selectedBlockIds.size > 1) {
      return Array.from(selectedBlockIds)
        .map(id => findBlockById(blocks, id))
        .filter((b): b is StoreBlock => b !== undefined)
    }
    
    return [block]
  }, [blocks, selectedBlockIds])
  
  const handleDragStart = useCallback((e: DragStartEvent) => {
    const blockId = e.active.id as string
    const draggedBlocks = getDraggedBlocks(blockId)
    
    setDragState({
      isDragging: true,
      draggedBlockId: blockId,
      draggedBlocks,
      dropTarget: { id: null, position: null },
    })
  }, [getDraggedBlocks])
  
  const handleDragMove = useCallback((e: DragMoveEvent) => {
    // Handle auto-scroll when dragging near edges
    const event = e.activatorEvent as MouseEvent
    if (event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
      handleAutoScroll(event.clientX, event.clientY)
    }
  }, [handleAutoScroll])
  
  const handleDragOver = useCallback((e: DragOverEvent) => {
    const overId = e.over?.id as string | undefined
    
    if (!overId || overId === dragState.draggedBlockId) {
      setDragState(prev => ({
        ...prev,
        dropTarget: { id: null, position: null },
      }))
      return
    }
    
    const overBlock = findBlockById(blocks, overId)
    if (!overBlock) return
    
    // Calculate position based on collision data
    const isContainer = isContainerBlock(overBlock)
    let position: DropPosition = "after"
    
    // Use collision rect to determine position
    if (e.over?.rect) {
      const rect = e.over.rect
      const pointerY = (e.activatorEvent as MouseEvent)?.clientY ?? 0
      
      if (pointerY && rect.top && rect.height) {
        const relativeY = pointerY - rect.top
        const ratio = relativeY / rect.height
        
        if (isContainer) {
          if (ratio < DROP_ZONE_THRESHOLD) position = "before"
          else if (ratio > 1 - DROP_ZONE_THRESHOLD) position = "after"
          else position = "inside"
        } else {
          position = ratio < 0.5 ? "before" : "after"
        }
      }
    }
    
    // Validate drop
    const draggedBlock = findBlockById(blocks, dragState.draggedBlockId!)
    if (draggedBlock && !canDropAtPosition(draggedBlock, overBlock, position, blocks)) {
      setDragState(prev => ({
        ...prev,
        dropTarget: { id: null, position: null },
      }))
      return
    }
    
    setDragState(prev => ({
      ...prev,
      dropTarget: { id: overId, position },
    }))
  }, [blocks, dragState.draggedBlockId])
  
  const handleDragEnd = useCallback((e: DragEndEvent) => {
    // Stop auto-scroll
    stopAutoScroll()
    
    const { active, over } = e
    const { dropTarget, draggedBlocks } = dragState
    
    if (!over || !dropTarget.id || !dropTarget.position) {
      setDragState({
        isDragging: false,
        draggedBlockId: null,
        draggedBlocks: [],
        dropTarget: { id: null, position: null },
      })
      return
    }
    
    const activeId = active.id as string
    const overId = over.id as string
    
    // Handle the move based on position
    if (dropTarget.position === "inside" && onMoveBlockToContainer) {
      // Move into container
      onMoveBlockToContainer(activeId, overId)
    } else {
      // Reorder at same level
      const fromIndex = blocks.findIndex(b => b.id === activeId)
      let toIndex = blocks.findIndex(b => b.id === overId)
      
      if (fromIndex !== -1 && toIndex !== -1) {
        if (dropTarget.position === "after") {
          toIndex = toIndex + 1
        }
        if (fromIndex < toIndex) {
          toIndex = toIndex - 1
        }
        onMoveBlock(fromIndex, toIndex)
      }
    }
    
    setDragState({
      isDragging: false,
      draggedBlockId: null,
      draggedBlocks: [],
      dropTarget: { id: null, position: null },
    })
  }, [blocks, dragState, onMoveBlock, onMoveBlockToContainer, stopAutoScroll])
  
  const handleDragCancel = useCallback(() => {
    stopAutoScroll()
    setDragState({
      isDragging: false,
      draggedBlockId: null,
      draggedBlocks: [],
      dropTarget: { id: null, position: null },
    })
  }, [stopAutoScroll])
  
  const getDragOverlay = useCallback(() => {
    if (!dragState.isDragging || dragState.draggedBlocks.length === 0) {
      return null
    }
    
    // Use single block preview for one block, multi for multiple
    if (dragState.draggedBlocks.length === 1) {
      return (
        <DragPreview
          block={dragState.draggedBlocks[0]}
          count={1}
        />
      )
    }
    
    return (
      <MultiBlockDragPreview
        blocks={dragState.draggedBlocks}
        count={dragState.draggedBlocks.length}
      />
    )
  }, [dragState.isDragging, dragState.draggedBlocks])
  
  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getDragOverlay,
  }
}

// ============================================================================
// DROPPABLE LAYER ITEM WRAPPER
// ============================================================================

export interface DroppableLayerProps {
  block: StoreBlock
  allBlocks: StoreBlock[]
  dragState: DragState
  depth?: number
  children: React.ReactNode
}

/**
 * Wrapper component that adds drop zone functionality to a layer item
 */
export function DroppableLayer({
  block,
  allBlocks,
  dragState,
  depth = 0,
  children,
}: DroppableLayerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: block.id,
    disabled: dragState.draggedBlockId === block.id,
  })
  
  const isDropTarget = dragState.dropTarget.id === block.id
  const dropPosition = dragState.dropTarget.position
  const isContainer = isContainerBlock(block)
  
  // Determine if this is a valid drop target
  const isValidTarget = useMemo(() => {
    if (!dragState.draggedBlockId || !dropPosition) return false
    
    const draggedBlock = findBlockById(allBlocks, dragState.draggedBlockId)
    if (!draggedBlock) return false
    
    return canDropAtPosition(draggedBlock, block, dropPosition, allBlocks)
  }, [dragState.draggedBlockId, dropPosition, block, allBlocks])
  
  return (
    <div ref={setNodeRef} className="relative">
      {/* Drop indicator */}
      {isDropTarget && isValidTarget && (
        <DropIndicator
          position={dropPosition!}
          isVisible={true}
          targetId={block.id}
          targetType={block.type}
          depth={depth}
        />
      )}
      
      {/* Highlight for container drop */}
      {isDropTarget && isValidTarget && dropPosition === "inside" && (
        <div
          className={cn(
            "absolute inset-0 rounded-md pointer-events-none",
            "ring-2 ring-primary ring-inset",
            "bg-primary/5"
          )}
          style={{ marginLeft: depth * 12 }}
        />
      )}
      
      {children}
    </div>
  )
}

// ============================================================================
// EMPTY DROP ZONE
// ============================================================================

export interface EmptyDropZoneProps {
  containerId?: string
  isVisible: boolean
  onDrop?: () => void
}

/**
 * Drop zone shown when a container is empty
 */
export function EmptyDropZone({ containerId, isVisible, onDrop }: EmptyDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: containerId ? `${containerId}-empty` : "root-empty",
  })
  
  if (!isVisible) return null
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center",
        "h-12 mx-1 my-1 rounded-md",
        "border-2 border-dashed",
        "transition-colors duration-150",
        isOver
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted-foreground/20 text-muted-foreground/50"
      )}
    >
      <span className="text-[10px]">
        {isOver ? "Drop here" : "Drag blocks here"}
      </span>
    </div>
  )
}

// ============================================================================
// DRAG HANDLE COMPONENT
// ============================================================================

export interface DragHandleProps {
  blockId: string
  disabled?: boolean
  className?: string
}

/**
 * Drag handle that can be attached to any element
 */
export function DragHandle({ blockId, disabled, className }: DragHandleProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: blockId,
    disabled,
  })
  
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        "text-muted-foreground/40 hover:text-muted-foreground",
        "transition-colors",
        isDragging && "opacity-50",
        disabled && "cursor-not-allowed opacity-30",
        className
      )}
      disabled={disabled}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        className="pointer-events-none"
      >
        <circle cx="3" cy="3" r="1" />
        <circle cx="9" cy="3" r="1" />
        <circle cx="3" cy="6" r="1" />
        <circle cx="9" cy="6" r="1" />
        <circle cx="3" cy="9" r="1" />
        <circle cx="9" cy="9" r="1" />
      </svg>
    </button>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Components
  DropIndicator,
  DragPreview,
  MultiBlockDragPreview,
  NestedDropZone,
  DroppableLayer,
  EmptyDropZone,
  DragHandle,
  // Hooks
  useDropZone,
  useLayersDnd,
  useAutoScroll,
  // Utilities
  calculateDropPosition,
  canDropAtPosition,
  wouldCreateCircularReference,
}
