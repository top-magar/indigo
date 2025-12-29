"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Cancel01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  DragDropVerticalIcon,
  Edit02Icon,
  Copy01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  ZoomInAreaIcon,
  ArrowRight01Icon,
  ArrowDown01Icon as ChevronDownIcon,
  LockIcon,
  SquareUnlock02Icon,
  Link01Icon,
  Unlink01Icon,
  PaintBrushIcon,
  AiPhone01Icon,
  LaptopIcon,
  TabletConnectedWifiIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { isContainerBlock, flattenBlocks } from "@/types/blocks"
import { BLOCK_REGISTRY, getVariantMeta } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_COLORS } from "@/lib/editor/block-constants"
import { BlockPalette } from "./block-palette"
import {
  useEditorStore,
  selectBlocks,
  selectSelectedBlockId,
  selectSelectedBlockIds,
  selectHoveredBlockId,
} from "@/lib/editor/store"

// ============================================================================
// LAYER ITEM COMPONENT (supports nesting)
// ============================================================================

interface LayerItemProps {
  block: StoreBlock
  index: number
  totalBlocks: number
  isSelected: boolean
  isHovered: boolean
  isDragOverlay?: boolean
  depth?: number
  isExpanded?: boolean
  onToggleExpand?: () => void
  hasChildren?: boolean
  selectedCount?: number
  onSelect?: (e: React.MouseEvent) => void
}

