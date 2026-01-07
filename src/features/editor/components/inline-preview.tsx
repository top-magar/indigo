"use client"

import { useMemo, useCallback, useRef, useEffect, useState, memo, useId } from "react"
import { cn } from "@/shared/utils"
import { useEditorStore, selectBlocks, selectSelectedBlockId, selectSelectedBlockIds, selectHoveredBlockId, selectViewport, selectEditorMode, selectActiveDragId, selectOverBlockId, selectActiveGuides, selectSnappingEnabled } from "@/features/editor/store"
import type { StoreBlock } from "@/types/blocks"
import type { Product } from "@/components/store/blocks/product-grid"
import type { FeaturedProduct } from "@/components/store/blocks/featured-product"
import { VIEWPORT_CONFIG } from "@/features/editor/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DragDropVerticalIcon,
  ViewIcon,
  ViewOffIcon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS, BLOCK_BG_COLORS } from "@/features/editor/block-constants"
import { EditorCartProvider } from "@/features/store/editor-cart-provider"
import { AnimatedDropIndicator } from "@/features/editor/components"
import { BlockGhostPreview } from "@/features/editor/components"
import { SmartGuides } from "@/features/editor/components"
import { ResizeHandles } from "@/features/editor/components"
import { isResizableBlock, getResizeCapabilities } from "@/features/editor/hooks/use-block-resize"
import { calculateGuides, getAllBlockBounds, getBlockBounds } from "@/features/editor/guides"

// Block components
import { BlockActionBar, BlockActions } from "@/components/store/blocks/block-action-bar"
import { MotionWrapper } from "@/features/editor/animations/motion-wrapper"
import { HeaderBlock } from "@/components/store/blocks/header"
import { HeroBlock } from "@/components/store/blocks/hero"
import { FeaturedProductBlock } from "@/components/store/blocks/featured-product"
import { ProductGridBlock } from "@/components/store/blocks/product-grid"
import { PromoBannerBlock } from "@/components/store/blocks/promotional-banner"
import { TestimonialsBlock } from "@/components/store/blocks/testimonials"
import { TrustSignalsBlock } from "@/components/store/blocks/trust-signals"
import { NewsletterBlock } from "@/components/store/blocks/newsletter"
import { FooterBlock } from "@/components/store/blocks/footer"
import { RichTextBlock } from "@/components/store/blocks/rich-text"

// Container and Primitive blocks
import { SectionBlock } from "@/components/store/blocks/section"
import { ColumnsBlock, ColumnBlock } from "@/components/store/blocks/columns"
import { ImageBlock } from "@/components/store/blocks/image"
import { ButtonBlock } from "@/components/store/blocks/button"

export interface InlinePreviewProps {
  storeSlug: string
  storeName: string
  products?: Product[]
  featuredProducts?: Record<string, FeaturedProduct>
  currency?: string
  cartItemCount?: number
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
  // Zoom controlled from parent (EditorHeader)
  zoom?: number
  onZoomChange?: (zoom: number) => void
}

/**
 * InlinePreview renders blocks directly in the editor's React tree
 * without using an iframe, eliminating postMessage synchronization.
 * 
 * Requirements: 1.1, 1.4 - Render blocks directly without iframe
 * Requirements: 9.1, 9.2, 9.3 - Viewport controls and scaling
 */
