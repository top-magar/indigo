/**
 * useKeyboardNavigation Hook - Advanced keyboard navigation for the layers panel.
 *
 * Features:
 * - Arrow key navigation (up/down to move between blocks)
 * - Enter to select/edit block
 * - Space to toggle selection
 * - Delete/Backspace to delete selected
 * - Cmd/Ctrl+D to duplicate
 * - Cmd/Ctrl+A to select all
 * - Escape to clear selection
 * - Tab to move focus
 * - Home/End to jump to first/last block
 * - Shift+Arrow for range selection
 * - Tracks focused block ID separately from selected
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { StoreBlock } from '@/types/blocks'
import { flattenBlocks } from '@/types/blocks'

// =============================================================================
// TYPES
// =============================================================================

export interface UseKeyboardNavigationOptions {
  blocks: StoreBlock[]
  selectedIds: Set<string>
  onSelect: (id: string, mode: 'replace' | 'add' | 'toggle') => void
  onSelectRange: (fromId: string, toId: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onEdit: (id: string) => void
  enabled?: boolean
}

export interface UseKeyboardNavigationReturn {
  focusedId: string | null
  setFocusedId: (id: string | null) => void
  handleKeyDown: (e: KeyboardEvent) => void
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useKeyboardNavigation({
  blocks,
  selectedIds,
  onSelect,
  onSelectRange,
  onDelete,
  onDuplicate,
  onSelectAll,
  onClearSelection,
  onEdit,
  enabled = true,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  
  // Track the anchor point for range selection (shift+arrow)
  const rangeAnchorRef = useRef<string | null>(null)

  // Flatten blocks to get a linear list for navigation (handles nested blocks)
  const flatBlocks = useMemo(() => flattenBlocks(blocks), [blocks])

  // Get current focused index in the flattened list
  const focusedIndex = useMemo(() => {
    if (!focusedId) return -1
    return flatBlocks.findIndex((b) => b.id === focusedId)
  }, [focusedId, flatBlocks])

  // Scroll focused block into view when focus changes
  useEffect(() => {
    if (!focusedId) return

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-block-id="${focusedId}"]`)
      element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }, [focusedId])

  // Navigate to a specific index and optionally select
  const navigateToIndex = useCallback(
    (index: number, selectMode?: 'replace' | 'add' | 'toggle') => {
      const clampedIndex = Math.max(0, Math.min(index, flatBlocks.length - 1))
      const block = flatBlocks[clampedIndex]

      if (block) {
        setFocusedId(block.id)
        if (selectMode) {
          onSelect(block.id, selectMode)
        }
      }
    },
    [flatBlocks, onSelect]
  )

  // Handle range selection from anchor to target
  const handleRangeSelection = useCallback(
    (targetId: string) => {
      const anchorId = rangeAnchorRef.current
      if (!anchorId) {
        // No anchor set, just select the target
        onSelect(targetId, 'replace')
        rangeAnchorRef.current = targetId
        return
      }

      onSelectRange(anchorId, targetId)
    },
    [onSelect, onSelectRange]
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const isMod = e.metaKey || e.ctrlKey
      const isShift = e.shiftKey
      const key = e.key

      // Ignore if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Initialize focus if not set and navigation key pressed
      if (!focusedId && flatBlocks.length > 0) {
        if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(key)) {
          e.preventDefault()
          const firstBlock = flatBlocks[0]
          setFocusedId(firstBlock.id)
          rangeAnchorRef.current = firstBlock.id
          return
        }
      }

      switch (key) {
        // =================================================================
        // ARROW KEY NAVIGATION
        // =================================================================
        
        // Arrow Up - Move focus up, with shift for range selection
        case 'ArrowUp': {
          e.preventDefault()
          if (focusedIndex <= 0) break

          const newIndex = focusedIndex - 1
          const newBlock = flatBlocks[newIndex]

          if (isShift) {
            // Range selection: extend selection from anchor to new position
            setFocusedId(newBlock.id)
            handleRangeSelection(newBlock.id)
          } else {
            // Normal navigation: move focus and replace selection
            setFocusedId(newBlock.id)
            onSelect(newBlock.id, 'replace')
            rangeAnchorRef.current = newBlock.id
          }
          break
        }

        // Arrow Down - Move focus down, with shift for range selection
        case 'ArrowDown': {
          e.preventDefault()
          if (focusedIndex >= flatBlocks.length - 1) break

          const newIndex = focusedIndex + 1
          const newBlock = flatBlocks[newIndex]

          if (isShift) {
            // Range selection: extend selection from anchor to new position
            setFocusedId(newBlock.id)
            handleRangeSelection(newBlock.id)
          } else {
            // Normal navigation: move focus and replace selection
            setFocusedId(newBlock.id)
            onSelect(newBlock.id, 'replace')
            rangeAnchorRef.current = newBlock.id
          }
          break
        }

        // =================================================================
        // HOME / END NAVIGATION
        // =================================================================

        // Home - Jump to first block
        case 'Home': {
          e.preventDefault()
          if (flatBlocks.length === 0) break

          const firstBlock = flatBlocks[0]

          if (isShift) {
            // Range selection from anchor to first
            setFocusedId(firstBlock.id)
            handleRangeSelection(firstBlock.id)
          } else {
            setFocusedId(firstBlock.id)
            onSelect(firstBlock.id, 'replace')
            rangeAnchorRef.current = firstBlock.id
          }
          break
        }

        // End - Jump to last block
        case 'End': {
          e.preventDefault()
          if (flatBlocks.length === 0) break

          const lastBlock = flatBlocks[flatBlocks.length - 1]

          if (isShift) {
            // Range selection from anchor to last
            setFocusedId(lastBlock.id)
            handleRangeSelection(lastBlock.id)
          } else {
            setFocusedId(lastBlock.id)
            onSelect(lastBlock.id, 'replace')
            rangeAnchorRef.current = lastBlock.id
          }
          break
        }

        // =================================================================
        // TAB NAVIGATION
        // =================================================================

        // Tab - Move focus forward/backward through blocks
        case 'Tab': {
          e.preventDefault()
          
          if (flatBlocks.length === 0) break

          if (isShift) {
            // Shift+Tab: Move focus backward
            if (focusedIndex > 0) {
              const newBlock = flatBlocks[focusedIndex - 1]
              setFocusedId(newBlock.id)
            } else {
              // Wrap to last block
              const lastBlock = flatBlocks[flatBlocks.length - 1]
              setFocusedId(lastBlock.id)
            }
          } else {
            // Tab: Move focus forward
            if (focusedIndex < flatBlocks.length - 1) {
              const newBlock = flatBlocks[focusedIndex + 1]
              setFocusedId(newBlock.id)
            } else {
              // Wrap to first block
              const firstBlock = flatBlocks[0]
              setFocusedId(firstBlock.id)
            }
          }
          break
        }

        // =================================================================
        // SELECTION ACTIONS
        // =================================================================

        // Enter - Edit the focused block
        case 'Enter': {
          e.preventDefault()
          if (focusedId) {
            onEdit(focusedId)
          }
          break
        }

        // Space - Toggle selection of focused block
        case ' ': {
          e.preventDefault()
          if (focusedId) {
            onSelect(focusedId, 'toggle')
            // Update anchor for future range selections
            if (!selectedIds.has(focusedId)) {
              rangeAnchorRef.current = focusedId
            }
          }
          break
        }

        // Escape - Clear selection and focus
        case 'Escape': {
          e.preventDefault()
          onClearSelection()
          rangeAnchorRef.current = focusedId // Keep anchor at current focus
          break
        }

        // =================================================================
        // DELETE ACTIONS
        // =================================================================

        // Delete / Backspace - Delete selected blocks
        case 'Delete':
        case 'Backspace': {
          if (selectedIds.size > 0) {
            e.preventDefault()
            
            // Calculate next focus position before deletion
            let nextFocusId: string | null = null
            
            if (focusedId && selectedIds.has(focusedId)) {
              // Find next non-selected block after current focus
              for (let i = focusedIndex + 1; i < flatBlocks.length; i++) {
                if (!selectedIds.has(flatBlocks[i].id)) {
                  nextFocusId = flatBlocks[i].id
                  break
                }
              }
              
              // If no block after, find one before
              if (!nextFocusId) {
                for (let i = focusedIndex - 1; i >= 0; i--) {
                  if (!selectedIds.has(flatBlocks[i].id)) {
                    nextFocusId = flatBlocks[i].id
                    break
                  }
                }
              }
            }

            onDelete()

            // Update focus after deletion
            if (nextFocusId) {
              setFocusedId(nextFocusId)
              rangeAnchorRef.current = nextFocusId
            } else {
              setFocusedId(null)
              rangeAnchorRef.current = null
            }
          }
          break
        }

        // =================================================================
        // MODIFIER KEY COMMANDS
        // =================================================================

        default: {
          if (!isMod) break

          switch (key.toLowerCase()) {
            // Cmd/Ctrl+D - Duplicate selected blocks
            case 'd': {
              e.preventDefault()
              if (selectedIds.size > 0) {
                onDuplicate()
              }
              break
            }

            // Cmd/Ctrl+A - Select all blocks
            case 'a': {
              e.preventDefault()
              onSelectAll()
              // Set anchor to first block for future range selections
              if (flatBlocks.length > 0) {
                rangeAnchorRef.current = flatBlocks[0].id
              }
              break
            }
          }
          break
        }
      }
    },
    [
      enabled,
      focusedId,
      focusedIndex,
      flatBlocks,
      selectedIds,
      onSelect,
      onSelectRange,
      onDelete,
      onDuplicate,
      onSelectAll,
      onClearSelection,
      onEdit,
      handleRangeSelection,
    ]
  )

  return {
    focusedId,
    setFocusedId,
    handleKeyDown,
  }
}
