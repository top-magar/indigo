"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
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
} from "@dnd-kit/sortable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/shared/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { isContainerBlock, flattenBlocks } from "@/types/blocks"
import { BlockPalette } from "./block-palette"
import { LayerItem } from "./layer-item"
import { LayersPanelToolbar } from "./layers-panel-toolbar"
import { TreeView, ListView, GridView, type LayoutMode } from "./layers-layout-modes"
import { LayersFilterMenu, type GroupByOption, type SortByOption } from "./layers-filter-menu"
import { LayersContextActions, type ContextAction } from "./layers-context-actions"
import { LayersHistory, type HistoryEntry } from "./layers-history"
import { BlockPresetsMenu } from "./block-presets-menu"
import { useLayersPanel } from "@/features/editor/hooks/use-layers-panel"
import { useResponsivePanel } from "@/features/editor/hooks/use-responsive-panel"
import { useKeyboardNavigation } from "@/features/editor/hooks/use-keyboard-navigation"
import {
  useEditorStore,
  selectBlocks,
  selectSelectedBlockId,
  selectHoveredBlockId,
} from "@/features/editor/store"



// ============================================================================
// LAYERS PANEL COMPONENT
// ============================================================================

export function LayersPanel() {
  // Read state from store
  const blocks = useEditorStore(selectBlocks)
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const hoveredBlockId = useEditorStore(selectHoveredBlockId)

  // Get actions from store
  const selectBlock = useEditorStore((s) => s.selectBlock)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const addBlockByType = useEditorStore((s) => s.addBlockByType)
  const toggleBlockVisibility = useEditorStore((s) => s.toggleBlockVisibility)
  const toggleBlockLock = useEditorStore((s) => s.toggleBlockLock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)

  // Use the layers panel hook for enhanced features
  const {
    viewDensity,
    setViewDensity,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRange,
    bulkToggleVisibility,
    bulkToggleLock,
    bulkDuplicate,
    bulkDelete,
  } = useLayersPanel({ blocks })

  // Use responsive panel hook
  const {
    width: panelWidth,
    isCollapsed,
    isFloating,
  } = useResponsivePanel({
    panelId: "layers-panel",
    defaultWidth: 240,
    minWidth: 180,
    maxWidth: 320,
  })

  // Layout mode state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("tree")

  // Filter/group state
  const [groupBy, setGroupBy] = useState<GroupByOption>("none")
  const [sortBy, setSortBy] = useState<SortByOption>("order")
  const [filterByType, setFilterByType] = useState<BlockType[]>([])
  const [filterByVisibility, setFilterByVisibility] = useState<"all" | "visible" | "hidden">("all")
  const [filterByLock, setFilterByLock] = useState<"all" | "locked" | "unlocked">("all")

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true)

  // Expanded state for tree view
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<StoreBlock | null>(null)

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
    if (e.shiftKey && lastSelectedId) {
      // Range selection
      selectRange(lastSelectedId, blockId)
      selectBlock(blockId, 'add')
    } else if (e.metaKey || e.ctrlKey) {
      // Toggle selection
      toggleSelection(blockId, 'toggle')
      selectBlock(blockId, 'toggle')
    } else {
      // Replace selection
      toggleSelection(blockId, 'replace')
      selectBlock(blockId, 'replace')
    }
    setLastSelectedId(blockId)
  }, [selectBlock, toggleSelection, selectRange, lastSelectedId])

  // Handle checkbox change
  const handleCheckboxChange = useCallback((blockId: string, checked: boolean) => {
    toggleSelection(blockId, checked ? 'add' : 'toggle')
    if (checked) {
      selectBlock(blockId, 'add')
    } else {
      // If unchecking, we need to handle this differently
      // For now, just toggle
      selectBlock(blockId, 'toggle')
    }
  }, [toggleSelection, selectBlock])

  // Derived values
  const existingBlockTypes = useMemo(() => {
    const allBlocks = flattenBlocks(blocks)
    return allBlocks.map(b => b.type as BlockType)
  }, [blocks])

  // Available block types for filter menu
  const availableBlockTypes = useMemo(() => {
    const types = new Set(existingBlockTypes)
    return Array.from(types) as BlockType[]
  }, [existingBlockTypes])

  // Apply filters to blocks
  const filteredBlocks = useMemo(() => {
    let result = searchQuery ? searchResults : blocks

    // Filter by type
    if (filterByType.length > 0) {
      result = result.filter(b => filterByType.includes(b.type))
    }

    // Filter by visibility
    if (filterByVisibility === "visible") {
      result = result.filter(b => b.visible !== false)
    } else if (filterByVisibility === "hidden") {
      result = result.filter(b => b.visible === false)
    }

    // Filter by lock status
    if (filterByLock === "locked") {
      result = result.filter(b => b.locked === true)
    } else if (filterByLock === "unlocked") {
      result = result.filter(b => b.locked !== true)
    }

    // Sort blocks
    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.type.localeCompare(b.type))
    } else if (sortBy === "type") {
      result = [...result].sort((a, b) => a.type.localeCompare(b.type))
    }

    return result
  }, [blocks, searchQuery, searchResults, filterByType, filterByVisibility, filterByLock, sortBy])

  // Use filtered blocks for display
  const displayBlocks = filteredBlocks

  // Get selected blocks for context actions
  const selectedBlocks = useMemo(() => {
    const allBlocks = flattenBlocks(blocks)
    return allBlocks.filter(b => selectedIds.has(b.id))
  }, [blocks, selectedIds])

  // Add history entry helper
  const addHistoryEntry = useCallback((type: HistoryEntry['type'], description: string, blockId?: string, blockType?: string) => {
    const entry: HistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      description,
      timestamp: Date.now(),
      blockId,
      blockType,
    }
    setHistory(prev => {
      // Truncate future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1)
      return [...newHistory, entry].slice(-50) // Keep last 50 entries
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Handle history jump
  const handleJumpToState = useCallback((index: number) => {
    // TODO: Implement actual state restoration from history
    // For now, just update the index
    setHistoryIndex(index)
  }, [])

  // Use keyboard navigation hook
  const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
    blocks,
    selectedIds,
    onSelect: (id, mode) => {
      toggleSelection(id, mode)
      selectBlock(id, mode)
    },
    onSelectRange: selectRange,
    onDelete: () => {
      if (selectedIds.size > 0) {
        addHistoryEntry('remove', `Deleted ${selectedIds.size} block(s)`)
        bulkDelete()
      }
    },
    onDuplicate: () => {
      if (selectedIds.size > 0) {
        addHistoryEntry('duplicate', `Duplicated ${selectedIds.size} block(s)`)
        bulkDuplicate()
      }
    },
    onSelectAll: selectAll,
    onClearSelection: clearSelection,
    onEdit: (id) => {
      // Focus is handled by selection - settings panel will show
      selectBlock(id, 'replace')
    },
    enabled: true,
  })

  // Determine if we should show checkboxes (when multiple items selected or in search mode)
  const showCheckboxes = selectedIds.size > 1 || searchQuery.length > 0

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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
    addHistoryEntry('add', `Added ${type} block`, undefined, type)
  }, [addBlockByType, addHistoryEntry])

  // Handle preset application
  const handleApplyPreset = useCallback((presetBlocks: StoreBlock[]) => {
    presetBlocks.forEach(block => {
      addBlockByType(block.type, block.variant || 'default')
    })
    addHistoryEntry('add', `Applied preset with ${presetBlocks.length} blocks`)
  }, [addBlockByType, addHistoryEntry])

  // Handle context actions from LayersContextActions
  const handleContextAction = useCallback((action: ContextAction) => {
    switch (action.type) {
      case "edit":
        // Focus on settings panel - already handled by selection
        break
      case "duplicate":
        if (selectedIds.size > 1) {
          addHistoryEntry('duplicate', `Duplicated ${selectedIds.size} blocks`)
          bulkDuplicate()
        } else if (selectedBlockId) {
          addHistoryEntry('duplicate', 'Duplicated block')
          duplicateBlock(selectedBlockId)
        }
        break
      case "delete":
        if (selectedIds.size > 1) {
          addHistoryEntry('remove', `Deleted ${selectedIds.size} blocks`)
          bulkDelete()
        } else if (selectedBlockId) {
          addHistoryEntry('remove', 'Deleted block')
          removeBlock(selectedBlockId)
        }
        break
      case "move":
        if (selectedBlockId) {
          const idx = blocks.findIndex(b => b.id === selectedBlockId)
          if (action.direction === "up" && idx > 0) {
            addHistoryEntry('move', 'Moved block up')
            moveBlock(idx, idx - 1)
          } else if (action.direction === "down" && idx < blocks.length - 1) {
            addHistoryEntry('move', 'Moved block down')
            moveBlock(idx, idx + 1)
          }
        }
        break
      case "group":
        // TODO: Implement grouping
        break
      case "ungroup":
        // TODO: Implement ungrouping
        break
      case "collapse-all":
        setExpandedIds(new Set())
        break
      case "expand-all":
        const allContainerIds = flattenBlocks(blocks)
          .filter(b => isContainerBlock(b))
          .map(b => b.id)
        setExpandedIds(new Set(allContainerIds))
        break
      case "add-block":
        addBlockByType(action.blockType, "default")
        addHistoryEntry('add', `Added ${action.blockType} block`, undefined, action.blockType)
        break
      case "add-child":
        // TODO: Implement add child to container
        break
      case "align":
      case "distribute":
        // TODO: Implement alignment/distribution
        break
    }
  }, [selectedIds, selectedBlockId, blocks, bulkDuplicate, bulkDelete, duplicateBlock, removeBlock, moveBlock, addBlockByType, addHistoryEntry])

  // Keyboard shortcuts - use the navigation hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Let the navigation hook handle most keyboard events
      handleNavKeyDown(e)

      // Additional shortcuts not in the hook
      // Expand/collapse with arrow keys
      if (e.key === "ArrowRight" && selectedBlockId) {
        const allBlocks = flattenBlocks(displayBlocks)
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
  }, [selectedBlockId, displayBlocks, handleNavKeyDown])

  return (
    <aside 
      className={cn(
        "border-r bg-background flex flex-col h-full overflow-hidden transition-all",
        isCollapsed ? "w-12" : "w-[240px]",
        isFloating && "absolute left-0 top-0 z-50 shadow-xl rounded-r-lg"
      )}
      style={!isCollapsed && !isFloating ? { width: panelWidth } : undefined}
    >
      {/* Toolbar with view density, search, layout mode, and bulk actions */}
      <LayersPanelToolbar
        viewDensity={viewDensity}
        onViewDensityChange={setViewDensity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedIds.size}
        onBulkVisibility={bulkToggleVisibility}
        onBulkLock={bulkToggleLock}
        onBulkDuplicate={bulkDuplicate}
        onBulkDelete={bulkDelete}
        onClearSelection={clearSelection}
        onAddBlock={handleAddBlock}
        existingBlockTypes={existingBlockTypes}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        isCollapsed={isCollapsed}
        filterMenu={
          <LayersFilterMenu
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            filterByType={filterByType}
            onFilterByTypeChange={setFilterByType}
            filterByVisibility={filterByVisibility}
            onFilterByVisibilityChange={setFilterByVisibility}
            filterByLock={filterByLock}
            onFilterByLockChange={setFilterByLock}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            availableBlockTypes={availableBlockTypes}
          />
        }
        presetsMenu={
          <BlockPresetsMenu onApplyPreset={handleApplyPreset} />
        }
      />

      {/* Block list */}
      <ScrollArea className="flex-1">
        <div className="p-1.5">
          {displayBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              {blocks.length === 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">No blocks yet</p>
                  <BlockPalette onAddBlock={handleAddBlock} existingBlockTypes={existingBlockTypes} />
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No blocks match your filters
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
                items={flattenBlocks(displayBlocks).map(b => b.id)} 
                strategy={verticalListSortingStrategy}
              >
                {/* Render based on layout mode */}
                {layoutMode === "tree" && (
                  <TreeView
                    blocks={displayBlocks}
                    selectedIds={selectedIds}
                    hoveredBlockId={hoveredBlockId}
                    viewDensity={viewDensity}
                    searchQuery={searchQuery}
                    onSelect={handleBlockSelect}
                    onToggleVisibility={toggleBlockVisibility}
                    onToggleLock={toggleBlockLock}
                    onCheckboxChange={handleCheckboxChange}
                    showCheckboxes={showCheckboxes}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                  />
                )}
                {layoutMode === "list" && (
                  <ListView
                    blocks={displayBlocks}
                    selectedIds={selectedIds}
                    hoveredBlockId={hoveredBlockId}
                    viewDensity={viewDensity}
                    searchQuery={searchQuery}
                    onSelect={handleBlockSelect}
                    onToggleVisibility={toggleBlockVisibility}
                    onToggleLock={toggleBlockLock}
                    onCheckboxChange={handleCheckboxChange}
                    showCheckboxes={showCheckboxes}
                  />
                )}
                {layoutMode === "grid" && (
                  <GridView
                    blocks={displayBlocks}
                    selectedIds={selectedIds}
                    hoveredBlockId={hoveredBlockId}
                    viewDensity={viewDensity}
                    searchQuery={searchQuery}
                    onSelect={handleBlockSelect}
                    onToggleVisibility={toggleBlockVisibility}
                    onToggleLock={toggleBlockLock}
                    onCheckboxChange={handleCheckboxChange}
                    showCheckboxes={showCheckboxes}
                  />
                )}
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
                    isMultiSelected={false}
                    viewDensity={viewDensity}
                    onSelect={() => {}}
                    onToggleVisibility={() => {}}
                    onToggleLock={() => {}}
                    isDragOverlay
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      {/* Context actions bar */}
      <LayersContextActions
        selectedBlocks={selectedBlocks}
        allBlocks={blocks}
        onAction={handleContextAction}
      />

      {/* History panel */}
      <LayersHistory
        history={history}
        currentIndex={historyIndex}
        onJumpToState={handleJumpToState}
        isCollapsed={isHistoryCollapsed}
        onToggleCollapse={() => setIsHistoryCollapsed(prev => !prev)}
      />

      {/* Footer - shows selection count or search results count */}
      <div className="shrink-0 px-2 py-1.5 border-t">
        <div className="text-[10px] text-muted-foreground text-center">
          {searchQuery ? (
            <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          ) : selectedIds.size > 1 ? (
            <span className="text-[var(--ds-purple-700)] font-medium">{selectedIds.size} selected</span>
          ) : (
            <span>{flattenBlocks(blocks).length} block{flattenBlocks(blocks).length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </aside>
  )
}