export function InlinePreview({
  storeSlug,
  storeName,
  products = [],
  featuredProducts = {},
  currency = "USD",
  cartItemCount = 0,
  onNewsletterSubscribe,
  zoom: externalZoom,
  onZoomChange,
}: InlinePreviewProps) {
  const dndId = useId()
  const blocks = useEditorStore(selectBlocks)
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const selectedBlockIds = useEditorStore(selectSelectedBlockIds)
  const hoveredBlockId = useEditorStore(selectHoveredBlockId)
  const viewport = useEditorStore(selectViewport)
  const editorMode = useEditorStore(selectEditorMode)
  const activeDragId = useEditorStore(selectActiveDragId)
  const overBlockId = useEditorStore(selectOverBlockId)
  const activeGuides = useEditorStore(selectActiveGuides)
  const snappingEnabled = useEditorStore(selectSnappingEnabled)
  const { selectBlock, hoverBlock, moveBlock, setActiveDragId, setOverBlockId, duplicateBlock, removeBlock, updateBlock, duplicateSelectedBlocks, removeSelectedBlocks, setActiveGuides, clearGuides } = useEditorStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const previewContentRef = useRef<HTMLDivElement>(null)
  const [autoScale, setAutoScale] = useState(1)
  const [deleteConfirmBlockId, setDeleteConfirmBlockId] = useState<string | null>(null)

  // Sort blocks by order
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  )

  // Get the block being dragged for overlay
  const activeDragBlock = useMemo(
    () => activeDragId ? sortedBlocks.find(b => b.id === activeDragId) ?? null : null,
    [activeDragId, sortedBlocks]
  )

  // Get viewport dimensions
  const viewportConfig = VIEWPORT_CONFIG[viewport]
  const viewportWidth = viewportConfig.width
  // Use external zoom if provided, otherwise use auto-calculated scale
  const effectiveScale = externalZoom ?? autoScale

  // DnD sensors - same as visual-editor for consistency
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (editorMode === 'preview') return
    setActiveDragId(event.active.id as string)
  }, [editorMode, setActiveDragId])

  // Handle drag over - track which block we're hovering over for drop indicator
  // Also calculate smart guides for alignment
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (editorMode === 'preview') return
    const { over, active } = event
    setOverBlockId(over?.id as string | null)

    // Calculate smart guides if snapping is enabled
    if (snappingEnabled && previewContentRef.current && active) {
      const dragElement = document.querySelector(`[data-block-id="${active.id}"]`) as HTMLElement
      if (dragElement) {
        const containerBounds = previewContentRef.current.getBoundingClientRect()
        const dragBounds = getBlockBounds(dragElement, active.id as string)
        const otherBounds = getAllBlockBounds(previewContentRef.current, active.id as string)

        const result = calculateGuides(dragBounds, otherBounds, containerBounds)
        setActiveGuides(result.guides)
      }
    }
  }, [editorMode, setOverBlockId, snappingEnabled, setActiveGuides])

  // Handle drag end - update block order via Editor Store
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null)
    setOverBlockId(null)
    clearGuides() // Clear smart guides
    if (editorMode === 'preview') return

    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id)
    const newIndex = sortedBlocks.findIndex((b) => b.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      moveBlock(oldIndex, newIndex)
    }
  }, [editorMode, sortedBlocks, moveBlock, setActiveDragId, setOverBlockId, clearGuides])

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
    setOverBlockId(null)
    clearGuides() // Clear smart guides
  }, [setActiveDragId, setOverBlockId, clearGuides])

  // Calculate scale to fit container (only when no external zoom)
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || externalZoom !== undefined) return
      const containerWidth = containerRef.current.clientWidth - 64 // padding
      const containerHeight = containerRef.current.clientHeight - 64
      const viewportHeight = viewportConfig.height + (viewport === 'desktop' ? 40 : 0)

      const scaleX = containerWidth / viewportWidth
      const scaleY = containerHeight / viewportHeight
      const newScale = Math.min(1, scaleX, scaleY)
      setAutoScale(newScale)
    }

    updateScale()
    const resizeObserver = new ResizeObserver(updateScale)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [viewportWidth, viewportConfig.height, viewport, externalZoom])

  // Pinch-to-zoom gesture handler (trackpad pinch reports as wheel + ctrlKey)
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onZoomChange) return

    const handleWheel = (e: WheelEvent) => {
      // Pinch gestures on trackpad report as wheel events with ctrlKey
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const currentZoom = externalZoom ?? autoScale
        const delta = -e.deltaY * 0.01 // Invert and scale for natural feel
        const newZoom = Math.min(1.5, Math.max(0.25, currentZoom + delta))
        onZoomChange(newZoom)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [externalZoom, autoScale, onZoomChange])

  // Handle block selection with multi-select support
  const handleBlockClick = useCallback((blockId: string, event: React.MouseEvent) => {
    if (editorMode === 'preview') return

    // Determine selection mode based on modifier keys
    if (event.shiftKey) {
      selectBlock(blockId, 'add')
    } else if (event.metaKey || event.ctrlKey) {
      selectBlock(blockId, 'toggle')
    } else {
      selectBlock(blockId, 'replace')
    }
  }, [editorMode, selectBlock])

  // Handle block hover
  const handleBlockHover = useCallback((blockId: string | null) => {
    if (editorMode === 'preview') return
    hoverBlock(blockId)
  }, [editorMode, hoverBlock])

  // Block action handlers (Requirements 8.3, 8.4, 8.5)
  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      moveBlock(index, index - 1)
    }
  }, [moveBlock])

  const handleMoveDown = useCallback((index: number, totalBlocks: number) => {
    if (index < totalBlocks - 1) {
      moveBlock(index, index + 1)
    }
  }, [moveBlock])

  const handleDuplicate = useCallback((blockId: string) => {
    duplicateBlock(blockId)
  }, [duplicateBlock])

  const handleDeleteRequest = useCallback((blockId: string) => {
    setDeleteConfirmBlockId(blockId)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmBlockId) {
      removeBlock(deleteConfirmBlockId)
      setDeleteConfirmBlockId(null)
    }
  }, [deleteConfirmBlockId, removeBlock])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmBlockId(null)
  }, [])

  const handleToggleVisibility = useCallback((blockId: string, currentVisible: boolean) => {
    updateBlock(blockId, { visible: !currentVisible })
  }, [updateBlock])

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      {/* Preview container with dotted background */}
      <div
        ref={containerRef}
        className="relative min-h-0 w-full min-w-0 flex-1 overflow-auto p-8"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Viewport container */}
        <div
          className="mx-auto origin-top transition-transform duration-300 ease-out"
          style={{
            width: viewportWidth,
            transform: `scale(${effectiveScale})`,
          }}
          data-testid="inline-preview-viewport"
          data-viewport={viewport}
          data-viewport-width={viewportWidth}
        >
          {/* Preview frame */}
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            {/* Browser chrome for desktop */}
            {viewport === 'desktop' && (
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-background border px-3 py-1.5 text-xs text-muted-foreground max-w-md w-full">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="truncate">/store/{storeSlug}</span>
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
            )}

            {/* Mobile device frame */}
            {viewport === 'mobile' && (
              <div className="relative h-7 bg-gray-900 dark:bg-gray-700 rounded-t-xl">
                <div className="absolute left-1/2 top-1 -translate-x-1/2 h-5 w-28 rounded-full bg-black" />
              </div>
            )}

            {/* Block content area - wrapped with EditorCartProvider for header components */}
            <EditorCartProvider itemCount={cartItemCount}>
              <div
                ref={previewContentRef}
                className="bg-background min-h-[400px] relative"
                style={{
                  minHeight: viewport === 'mobile'
                    ? viewportConfig.height - 48
                    : viewport === 'tablet'
                      ? viewportConfig.height
                      : viewportConfig.height - 40,
                }}
              >
                {/* Smart guides overlay */}
                {activeDragId && activeGuides.length > 0 && (
                  <SmartGuides guides={activeGuides} containerRef={previewContentRef} />
                )}

                <DndContext
                  id={dndId}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={sortedBlocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex min-h-full flex-col">
                      {sortedBlocks.map((block, index) => (
                        <SortableBlockWrapper
                          key={block.id}
                          block={block}
                          index={index}
                          totalBlocks={sortedBlocks.length}
                          isSelected={selectedBlockIds.includes(block.id)}
                          isHovered={hoveredBlockId === block.id}
                          isDragging={activeDragId === block.id}
                          isDropTarget={overBlockId === block.id && activeDragId !== block.id}
                          activeDragId={activeDragId}
                          activeDragBlock={activeDragBlock}
                          editorMode={editorMode}
                          selectedCount={selectedBlockIds.length}
                          onClick={(e) => handleBlockClick(block.id, e)}
                          onMouseEnter={() => handleBlockHover(block.id)}
                          onMouseLeave={() => handleBlockHover(null)}
                          onMoveUp={() => handleMoveUp(index)}
                          onMoveDown={() => handleMoveDown(index, sortedBlocks.length)}
                          onDuplicate={() => selectedBlockIds.length > 1 ? duplicateSelectedBlocks() : handleDuplicate(block.id)}
                          onDelete={() => selectedBlockIds.length > 1 ? removeSelectedBlocks() : handleDeleteRequest(block.id)}
                          onToggleVisibility={() => handleToggleVisibility(block.id, block.visible)}
                        >
                          <MotionWrapper
                            animation={(block as any).animation}
                          >
                            <MemoizedBlockComponent
                              block={block}
                              storeName={storeName}
                              storeSlug={storeSlug}
                              cartItemCount={cartItemCount}
                              products={products}
                              featuredProducts={featuredProducts}
                              currency={currency}
                              onNewsletterSubscribe={onNewsletterSubscribe}
                            />
                          </MotionWrapper>
                        </SortableBlockWrapper>
                      ))}
                    </div>
                  </SortableContext>

                  {/* Drag overlay for visual feedback (Requirements 2.4, 2.5, 2.6) */}
                  <DragOverlay dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    sideEffects: ({ active }) => {
                      // Add smooth animation class to the active element
                      if (active.node) {
                        active.node.style.transition = 'transform 250ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 200ms ease-out'
                      }
                    },
                  }}>
                    {activeDragBlock && (
                      <InlinePreviewDragPreview block={activeDragBlock} />
                    )}
                  </DragOverlay>
                </DndContext>
              </div>
            </EditorCartProvider>

            {/* Mobile home indicator */}
            {viewport === 'mobile' && (
              <div className="flex h-5 items-center justify-center bg-gray-900 dark:bg-gray-700 rounded-b-xl">
                <div className="h-1 w-32 rounded-full bg-white/30" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog (Requirement 8.5) */}
      <AlertDialog open={deleteConfirmBlockId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this block? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


/**
 * SortableBlockWrapper provides selection/hover states and drag-and-drop
 * capabilities for blocks in edit mode using dnd-kit's useSortable hook.
 * In preview mode, it renders children without interaction handlers.
 * 
 * Memoized to prevent unnecessary re-renders when other blocks change.
 * 
 * Requirements: 7.1, 7.3 - Drag-and-drop reordering with dnd-kit
 * Requirements: 7.2, 7.4 - Drag preview and drop indicators
 * Requirements: 8.1, 8.2 - Block action bar on selection/hover
 * Requirements: 10.1 - Use React.memo to prevent unnecessary re-renders
 */
interface SortableBlockWrapperProps {
  block: StoreBlock
  index: number
  totalBlocks: number
  isSelected: boolean
  isHovered: boolean
  isDragging: boolean
  isDropTarget: boolean
  activeDragId: string | null
  activeDragBlock: StoreBlock | null
  editorMode: 'edit' | 'preview'
  selectedCount: number
  onClick: (e: React.MouseEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleVisibility: () => void
  children: React.ReactNode
}

const SortableBlockWrapper = memo(function SortableBlockWrapper({
  block,
  index,
  totalBlocks,
  isSelected,
  isHovered,
  isDragging,
  isDropTarget,
  activeDragId,
  activeDragBlock,
  editorMode,
  selectedCount,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  children,
}: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: block.id,
    disabled: editorMode === 'preview' || block.locked,
    data: {
      type: 'block',
      block,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // In preview mode, just render children without interaction
  if (editorMode === 'preview') {
    return <>{children}</>
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(e)
  }, [onClick])

  const isCurrentlyDragging = isDragging || isSortableDragging
  const showDropIndicator = isDropTarget && activeDragId !== null
  const isLocked = block.locked ?? false
  const canMoveUp = index > 0 && !isLocked
  const canMoveDown = index < totalBlocks - 1 && !isLocked
  const isMultiSelected = isSelected && selectedCount > 1

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      data-block-type={block.type}
      data-block-index={index}
      className={cn(
        "relative cursor-pointer group",
        // Base transition for smooth animations (Requirements 2.5, 2.6)
        "transition-all duration-200 ease-out",
        // Hover state
        isHovered && !isSelected && !isCurrentlyDragging && "ring-2 ring-blue-400/50 ring-offset-2",
        // Selected state - different color for multi-select
        isSelected && !isCurrentlyDragging && !isMultiSelected && "ring-2 ring-primary ring-offset-2",
        isSelected && !isCurrentlyDragging && isMultiSelected && "ring-2 ring-violet-500 ring-offset-2",
        // Hidden block styling
        !block.visible && "opacity-50",
        // Dragging state - enhanced visual feedback (Requirement 2.4)
        isCurrentlyDragging && [
          "opacity-40 scale-[0.98] z-50",
          "ring-2 ring-primary/30 ring-offset-2",
          "shadow-lg shadow-primary/10",
          "transition-transform duration-150 ease-out"
        ],
        // Drop target - magnetic zone highlight with glow
        showDropIndicator && [
          "ring-2 ring-primary ring-offset-4",
          "bg-primary/5",
          "shadow-md shadow-primary/10"
        ]
      )}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Animated drop indicator - enhanced with glow effect (Requirements 2.1, 2.2) */}
      {showDropIndicator && (
        <AnimatedDropIndicator position="above" animated={true} />
      )}

      {/* Ghost preview showing final position (Requirement 2.3) */}
      {showDropIndicator && activeDragBlock && (
        <div className="absolute -top-20 left-0 right-0 z-40 px-2">
          <BlockGhostPreview
            block={activeDragBlock}
            targetIndex={index}
            totalBlocks={totalBlocks}
          />
        </div>
      )}

      {/* Block type label - shows selection count for multi-select */}
      {(isSelected || isHovered) && !isCurrentlyDragging && (
        <div
          className={cn(
            "absolute -top-7 left-2 z-50 px-2 py-1 text-xs font-medium rounded-t-md flex items-center gap-1.5",
            isSelected && !isMultiSelected
              ? "bg-primary text-primary-foreground"
              : isSelected && isMultiSelected
                ? "bg-violet-500 text-white"
                : "bg-blue-500 text-white"
          )}
        >
          {isLocked && (
            <HugeiconsIcon icon={LockIcon} className="h-3 w-3" />
          )}
          {isMultiSelected && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
              {selectedCount} selected
            </span>
          )}
          {block.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </div>
      )}

      {/* Block action bar - shows on selection or hover (Requirements 8.1, 8.2) */}
      {(isSelected || isHovered) && !isCurrentlyDragging && (
        <BlockActionBar
          position="top"
          className="!top-[-36px] !left-auto !right-2 !translate-x-0 !translate-y-0 py-0.5 px-1 shadow-md border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <BlockActions
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          />
          <BlockActionBar.Separator />
          <BlockActionBar.Action
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
            label={block.visible ? "Hide block" : "Show block"}
          >
            <HugeiconsIcon
              icon={block.visible ? ViewIcon : ViewOffIcon}
              className="h-4 w-4"
            />
          </BlockActionBar.Action>
        </BlockActionBar>
      )}

      {/* Drag handle - visible on hover or selection (not for locked blocks) */}
      {(isSelected || isHovered) && !isCurrentlyDragging && !isLocked && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-8 top-1/2 -translate-y-1/2 z-50",
            "flex items-center justify-center w-6 h-8 rounded-md",
            "bg-background border shadow-sm cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isSelected && "opacity-100"
          )}
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Hidden block overlay */}
      {!block.visible && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center z-10">
          <span className="text-muted-foreground font-medium">Hidden</span>
        </div>
      )}

      {/* Resize handles - shown on selected resizable blocks */}
      {isSelected && !isCurrentlyDragging && isResizableBlock(block.type) && (
        <ResizeHandles
          isSelected={isSelected}
          showAllHandles={false}
          disabled={isMultiSelected}
        />
      )}

      {/* Block content - pointer-events-none to prevent clicks on links/buttons */}
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  )
})

