// Editor Store - Zustand store for visual editor state management

import { create } from "zustand"
import { produce } from "immer"
import { shallow } from "zustand/shallow"
import type { StoreBlock, BlockType } from "@/types/blocks"
import type { EditorStore, EditorState, ClipboardBlockState, CopiedStyles, ResponsiveVisibility } from "./types"
import type { Guide } from "./guides"

const MAX_HISTORY = 50

// Counter for generating unique IDs (ensures uniqueness even when Date.now() returns same value)
let idCounter = 0

/**
 * Generates a unique ID for a block.
 * Uses timestamp + counter to ensure uniqueness even when called rapidly.
 */
function generateUniqueId(type: string): string {
  idCounter = (idCounter + 1) % 1000000 // Reset after 1M to avoid overflow
  return `${type}-${Date.now()}-${idCounter}`
}

/**
 * Sets a nested value in an object using a field path.
 * Supports dot notation and array indexing: "headline", "settings.items[0].title"
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: Record<string, unknown> = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (current[key] === undefined || current[key] === null) {
      // Create intermediate object or array based on next key
      const nextKey = parts[i + 1]
      current[key] = /^\d+$/.test(nextKey) ? [] : {}
    }
    current = current[key] as Record<string, unknown>
  }
  
  const lastKey = parts[parts.length - 1]
  current[lastKey] = value
}

const initialState: EditorState = {
  blocks: [],
  selectedBlockId: null,
  selectedBlockIds: [],
  hoveredBlockId: null,
  isDirty: false,
  isPreviewReady: false,
  history: {
    past: [],
    future: [],
  },
  inlineEdit: null,
  editorMode: 'edit',
  viewport: 'desktop',
  activeDragId: null,
  overBlockId: null,
  autosaveStatus: 'idle',
  lastAutosaveAt: null,
  autosaveError: null,
  clipboardBlock: null,
  focusMode: null,
  // Smart guides
  activeGuides: [],
  snappingEnabled: true,
  // Copied styles
  copiedStyles: null,
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...initialState,

  // ============================================================================
  // BLOCK STATE
  // ============================================================================

  setBlocks: (blocks) => {
    set({ blocks })
  },

  selectBlock: (blockId, mode = 'replace') => {
    const { selectedBlockIds } = get()
    
    if (blockId === null) {
      // Clear selection
      set({ selectedBlockId: null, selectedBlockIds: [] })
      return
    }

    switch (mode) {
      case 'replace':
        // Single select - replace entire selection
        set({ selectedBlockId: blockId, selectedBlockIds: [blockId] })
        break
      case 'add':
        // Add to selection (Shift+click)
        if (!selectedBlockIds.includes(blockId)) {
          const newSelection = [...selectedBlockIds, blockId]
          set({ selectedBlockId: blockId, selectedBlockIds: newSelection })
        }
        break
      case 'toggle':
        // Toggle selection (Cmd/Ctrl+click)
        if (selectedBlockIds.includes(blockId)) {
          const newSelection = selectedBlockIds.filter(id => id !== blockId)
          set({ 
            selectedBlockId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
            selectedBlockIds: newSelection 
          })
        } else {
          const newSelection = [...selectedBlockIds, blockId]
          set({ selectedBlockId: blockId, selectedBlockIds: newSelection })
        }
        break
    }
  },

  selectBlocks: (blockIds) => {
    set({ 
      selectedBlockId: blockIds.length > 0 ? blockIds[blockIds.length - 1] : null,
      selectedBlockIds: blockIds 
    })
  },

  addToSelection: (blockId) => {
    const { selectedBlockIds } = get()
    if (!selectedBlockIds.includes(blockId)) {
      const newSelection = [...selectedBlockIds, blockId]
      set({ selectedBlockId: blockId, selectedBlockIds: newSelection })
    }
  },

  removeFromSelection: (blockId) => {
    const { selectedBlockIds } = get()
    const newSelection = selectedBlockIds.filter(id => id !== blockId)
    set({ 
      selectedBlockId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
      selectedBlockIds: newSelection 
    })
  },

  toggleSelection: (blockId) => {
    const { selectedBlockIds } = get()
    if (selectedBlockIds.includes(blockId)) {
      const newSelection = selectedBlockIds.filter(id => id !== blockId)
      set({ 
        selectedBlockId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
        selectedBlockIds: newSelection 
      })
    } else {
      const newSelection = [...selectedBlockIds, blockId]
      set({ selectedBlockId: blockId, selectedBlockIds: newSelection })
    }
  },

  clearSelection: () => {
    set({ selectedBlockId: null, selectedBlockIds: [] })
  },

  selectAll: () => {
    const { blocks } = get()
    const allIds = blocks.map(b => b.id)
    set({ 
      selectedBlockId: allIds.length > 0 ? allIds[allIds.length - 1] : null,
      selectedBlockIds: allIds 
    })
  },

  hoverBlock: (blockId) => {
    set({ hoveredBlockId: blockId })
  },

  updateBlock: (blockId, updates) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, ...updates } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Update block settings (merges with existing settings)
   * This is the primary way to update block configuration from the settings panel
   */
  updateBlockSettings: (blockId, settings) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const currentBlock = blocks[index]
    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, settings: { ...currentBlock.settings, ...settings } } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Change block variant
   */
  changeBlockVariant: (blockId, variant) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, variant } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Toggle block visibility
   */
  toggleBlockVisibility: (blockId) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const currentBlock = blocks[index]
    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, visible: !currentBlock.visible } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  moveBlock: (fromIndex, toIndex) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]

    const newBlocks = produce(blocks, (draft) => {
      const [moved] = draft.splice(fromIndex, 1)
      draft.splice(toIndex, 0, moved)
      draft.forEach((block, i) => {
        block.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  addBlock: (block) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]

    const newBlocks = produce(blocks, (draft) => {
      draft.push(block)
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: block.id,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Add a new block by type and variant
   * Convenience method that creates the block object internally
   */
  addBlockByType: (type: BlockType, variant: string) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]

    const newBlock: StoreBlock = {
      id: generateUniqueId(type),
      type,
      variant,
      order: blocks.length,
      visible: true,
      settings: {},
    } as StoreBlock

    const newBlocks = produce(blocks, (draft) => {
      draft.push(newBlock)
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: newBlock.id,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  removeBlock: (blockId) => {
    const { blocks, selectedBlockId, history } = get()
    const oldBlocks = [...blocks]

    const newBlocks = produce(blocks, (draft) => {
      const filtered = draft.filter((b) => b.id !== blockId)
      draft.length = 0
      filtered.forEach((b, i) => {
        b.order = i
        draft.push(b)
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: selectedBlockId === blockId ? null : selectedBlockId,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  duplicateBlock: (blockId) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const blockToDuplicate = blocks.find((b) => b.id === blockId)
    if (!blockToDuplicate) return

    const originalIndex = blocks.findIndex((b) => b.id === blockId)
    const newBlock: StoreBlock = {
      ...blockToDuplicate,
      id: generateUniqueId(blockToDuplicate.type),
      order: originalIndex + 1,
    } as StoreBlock

    const newBlocks = produce(blocks, (draft) => {
      draft.splice(originalIndex + 1, 0, newBlock)
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: newBlock.id,
      selectedBlockIds: [newBlock.id],
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // BULK OPERATIONS (Multi-Select)
  // ============================================================================

  duplicateSelectedBlocks: () => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length === 0) return

    const oldBlocks = [...blocks]
    const newBlockIds: string[] = []

    // Sort selected blocks by their order to maintain relative positions
    const sortedSelectedIds = [...selectedBlockIds].sort((a, b) => {
      const blockA = blocks.find(bl => bl.id === a)
      const blockB = blocks.find(bl => bl.id === b)
      return (blockA?.order ?? 0) - (blockB?.order ?? 0)
    })

    const newBlocks = produce(blocks, (draft) => {
      // Find the last selected block's index to insert after
      let insertOffset = 0
      for (const blockId of sortedSelectedIds) {
        const blockToDuplicate = draft.find((b) => b.id === blockId)
        if (!blockToDuplicate) continue

        const originalIndex = draft.findIndex((b) => b.id === blockId)
        const newId = generateUniqueId(blockToDuplicate.type)
        const newBlock: StoreBlock = {
          ...JSON.parse(JSON.stringify(blockToDuplicate)),
          id: newId,
        } as StoreBlock

        // Insert after the last selected block + offset
        const lastSelectedIndex = Math.max(...sortedSelectedIds.map(id => 
          draft.findIndex(b => b.id === id)
        ))
        draft.splice(lastSelectedIndex + 1 + insertOffset, 0, newBlock)
        newBlockIds.push(newId)
        insertOffset++
      }

      // Reorder all blocks
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: newBlockIds.length > 0 ? newBlockIds[newBlockIds.length - 1] : null,
      selectedBlockIds: newBlockIds,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  removeSelectedBlocks: () => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length === 0) return

    const oldBlocks = [...blocks]

    const newBlocks = produce(blocks, (draft) => {
      const filtered = draft.filter((b) => !selectedBlockIds.includes(b.id))
      draft.length = 0
      filtered.forEach((b, i) => {
        b.order = i
        draft.push(b)
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: null,
      selectedBlockIds: [],
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  moveSelectedBlocks: (direction) => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length === 0) return

    const oldBlocks = [...blocks]

    // Sort selected blocks by order
    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
    const selectedIndices = selectedBlockIds
      .map(id => sortedBlocks.findIndex(b => b.id === id))
      .filter(i => i !== -1)
      .sort((a, b) => a - b)

    // Check if move is possible
    if (direction === 'up' && selectedIndices[0] === 0) return
    if (direction === 'down' && selectedIndices[selectedIndices.length - 1] === sortedBlocks.length - 1) return

    const newBlocks = produce(sortedBlocks, (draft) => {
      if (direction === 'up') {
        // Move up: process from top to bottom
        for (const idx of selectedIndices) {
          if (idx > 0 && !selectedBlockIds.includes(draft[idx - 1].id)) {
            const temp = draft[idx]
            draft[idx] = draft[idx - 1]
            draft[idx - 1] = temp
          }
        }
      } else {
        // Move down: process from bottom to top
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
          const idx = selectedIndices[i]
          if (idx < draft.length - 1 && !selectedBlockIds.includes(draft[idx + 1].id)) {
            const temp = draft[idx]
            draft[idx] = draft[idx + 1]
            draft[idx + 1] = temp
          }
        }
      }

      // Reorder
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // HISTORY (UNDO/REDO)
  // ============================================================================

  undo: () => {
    const { history, blocks } = get()
    if (history.past.length === 0) return

    const newPast = [...history.past]
    const previous = newPast.pop()!
    set({
      blocks: previous,
      isDirty: true,
      history: {
        past: newPast,
        future: [blocks, ...history.future],
      },
    })
  },

  redo: () => {
    const { history, blocks } = get()
    if (history.future.length === 0) return

    const newFuture = [...history.future]
    const next = newFuture.shift()!
    set({
      blocks: next,
      isDirty: true,
      history: {
        past: [...history.past, blocks],
        future: newFuture,
      },
    })
  },

  // ============================================================================
  // PREVIEW STATE
  // ============================================================================

  setPreviewReady: (ready) => {
    set({ isPreviewReady: ready })
  },

  markClean: () => {
    set({ isDirty: false })
  },

  // ============================================================================
  // INLINE EDITING
  // ============================================================================

  startInlineEdit: (blockId, fieldPath, originalValue) => {
    set({
      inlineEdit: { blockId, fieldPath, originalValue },
      selectedBlockId: blockId,
    })
  },

  updateInlineEdit: (value) => {
    const { inlineEdit, blocks } = get()
    if (!inlineEdit) return

    const { blockId, fieldPath } = inlineEdit
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newBlocks = produce(blocks, (draft) => {
      const block = draft[index]
      setNestedValue(block, fieldPath, value)
    })

    set({
      blocks: newBlocks,
      isDirty: true,
    })
  },

  endInlineEdit: (save) => {
    const { inlineEdit, blocks, history } = get()
    if (!inlineEdit) return

    const { blockId, fieldPath, originalValue } = inlineEdit

    if (save) {
      const index = blocks.findIndex((b) => b.id === blockId)
      if (index !== -1) {
        const blocksWithOriginal = produce(blocks, (draft) => {
          const block = draft[index]
          setNestedValue(block, fieldPath, originalValue)
        })
        
        const newPast = [...history.past, blocksWithOriginal].slice(-MAX_HISTORY)
        set({
          inlineEdit: null,
          history: { past: newPast, future: [] },
        })
      } else {
        set({ inlineEdit: null })
      }
    } else {
      const index = blocks.findIndex((b) => b.id === blockId)
      if (index !== -1) {
        const newBlocks = produce(blocks, (draft) => {
          const block = draft[index]
          setNestedValue(block, fieldPath, originalValue)
        })
        set({
          blocks: newBlocks,
          inlineEdit: null,
        })
      } else {
        set({ inlineEdit: null })
      }
    }
  },

  // ============================================================================
  // EDITOR MODE & VIEWPORT
  // ============================================================================

  setEditorMode: (mode) => {
    set({ editorMode: mode })
  },

  setViewport: (viewport) => {
    set({ viewport })
  },

  // ============================================================================
  // DRAG & DROP STATE
  // ============================================================================

  setActiveDragId: (blockId) => {
    set({ activeDragId: blockId })
  },

  setOverBlockId: (blockId) => {
    set({ overBlockId: blockId })
  },

  // ============================================================================
  // SMART GUIDES
  // ============================================================================

  setActiveGuides: (guides) => {
    set({ activeGuides: guides })
  },

  clearGuides: () => {
    set({ activeGuides: [] })
  },

  setSnappingEnabled: (enabled) => {
    set({ snappingEnabled: enabled })
  },

  toggleSnapping: () => {
    set((state) => ({ snappingEnabled: !state.snappingEnabled }))
  },

  // ============================================================================
  // AUTOSAVE STATE
  // ============================================================================

  setAutosaveStatus: (status, lastSavedAt, error) => {
    set({
      autosaveStatus: status,
      ...(lastSavedAt !== undefined && { lastAutosaveAt: lastSavedAt }),
      ...(error !== undefined && { autosaveError: error }),
    })
  },

  // ============================================================================
  // CLIPBOARD
  // ============================================================================

  copyBlock: (blockId) => {
    const { blocks } = get()
    const blockToCopy = blocks.find((b) => b.id === blockId)
    if (!blockToCopy) return

    const clipboardBlock: ClipboardBlockState = {
      type: blockToCopy.type,
      variant: blockToCopy.variant,
      settings: { ...blockToCopy.settings },
      visible: blockToCopy.visible,
      copiedAt: Date.now(),
    }
    set({ clipboardBlock })
  },

  pasteBlock: () => {
    const { blocks, selectedBlockId, clipboardBlock, history } = get()
    if (!clipboardBlock) return

    const oldBlocks = [...blocks]
    const newId = generateUniqueId(clipboardBlock.type)

    let insertIndex = blocks.length
    if (selectedBlockId) {
      const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId)
      if (selectedIndex !== -1) {
        insertIndex = selectedIndex + 1
      }
    }

    const newBlock: StoreBlock = {
      id: newId,
      type: clipboardBlock.type,
      variant: clipboardBlock.variant,
      settings: { ...clipboardBlock.settings },
      visible: clipboardBlock.visible,
      order: insertIndex,
    } as StoreBlock

    const newBlocks = produce(blocks, (draft) => {
      draft.splice(insertIndex, 0, newBlock)
      draft.forEach((b, i) => {
        b.order = i
      })
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: newId,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  setClipboardBlock: (block) => {
    set({ clipboardBlock: block })
  },

  // ============================================================================
  // FOCUS MODE
  // ============================================================================

  enterFocusMode: (blockId) => {
    const { blocks } = get()
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    
    set({
      focusMode: { blockId, enteredAt: Date.now() },
      selectedBlockId: blockId,
    })
  },

  exitFocusMode: () => {
    set({ focusMode: null })
  },

  // ============================================================================
  // NESTED BLOCK OPERATIONS (Hybrid Architecture)
  // ============================================================================

  /**
   * Add a block to a container block's children
   */
  addBlockToContainer: (containerId, block, index) => {
    const { blocks, history } = get()
    const oldBlocks = JSON.parse(JSON.stringify(blocks)) // Deep clone for history

    const newBlocks = produce(blocks, (draft) => {
      const findAndAdd = (items: StoreBlock[]): boolean => {
        for (const item of items) {
          if (item.id === containerId && 'children' in item) {
            const container = item as any
            if (!container.children) container.children = []
            const insertIndex = index ?? container.children.length
            container.children.splice(insertIndex, 0, { ...block, parentId: containerId })
            return true
          }
          if ('children' in item) {
            if (findAndAdd((item as any).children || [])) return true
          }
        }
        return false
      }
      findAndAdd(draft)
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: block.id,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Move a block from its current location to a container
   */
  moveBlockToContainer: (blockId, targetContainerId, index) => {
    const { blocks, history } = get()
    const oldBlocks = JSON.parse(JSON.stringify(blocks))

    const newBlocks = produce(blocks, (draft) => {
      let movedBlock: StoreBlock | null = null

      // First, find and remove the block from its current location
      const removeBlock = (items: StoreBlock[], parentId?: string): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === blockId) {
            movedBlock = { ...items[i] }
            items.splice(i, 1)
            return true
          }
          if ('children' in items[i]) {
            if (removeBlock((items[i] as any).children || [], items[i].id)) return true
          }
        }
        return false
      }

      // Remove from top level or nested
      if (!removeBlock(draft)) return

      if (!movedBlock) return

      // Then add to target container
      const addToContainer = (items: StoreBlock[]): boolean => {
        for (const item of items) {
          if (item.id === targetContainerId && 'children' in item) {
            const container = item as any
            if (!container.children) container.children = []
            const insertIndex = index ?? container.children.length
            container.children.splice(insertIndex, 0, { ...movedBlock, parentId: targetContainerId })
            return true
          }
          if ('children' in item) {
            if (addToContainer((item as any).children || [])) return true
          }
        }
        return false
      }

      addToContainer(draft)
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Move a block within the same container
   */
  moveBlockWithinContainer: (containerId, fromIndex, toIndex) => {
    const { blocks, history } = get()
    const oldBlocks = JSON.parse(JSON.stringify(blocks))

    const newBlocks = produce(blocks, (draft) => {
      const moveInContainer = (items: StoreBlock[]): boolean => {
        for (const item of items) {
          if (item.id === containerId && 'children' in item) {
            const container = item as any
            if (!container.children) return false
            const [moved] = container.children.splice(fromIndex, 1)
            container.children.splice(toIndex, 0, moved)
            return true
          }
          if ('children' in item) {
            if (moveInContainer((item as any).children || [])) return true
          }
        }
        return false
      }
      moveInContainer(draft)
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  /**
   * Remove a block from a container
   */
  removeBlockFromContainer: (containerId, blockId) => {
    const { blocks, selectedBlockId, history } = get()
    const oldBlocks = JSON.parse(JSON.stringify(blocks))

    const newBlocks = produce(blocks, (draft) => {
      const removeFromContainer = (items: StoreBlock[]): boolean => {
        for (const item of items) {
          if (item.id === containerId && 'children' in item) {
            const container = item as any
            if (!container.children) return false
            const index = container.children.findIndex((c: StoreBlock) => c.id === blockId)
            if (index !== -1) {
              container.children.splice(index, 1)
              return true
            }
          }
          if ('children' in item) {
            if (removeFromContainer((item as any).children || [])) return true
          }
        }
        return false
      }
      removeFromContainer(draft)
    })

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      selectedBlockId: selectedBlockId === blockId ? null : selectedBlockId,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // BLOCK LOCKING
  // ============================================================================

  toggleBlockLock: (blockId) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const currentBlock = blocks[index]
    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, locked: !currentBlock.locked } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  lockSelectedBlocks: () => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length === 0) return

    const oldBlocks = [...blocks]
    const newBlocks = blocks.map((b) => 
      selectedBlockIds.includes(b.id) ? { ...b, locked: true } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  unlockSelectedBlocks: () => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length === 0) return

    const oldBlocks = [...blocks]
    const newBlocks = blocks.map((b) => 
      selectedBlockIds.includes(b.id) ? { ...b, locked: false } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // BLOCK GROUPING
  // ============================================================================

  groupSelectedBlocks: () => {
    const { blocks, selectedBlockIds, history } = get()
    if (selectedBlockIds.length < 2) return

    const oldBlocks = [...blocks]
    const groupId = generateUniqueId('group')
    
    const newBlocks = blocks.map((b) => 
      selectedBlockIds.includes(b.id) ? { ...b, groupId } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  ungroupBlock: (groupId) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    
    const newBlocks = blocks.map((b) => 
      b.groupId === groupId ? { ...b, groupId: undefined } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // COPY/PASTE STYLES
  // ============================================================================

  copyBlockStyles: (blockId) => {
    const { blocks } = get()
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    const copiedStyles: CopiedStyles = {
      settings: { ...block.settings },
      copiedAt: Date.now(),
      sourceBlockType: block.type,
    }
    set({ copiedStyles })
  },

  pasteBlockStyles: (blockId) => {
    const { blocks, copiedStyles, history } = get()
    if (!copiedStyles) return

    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const targetBlock = blocks[index]
    
    // Only paste compatible style properties (skip type-specific ones)
    const styleProps = ['backgroundColor', 'textColor', 'padding', 'margin', 'alignment', 'maxWidth']
    const newSettings = { ...targetBlock.settings } as Record<string, unknown>
    
    for (const prop of styleProps) {
      if (prop in copiedStyles.settings) {
        (newSettings as Record<string, unknown>)[prop] = copiedStyles.settings[prop]
      }
    }

    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, settings: newSettings } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // RESPONSIVE VISIBILITY
  // ============================================================================

  setBlockResponsiveVisibility: (blockId, visibility) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, responsiveVisibility: visibility } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },

  // ============================================================================
  // CUSTOM CSS CLASS
  // ============================================================================

  setBlockCustomClass: (blockId, className) => {
    const { blocks, history } = get()
    const oldBlocks = [...blocks]
    const index = blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newBlocks = blocks.map((b, i) => 
      i === index ? { ...b, customClass: className } as StoreBlock : b
    )

    const newPast = [...history.past, oldBlocks].slice(-MAX_HISTORY)
    set({
      blocks: newBlocks,
      isDirty: true,
      history: { past: newPast, future: [] },
    })
  },
}))


// ============================================================================
// SELECTORS
// ============================================================================

// Basic selectors
export const selectBlocks = (state: EditorStore) => state.blocks
export const selectSelectedBlockId = (state: EditorStore) => state.selectedBlockId
export const selectSelectedBlockIds = (state: EditorStore) => state.selectedBlockIds
export const selectHoveredBlockId = (state: EditorStore) => state.hoveredBlockId
export const selectCanUndo = (state: EditorStore) => state.history.past.length > 0
export const selectCanRedo = (state: EditorStore) => state.history.future.length > 0
export const selectIsDirty = (state: EditorStore) => state.isDirty
export const selectIsPreviewReady = (state: EditorStore) => state.isPreviewReady
export const selectInlineEdit = (state: EditorStore) => state.inlineEdit
export const selectEditorMode = (state: EditorStore) => state.editorMode
export const selectViewport = (state: EditorStore) => state.viewport
export const selectActiveDragId = (state: EditorStore) => state.activeDragId
export const selectOverBlockId = (state: EditorStore) => state.overBlockId

// Smart guides selectors
export const selectActiveGuides = (state: EditorStore) => state.activeGuides
export const selectSnappingEnabled = (state: EditorStore) => state.snappingEnabled

// Multi-select selectors
export const selectHasMultipleSelected = (state: EditorStore) => state.selectedBlockIds.length > 1
export const selectSelectionCount = (state: EditorStore) => state.selectedBlockIds.length
export const selectIsBlockInSelection = (blockId: string) => (state: EditorStore) => 
  state.selectedBlockIds.includes(blockId)

// NOTE: selectSelectedBlocks creates a new array on each call.
// Use with useMemo in components or use shallow comparison:
// const selectedBlocks = useEditorStore(selectSelectedBlocks, shallow)
// Or derive in component: useMemo(() => blocks.filter(...), [blocks, selectedBlockIds])
export const selectSelectedBlocks = (state: EditorStore) => 
  state.blocks.filter(b => state.selectedBlockIds.includes(b.id))

// Autosave selectors
export const selectAutosaveStatus = (state: EditorStore) => state.autosaveStatus
export const selectLastAutosaveAt = (state: EditorStore) => state.lastAutosaveAt
export const selectAutosaveError = (state: EditorStore) => state.autosaveError

// Clipboard selectors
export const selectClipboardBlock = (state: EditorStore) => state.clipboardBlock
export const selectHasClipboardContent = (state: EditorStore) => state.clipboardBlock !== null

// Copied styles selectors
export const selectCopiedStyles = (state: EditorStore) => state.copiedStyles
export const selectHasCopiedStyles = (state: EditorStore) => state.copiedStyles !== null

// Block locking selectors
export const selectIsBlockLocked = (blockId: string) => (state: EditorStore) =>
  state.blocks.find(b => b.id === blockId)?.locked ?? false
export const selectLockedBlockIds = (state: EditorStore) =>
  state.blocks.filter(b => b.locked).map(b => b.id)

// Block grouping selectors
export const selectBlockGroupId = (blockId: string) => (state: EditorStore) =>
  state.blocks.find(b => b.id === blockId)?.groupId
export const selectBlocksInGroup = (groupId: string) => (state: EditorStore) =>
  state.blocks.filter(b => b.groupId === groupId)
export const selectGroupIds = (state: EditorStore) =>
  [...new Set(state.blocks.filter(b => b.groupId).map(b => b.groupId!))]

// Focus mode selectors
export const selectFocusMode = (state: EditorStore) => state.focusMode
export const selectIsInFocusMode = (state: EditorStore) => state.focusMode !== null
export const selectFocusedBlockId = (state: EditorStore) => state.focusMode?.blockId ?? null

// Derived selectors - these need to be used with shallow comparison or useMemo
export const selectBlockIds = (state: EditorStore) => state.blocks.map(b => b.id)
export const selectSortedBlocks = (state: EditorStore) => 
  [...state.blocks].sort((a, b) => a.order - b.order)
export const selectBlockCount = (state: EditorStore) => state.blocks.length
export const selectSelectedBlock = (state: EditorStore) => 
  state.selectedBlockId ? state.blocks.find(b => b.id === state.selectedBlockId) : null
export const selectHoveredBlock = (state: EditorStore) =>
  state.hoveredBlockId ? state.blocks.find(b => b.id === state.hoveredBlockId) : null
export const selectHiddenBlockCount = (state: EditorStore) =>
  state.blocks.filter(b => !b.visible).length

// Block-specific selector factories
export const createBlockSelector = (blockId: string) => (state: EditorStore) => 
  state.blocks.find(b => b.id === blockId)

export const createIsBlockSelectedSelector = (blockId: string) => (state: EditorStore) =>
  state.selectedBlockId === blockId

export const createIsBlockHoveredSelector = (blockId: string) => (state: EditorStore) =>
  state.hoveredBlockId === blockId

export const createIsBlockDraggingSelector = (blockId: string) => (state: EditorStore) =>
  state.activeDragId === blockId

export const createIsBlockDropTargetSelector = (blockId: string) => (state: EditorStore) =>
  state.overBlockId === blockId && state.activeDragId !== blockId

export const createBlockInteractionSelector = (blockId: string) => (state: EditorStore) => ({
  isSelected: state.selectedBlockId === blockId,
  isHovered: state.hoveredBlockId === blockId,
  isDragging: state.activeDragId === blockId,
  isDropTarget: state.overBlockId === blockId && state.activeDragId !== blockId,
})

// Nested block selectors
import { findBlockById, findParentBlock, getBlockPath, flattenBlocks, isContainerBlock } from "@/types/blocks"

export const selectFlattenedBlocks = (state: EditorStore) => flattenBlocks(state.blocks)

export const selectBlockById = (blockId: string) => (state: EditorStore) => 
  findBlockById(state.blocks, blockId)

export const selectParentBlock = (childId: string) => (state: EditorStore) =>
  findParentBlock(state.blocks, childId)

export const selectBlockPath = (blockId: string) => (state: EditorStore) =>
  getBlockPath(state.blocks, blockId)

export const selectContainerBlocks = (state: EditorStore) =>
  flattenBlocks(state.blocks).filter(isContainerBlock)

export { shallow }