function LayerItem({
  block,
  index,
  totalBlocks,
  isSelected,
  isHovered,
  isDragOverlay = false,
  depth = 0,
  isExpanded = true,
  onToggleExpand,
  hasChildren = false,
  selectedCount = 0,
  onSelect,
}: LayerItemProps) {
  // Get actions from store
  const selectBlock = useEditorStore((s) => s.selectBlock)
  const hoverBlock = useEditorStore((s) => s.hoverBlock)
  const toggleBlockVisibility = useEditorStore((s) => s.toggleBlockVisibility)
  const changeBlockVariant = useEditorStore((s) => s.changeBlockVariant)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const enterFocusMode = useEditorStore((s) => s.enterFocusMode)
  const duplicateSelectedBlocks = useEditorStore((s) => s.duplicateSelectedBlocks)
  const removeSelectedBlocks = useEditorStore((s) => s.removeSelectedBlocks)
  const toggleBlockLock = useEditorStore((s) => s.toggleBlockLock)
  const copyBlockStyles = useEditorStore((s) => s.copyBlockStyles)
  const pasteBlockStyles = useEditorStore((s) => s.pasteBlockStyles)
  const copiedStyles = useEditorStore((s) => s.copiedStyles)

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
  const variant = getVariantMeta(block.type, block.variant)
  const isProtected = block.type === "header" || block.type === "footer"
  const isLocked = block.locked ?? false
  const hasGroup = !!block.groupId
  const isDropTarget = over?.id === block.id && !isDragging
  const canMoveUp = index > 0 && !isLocked
  const canMoveDown = index < totalBlocks - 1 && !isLocked
  const isContainer = isContainerBlock(block)
  const isMultiSelected = isSelected && selectedCount > 1

  const handleSelect = useCallback((e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(e)
    } else {
      selectBlock(block.id)
    }
  }, [selectBlock, block.id, onSelect])
  const handleFocus = useCallback(() => enterFocusMode(block.id), [enterFocusMode, block.id])
  const handleToggleVisibility = useCallback(() => toggleBlockVisibility(block.id), [toggleBlockVisibility, block.id])
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
  const handleMoveUp = useCallback(() => {
    if (canMoveUp) moveBlock(index, index - 1)
  }, [moveBlock, index, canMoveUp])
  const handleMoveDown = useCallback(() => {
    if (canMoveDown) moveBlock(index, index + 1)
  }, [moveBlock, index, canMoveDown])

  const handleToggleLock = useCallback(() => toggleBlockLock(block.id), [toggleBlockLock, block.id])
  const handleCopyStyles = useCallback(() => copyBlockStyles(block.id), [copyBlockStyles, block.id])
  const handlePasteStyles = useCallback(() => pasteBlockStyles(block.id), [pasteBlockStyles, block.id])

  const content = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center h-7 rounded-md transition-colors cursor-pointer select-none",
        isDragging && "opacity-30",
        isDragOverlay && "shadow-lg border bg-background",
        isDropTarget && "bg-primary/10",
        isSelected && !isDragging && !isMultiSelected && "bg-primary/15",
        isSelected && !isDragging && isMultiSelected && "bg-violet-500/15",
        isHovered && !isSelected && !isDragging && "bg-muted",
        !block.visible && "opacity-50"
      )}
      onClick={handleSelect}
      onDoubleClick={handleFocus}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {/* Drop indicator */}
      {isDropTarget && (
        <div className="absolute -top-px left-2 right-2 h-0.5 bg-primary rounded-full" />
      )}

      {/* Color indicator */}
      <div className={cn(
        "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-opacity",
        colors.bg,
        (isSelected || isHovered) ? "opacity-100" : "opacity-30"
      )} style={{ marginLeft: depth * 12 }} />

      {/* Indentation spacer */}
      {depth > 0 && (
        <div style={{ width: depth * 12 }} className="shrink-0" />
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
            className="h-3 w-3 transition-transform" 
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
          <HugeiconsIcon icon={DragDropVerticalIcon} className="h-3 w-3" />
        </button>
      )}

      {/* Icon */}
      <HugeiconsIcon icon={Icon} className={cn("h-3.5 w-3.5 shrink-0", colors.text)} />

      {/* Name */}
      <span className={cn(
        "flex-1 truncate text-xs font-medium ml-1.5 mr-1",
        !block.visible && "line-through"
      )}>
        {blockMeta.name}
      </span>

      {/* Container badge */}
      {isContainer && (
        <span className="text-[9px] text-muted-foreground/50 mr-1">
          {(block as any).children?.length || 0}
        </span>
      )}

      {/* Variant badge */}
      {variant && blockMeta.variants.length > 1 && !isContainer && (
        <span className="text-[9px] text-muted-foreground/60 truncate max-w-[40px] mr-1">
          {variant.name}
        </span>
      )}

      {/* Hidden indicator */}
      {!block.visible && (
        <HugeiconsIcon icon={ViewOffSlashIcon} className="h-3 w-3 text-muted-foreground mr-1" />
      )}

      {/* Locked indicator */}
      {isLocked && (
        <HugeiconsIcon icon={LockIcon} className="h-3 w-3 text-amber-500 mr-1" />
      )}

      {/* Group indicator */}
      {hasGroup && (
        <HugeiconsIcon icon={Link01Icon} className="h-3 w-3 text-blue-500 mr-1" />
      )}

      {/* Hover actions */}
      <div className={cn(
        "flex items-center mr-1 transition-opacity",
        (isSelected || isHovered) ? "opacity-100" : "opacity-0"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); handleToggleVisibility(); }}
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
      </div>
    </div>
  )

  // Wrap with context menu
  if (isDragOverlay) return content

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {content}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleSelect}>
          <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4 mr-2" />
          Edit Settings
        </ContextMenuItem>
        <ContextMenuItem onClick={handleFocus}>
          <HugeiconsIcon icon={ZoomInAreaIcon} className="h-4 w-4 mr-2" />
          Focus Mode
        </ContextMenuItem>
        <ContextMenuItem onClick={handleToggleVisibility}>
          <HugeiconsIcon icon={block.visible ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4 mr-2" />
          {block.visible ? "Hide Block" : "Show Block"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleToggleLock}>
          <HugeiconsIcon icon={isLocked ? SquareUnlock02Icon : LockIcon} className="h-4 w-4 mr-2" />
          {isLocked ? "Unlock Block" : "Lock Block"}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleCopyStyles}>
          <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4 mr-2" />
          Copy Styles
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePasteStyles} disabled={!copiedStyles}>
          <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4 mr-2" />
          Paste Styles
        </ContextMenuItem>
        
        {!isProtected && !isLocked && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDuplicate}>
              <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
              Duplicate
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
          <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 mr-2" />
          Move Up
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
          <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 mr-2" />
          Move Down
        </ContextMenuItem>

        {blockMeta.variants.length > 1 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Change Variant</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-40">
                {blockMeta.variants.map((v) => (
                  <ContextMenuItem
                    key={v.id}
                    onClick={() => changeBlockVariant(block.id, v.id)}
                  >
                    <span className="flex-1">{v.name}</span>
                    {block.variant === v.id && (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-primary" />
                    )}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {!isProtected && !isLocked && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleRemove} className="text-destructive">
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
              Remove
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ============================================================================
// RECURSIVE TREE RENDERER
// ============================================================================

interface BlockTreeProps {
  blocks: StoreBlock[]
  selectedBlockIds: string[]
  hoveredBlockId: string | null
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (blockId: string, e: React.MouseEvent) => void
  depth?: number
  parentIndex?: number
}

function BlockTree({
  blocks,
  selectedBlockIds,
  hoveredBlockId,
  expandedIds,
  onToggleExpand,
  onSelect,
  depth = 0,
  parentIndex = 0,
}: BlockTreeProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const isContainer = isContainerBlock(block)
        const children = isContainer ? (block as any).children || [] : []
        const hasChildren = children.length > 0
        const isExpanded = expandedIds.has(block.id)
        const globalIndex = parentIndex + index
        const isSelected = selectedBlockIds.includes(block.id)

        return (
          <div key={block.id}>
            <LayerItem
              block={block}
              index={globalIndex}
              totalBlocks={blocks.length}
              isSelected={isSelected}
              isHovered={hoveredBlockId === block.id}
              depth={depth}
              isExpanded={isExpanded}
              onToggleExpand={() => onToggleExpand(block.id)}
              hasChildren={hasChildren}
              selectedCount={selectedBlockIds.length}
              onSelect={(e) => onSelect(block.id, e)}
            />
            {/* Render children if expanded */}
            {hasChildren && isExpanded && (
              <BlockTree
                blocks={children}
                selectedBlockIds={selectedBlockIds}
                hoveredBlockId={hoveredBlockId}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                depth={depth + 1}
                parentIndex={globalIndex + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

// ============================================================================
// LAYERS PANEL COMPONENT
// ============================================================================

export function LayersPanel() {
  // Read state from store
  const blocks = useEditorStore(selectBlocks)
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const selectedBlockIds = useEditorStore(selectSelectedBlockIds)
  const hoveredBlockId = useEditorStore(selectHoveredBlockId)

  // Get actions from store
  const selectBlock = useEditorStore((s) => s.selectBlock)
  const selectAll = useEditorStore((s) => s.selectAll)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const addBlockByType = useEditorStore((s) => s.addBlockByType)
  const moveSelectedBlocks = useEditorStore((s) => s.moveSelectedBlocks)
  const removeSelectedBlocks = useEditorStore((s) => s.removeSelectedBlocks)
  const duplicateSelectedBlocks = useEditorStore((s) => s.duplicateSelectedBlocks)
  const groupSelectedBlocks = useEditorStore((s) => s.groupSelectedBlocks)
  const ungroupBlock = useEditorStore((s) => s.ungroupBlock)
  const lockSelectedBlocks = useEditorStore((s) => s.lockSelectedBlocks)
  const unlockSelectedBlocks = useEditorStore((s) => s.unlockSelectedBlocks)

  // Expanded state for tree view
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Auto-expand containers when they get children
  useEffect(() => {
    const containerIds = blocks
      .filter(b => isContainerBlock(b) && (b as any).children?.length > 0)
      .map(b => b.id)
    
    setExpandedIds(prev => {
      const next = new Set(prev)
      containerIds.forEach(id => next.add(id))
      return next
    })
  }, [blocks])

  // Handle block selection with multi-select support
  const handleBlockSelect = useCallback((blockId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      selectBlock(blockId, 'add')
    } else if (e.metaKey || e.ctrlKey) {
      selectBlock(blockId, 'toggle')
    } else {
      selectBlock(blockId, 'replace')
    }
  }, [selectBlock])

  // Derived values
  const existingBlockTypes = useMemo(() => {
    const allBlocks = flattenBlocks(blocks)
    return allBlocks.map(b => b.type as BlockType)
  }, [blocks])
  
  const hiddenCount = useMemo(() => {
    const allBlocks = flattenBlocks(blocks)
    return allBlocks.filter(b => !b.visible).length
  }, [blocks])

  const totalBlockCount = useMemo(() => flattenBlocks(blocks).length, [blocks])

  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedBlock, setDraggedBlock] = useState<StoreBlock | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Filter blocks (searches all levels)
  const filteredBlocks = useMemo(() => {
    if (!searchQuery) return blocks
    const q = searchQuery.toLowerCase()
    
    // For search, we flatten and filter, then show matching blocks
    const allBlocks = flattenBlocks(blocks)
    const matchingIds = new Set(
      allBlocks
        .filter((b) => {
          const name = b.type.replace("-", " ").toLowerCase()
          return name.includes(q) || b.variant?.toLowerCase().includes(q)
        })
        .map(b => b.id)
    )
    
    // Return top-level blocks that match or have matching descendants
    return blocks.filter(b => {
      if (matchingIds.has(b.id)) return true
      if (isContainerBlock(b)) {
        const descendants = flattenBlocks([b])
        return descendants.some(d => matchingIds.has(d.id))
      }
      return false
    })
  }, [blocks, searchQuery])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setSearchQuery("")
        searchRef.current?.blur()
        return
      }

      // Clear selection on Escape (when not in search)
      if (e.key === "Escape" && document.activeElement !== searchRef.current) {
        clearSelection()
        return
      }

      // Select all with Cmd/Ctrl+A
      if ((e.metaKey || e.ctrlKey) && e.key === "a" && document.activeElement !== searchRef.current) {
        e.preventDefault()
        selectAll()
        return
      }

      // Delete selected blocks with Backspace/Delete
      if ((e.key === "Backspace" || e.key === "Delete") && selectedBlockIds.length > 0 && document.activeElement !== searchRef.current) {
        e.preventDefault()
        removeSelectedBlocks()
        return
      }

      // Duplicate with Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedBlockIds.length > 0 && document.activeElement !== searchRef.current) {
        e.preventDefault()
        duplicateSelectedBlocks()
        return
      }

      // Group with Cmd/Ctrl+G
      if ((e.metaKey || e.ctrlKey) && e.key === "g" && !e.shiftKey && selectedBlockIds.length > 1 && document.activeElement !== searchRef.current) {
        e.preventDefault()
        groupSelectedBlocks()
        return
      }

      // Lock with Cmd/Ctrl+L
      if ((e.metaKey || e.ctrlKey) && e.key === "l" && selectedBlockIds.length > 0 && document.activeElement !== searchRef.current) {
        e.preventDefault()
        // Check if any selected block is unlocked
        const anyUnlocked = selectedBlockIds.some(id => {
          const block = flattenBlocks(blocks).find(b => b.id === id)
          return block && !block.locked
        })
        if (anyUnlocked) {
          lockSelectedBlocks()
        } else {
          unlockSelectedBlocks()
        }
        return
      }

      if (document.activeElement === searchRef.current) return

      const allBlocks = flattenBlocks(filteredBlocks)
      
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        const idx = selectedBlockId ? allBlocks.findIndex(b => b.id === selectedBlockId) : -1
        const next = e.key === "ArrowDown" 
          ? Math.min(idx + 1, allBlocks.length - 1)
          : Math.max(idx - 1, 0)
        if (allBlocks[next]) {
          if (e.shiftKey) {
            selectBlock(allBlocks[next].id, 'add')
          } else {
            selectBlock(allBlocks[next].id, 'replace')
          }
        }
      }

      // Move selected blocks with Alt+Arrow
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && selectedBlockIds.length > 0) {
        e.preventDefault()
        moveSelectedBlocks(e.key === "ArrowUp" ? 'up' : 'down')
        return
      }

      // Expand/collapse with arrow keys
      if (e.key === "ArrowRight" && selectedBlockId) {
        const block = allBlocks.find(b => b.id === selectedBlockId)
        if (block && isContainerBlock(block)) {
          setExpandedIds(prev => new Set([...prev, selectedBlockId]))
        }
      }
      if (e.key === "ArrowLeft" && selectedBlockId) {
        setExpandedIds(prev => {
          const next = new Set(prev)
          next.delete(selectedBlockId)
          return next
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedBlockId, selectedBlockIds, filteredBlocks, selectBlock, selectAll, clearSelection, removeSelectedBlocks, duplicateSelectedBlocks, moveSelectedBlocks])

  // DnD handlers
  const handleDragStart = useCallback((e: DragStartEvent) => {
    const allBlocks = flattenBlocks(blocks)
    const block = allBlocks.find(b => b.id === e.active.id)
    setDraggedBlock(block || null)
  }, [blocks])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setDraggedBlock(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    
    // For now, only support reordering at the same level
    const from = blocks.findIndex(b => b.id === active.id)
    const to = blocks.findIndex(b => b.id === over.id)
    if (from !== -1 && to !== -1) moveBlock(from, to)
  }, [blocks, moveBlock])

  const handleDragCancel = useCallback(() => {
    setDraggedBlock(null)
  }, [])

  // Add block handler
  const handleAddBlock = useCallback((type: BlockType, variant: string) => {
    addBlockByType(type, variant)
  }, [addBlockByType])

  return (
    <aside className="border-r bg-background flex flex-col h-full overflow-hidden w-[240px]">
      {/* Header */}
      <div className="shrink-0 p-2 border-b space-y-2">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Layers
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {totalBlockCount}
            </span>
            <BlockPalette onAddBlock={handleAddBlock} existingBlockTypes={existingBlockTypes} />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon 
            icon={Search01Icon} 
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" 
          />
          <Input
            ref={searchRef}
            placeholder="Search... (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 pr-7 text-xs"
          />
          {searchQuery && (
            <button
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded hover:bg-muted"
              onClick={() => setSearchQuery("")}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Block list */}
      <ScrollArea className="flex-1">
        <div className="p-1.5">
          {filteredBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              {blocks.length === 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">No blocks yet</p>
                  <BlockPalette onAddBlock={handleAddBlock} existingBlockTypes={existingBlockTypes} />
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No blocks match "{searchQuery}"
                </p>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext 
                items={flattenBlocks(filteredBlocks).map(b => b.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  <BlockTree
                    blocks={filteredBlocks}
                    selectedBlockIds={selectedBlockIds}
                    hoveredBlockId={hoveredBlockId}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                    onSelect={handleBlockSelect}
                  />
                </div>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {draggedBlock && (
                  <LayerItem
                    block={draggedBlock}
                    index={0}
                    totalBlocks={1}
                    isSelected={false}
                    isHovered={false}
                    isDragOverlay
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 px-2 py-1.5 border-t bg-muted/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted font-mono">⇧</kbd> multi
            <span className="mx-1">·</span>
            <kbd className="px-1 py-0.5 rounded bg-muted font-mono">⌘G</kbd> group
          </span>
          {selectedBlockIds.length > 1 ? (
            <span className="text-violet-500 font-medium">{selectedBlockIds.length} selected</span>
          ) : hiddenCount > 0 ? (
            <span>{hiddenCount} hidden</span>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