/**
 * InlinePreviewDragPreview - Styled drag preview for inline preview
 * Matches the layers panel drag preview style for visual consistency.
 * 
 * Memoized to prevent unnecessary re-renders.
 * 
 * Requirements: 7.2 - Show drag preview during drag
 * Requirements: 7.4 - Sync with layers panel drag state
 * Requirements: 10.1 - Use React.memo to prevent unnecessary re-renders
 */
interface InlinePreviewDragPreviewProps {
  block: StoreBlock
}

const InlinePreviewDragPreview = memo(function InlinePreviewDragPreview({ block }: InlinePreviewDragPreviewProps) {
  const blockMeta = BLOCK_REGISTRY[block.type]
  const BlockIcon = BLOCK_ICONS[block.type]
  const blockColor = BLOCK_TEXT_COLORS[block.type]
  const bgColor = BLOCK_BG_COLORS[block.type]

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 border-primary bg-background px-4 py-3",
        "pointer-events-none select-none",
        // Enhanced shadow and animation (Requirements 2.4, 2.5)
        "shadow-2xl shadow-primary/20",
        "animate-in zoom-in-95 fade-in duration-150"
      )}
      style={{ width: 280 }}
      data-testid="inline-preview-drag-preview"
    >
      <div className={cn("shrink-0 p-2 rounded-md", bgColor)}>
        <HugeiconsIcon icon={BlockIcon} className={cn("h-5 w-5", blockColor)} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{blockMeta?.name || block.type}</span>
        <span className="text-xs text-muted-foreground">Drag to reorder</span>
      </div>
    </div>
  )
})

/**
 * BlockComponent renders the appropriate block based on type.
 * Supports nested rendering for container blocks.
 * Memoized to prevent unnecessary re-renders.
 */
interface BlockComponentProps {
  block: StoreBlock
  storeName: string
  storeSlug: string
  cartItemCount: number
  products: Product[]
  featuredProducts: Record<string, FeaturedProduct>
  currency: string
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

const MemoizedBlockComponent = memo(function BlockComponent({
  block,
  storeName,
  storeSlug,
  cartItemCount,
  products,
  featuredProducts,
  currency,
  onNewsletterSubscribe,
}: BlockComponentProps) {
  // Helper to render children for container blocks
  const renderChildren = (children: StoreBlock[]) => {
    return children.map((child) => (
      <MemoizedBlockComponent
        key={child.id}
        block={child}
        storeName={storeName}
        storeSlug={storeSlug}
        cartItemCount={cartItemCount}
        products={products}
        featuredProducts={featuredProducts}
        currency={currency}
        onNewsletterSubscribe={onNewsletterSubscribe}
      />
    ))
  }

  switch (block.type) {
    case "header":
      return (
        <HeaderBlock
          block={block}
          storeName={storeName}
          storeSlug={storeSlug}
          cartItemCount={cartItemCount}
        />
      )

    case "hero":
      const heroProduct = block.settings.featuredProductId
        ? featuredProducts[block.settings.featuredProductId]
        : undefined
      return <HeroBlock block={block} product={heroProduct} />

    case "featured-product":
      const featuredProduct = featuredProducts[block.settings.productId]
      if (!featuredProduct) return null
      return (
        <FeaturedProductBlock
          block={block}
          product={featuredProduct}
          storeSlug={storeSlug}
          currency={currency}
        />
      )

    case "product-grid":
      let gridProducts = products
      if (block.settings.productIds?.length) {
        gridProducts = products.filter((p) => block.settings.productIds?.includes(p.id))
      }
      return (
        <ProductGridBlock
          block={block}
          products={gridProducts}
          storeSlug={storeSlug}
          currency={currency}
        />
      )

    case "promotional-banner":
      return <PromoBannerBlock block={block} />

    case "testimonials":
      return <TestimonialsBlock block={block} />

    case "trust-signals":
      return <TrustSignalsBlock block={block} />

    case "newsletter":
      return <NewsletterBlock block={block} onSubscribe={onNewsletterSubscribe} />

    case "footer":
      return <FooterBlock block={block} storeName={storeName} />

    case "rich-text":
      return <RichTextBlock block={block} />

    // Container blocks - render with actual components
    case "section":
      return (
        <SectionBlock block={block as any}>
          {renderChildren((block as any).children || [])}
        </SectionBlock>
      )

    case "columns":
      return (
        <ColumnsBlock block={block as any}>
          {((block as any).children || []).map((column: StoreBlock) => (
            <ColumnBlock key={column.id} block={column as any}>
              {renderChildren((column as any).children || [])}
            </ColumnBlock>
          ))}
        </ColumnsBlock>
      )

    case "column":
      // Column is rendered by parent Columns block
      return null

    // Primitive blocks - render with actual components
    case "image":
      return <ImageBlock block={block as any} />

    case "button":
      return <ButtonBlock block={block as any} />

    default:
      return null
  }
})
