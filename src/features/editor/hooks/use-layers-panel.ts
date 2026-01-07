/**
 * useLayersPanel Hook - Manages layers panel state including view density,
 * search, multi-selection, and bulk actions.
 *
 * Features:
 * - View density with localStorage persistence
 * - Fuzzy search across block type, variant, and settings
 * - Multi-selection with replace, add, and toggle modes
 * - Bulk actions for visibility, lock, duplicate, and delete
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { StoreBlock } from '@/types/blocks'
import { flattenBlocks } from '@/types/blocks'
import { useEditorStore } from '@/features/editor/store'

// =============================================================================
// TYPES
// =============================================================================

export type ViewDensity = 'comfortable' | 'compact' | 'minimal'

export interface UseLayersPanelOptions {
  blocks: StoreBlock[]
}

export interface UseLayersPanelReturn {
  // View Density
  viewDensity: ViewDensity
  setViewDensity: (density: ViewDensity) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: StoreBlock[]

  // Multi-Selection
  selectedIds: Set<string>
  toggleSelection: (id: string, mode: 'replace' | 'add' | 'toggle') => void
  selectAll: () => void
  clearSelection: () => void
  selectRange: (fromId: string, toId: string) => void

  // Bulk Actions
  bulkToggleVisibility: () => void
  bulkToggleLock: () => void
  bulkDuplicate: () => void
  bulkDelete: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'layers-panel-view-density'
const DEFAULT_DENSITY: ViewDensity = 'comfortable'

// =============================================================================
// FUZZY SEARCH IMPLEMENTATION
// =============================================================================

/**
 * Calculate fuzzy match score between a query and a target string.
 * Returns a score where higher is better, or -1 if no match.
 *
 * Scoring:
 * - Exact match: highest score
 * - Starts with query: high score
 * - Contains query as substring: medium score
 * - Fuzzy character match: lower score based on gaps
 */
function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return -1

  const queryLower = query.toLowerCase()
  const targetLower = target.toLowerCase()

  // Exact match
  if (targetLower === queryLower) {
    return 1000
  }

  // Starts with query
  if (targetLower.startsWith(queryLower)) {
    return 900 + (queryLower.length / targetLower.length) * 100
  }

  // Contains query as substring
  const substringIndex = targetLower.indexOf(queryLower)
  if (substringIndex !== -1) {
    return 700 + (queryLower.length / targetLower.length) * 100 - substringIndex
  }

  // Fuzzy character matching
  let queryIndex = 0
  let score = 0
  let lastMatchIndex = -1
  let consecutiveBonus = 0

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      // Base score for match
      score += 10

      // Bonus for consecutive matches
      if (lastMatchIndex === i - 1) {
        consecutiveBonus += 5
        score += consecutiveBonus
      } else {
        consecutiveBonus = 0
      }

      // Bonus for matching at word boundaries
      if (i === 0 || /[\s\-_]/.test(target[i - 1])) {
        score += 15
      }

      lastMatchIndex = i
      queryIndex++
    }
  }

  // All query characters must be found
  if (queryIndex < queryLower.length) {
    return -1
  }

  // Penalize longer targets (prefer shorter matches)
  score -= (targetLower.length - queryLower.length) * 0.5

  return Math.max(0, score)
}

/**
 * Extract searchable text from a block's settings.
 * Recursively extracts string values from the settings object.
 */
function extractSettingsText(settings: Record<string, unknown>): string {
  const texts: string[] = []

  function extract(value: unknown): void {
    if (typeof value === 'string') {
      texts.push(value)
    } else if (Array.isArray(value)) {
      value.forEach(extract)
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(extract)
    }
  }

  extract(settings)
  return texts.join(' ')
}

/**
 * Calculate the best fuzzy match score for a block against a query.
 * Searches across type, variant, and settings content.
 */
function getBlockMatchScore(block: StoreBlock, query: string): number {
  if (!query.trim()) return 0

  const scores: number[] = []

  // Match against block type
  const typeScore = fuzzyScore(query, block.type)
  if (typeScore > 0) scores.push(typeScore * 1.5) // Boost type matches

  // Match against variant
  if ('variant' in block && typeof block.variant === 'string') {
    const variantScore = fuzzyScore(query, block.variant)
    if (variantScore > 0) scores.push(variantScore * 1.3) // Boost variant matches
  }

  // Match against settings content
  if ('settings' in block && block.settings) {
    const settingsText = extractSettingsText(block.settings as Record<string, unknown>)
    const settingsScore = fuzzyScore(query, settingsText)
    if (settingsScore > 0) scores.push(settingsScore)
  }

  // Return the best score found
  return scores.length > 0 ? Math.max(...scores) : -1
}

// =============================================================================
// LOCALSTORAGE HELPERS
// =============================================================================

function loadViewDensity(): ViewDensity {
  if (typeof window === 'undefined') return DEFAULT_DENSITY

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['comfortable', 'compact', 'minimal'].includes(stored)) {
      return stored as ViewDensity
    }
  } catch {
    // localStorage not available
  }

  return DEFAULT_DENSITY
}

function saveViewDensity(density: ViewDensity): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, density)
  } catch {
    // localStorage not available
  }
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useLayersPanel({ blocks }: UseLayersPanelOptions): UseLayersPanelReturn {
  // Get store actions
  const toggleBlockVisibility = useEditorStore((s) => s.toggleBlockVisibility)
  const toggleBlockLock = useEditorStore((s) => s.toggleBlockLock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const removeBlock = useEditorStore((s) => s.removeBlock)

  // ==========================================================================
  // VIEW DENSITY STATE
  // ==========================================================================

  const [viewDensity, setViewDensityState] = useState<ViewDensity>(DEFAULT_DENSITY)

  // Load from localStorage on mount
  useEffect(() => {
    setViewDensityState(loadViewDensity())
  }, [])

  const setViewDensity = useCallback((density: ViewDensity) => {
    setViewDensityState(density)
    saveViewDensity(density)
  }, [])

  // ==========================================================================
  // SEARCH STATE
  // ==========================================================================

  const [searchQuery, setSearchQuery] = useState('')

  // Flatten blocks for searching (includes nested blocks)
  const flatBlocks = useMemo(() => flattenBlocks(blocks), [blocks])

  // Filter and sort blocks based on fuzzy search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return flatBlocks
    }

    const scored = flatBlocks
      .map((block) => ({
        block,
        score: getBlockMatchScore(block, searchQuery),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.map(({ block }) => block)
  }, [flatBlocks, searchQuery])

  // ==========================================================================
  // MULTI-SELECTION STATE
  // ==========================================================================

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback(
    (id: string, mode: 'replace' | 'add' | 'toggle') => {
      setSelectedIds((prev) => {
        switch (mode) {
          case 'replace':
            return new Set([id])

          case 'add':
            if (prev.has(id)) return prev
            return new Set([...prev, id])

          case 'toggle':
            const next = new Set(prev)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            return next

          default:
            return prev
        }
      })
    },
    []
  )

  const selectAll = useCallback(() => {
    const allIds = flatBlocks.map((b) => b.id)
    setSelectedIds(new Set(allIds))
  }, [flatBlocks])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const fromIndex = flatBlocks.findIndex((b) => b.id === fromId)
      const toIndex = flatBlocks.findIndex((b) => b.id === toId)

      if (fromIndex === -1 || toIndex === -1) return

      const startIndex = Math.min(fromIndex, toIndex)
      const endIndex = Math.max(fromIndex, toIndex)

      const rangeIds = flatBlocks.slice(startIndex, endIndex + 1).map((b) => b.id)

      setSelectedIds((prev) => new Set([...prev, ...rangeIds]))
    },
    [flatBlocks]
  )

  // ==========================================================================
  // BULK ACTIONS
  // ==========================================================================

  const bulkToggleVisibility = useCallback(() => {
    if (selectedIds.size === 0) return

    // Determine the majority state to decide toggle direction
    const selectedBlocks = flatBlocks.filter((b) => selectedIds.has(b.id))
    const visibleCount = selectedBlocks.filter((b) => b.visible).length
    const shouldHide = visibleCount > selectedBlocks.length / 2

    selectedIds.forEach((id) => {
      const block = flatBlocks.find((b) => b.id === id)
      if (block && block.visible === shouldHide) {
        toggleBlockVisibility(id)
      }
    })
  }, [selectedIds, flatBlocks, toggleBlockVisibility])

  const bulkToggleLock = useCallback(() => {
    if (selectedIds.size === 0) return

    // Determine the majority state to decide toggle direction
    const selectedBlocks = flatBlocks.filter((b) => selectedIds.has(b.id))
    const lockedCount = selectedBlocks.filter((b) => b.locked).length
    const shouldUnlock = lockedCount > selectedBlocks.length / 2

    selectedIds.forEach((id) => {
      const block = flatBlocks.find((b) => b.id === id)
      if (block && (block.locked ?? false) === !shouldUnlock) {
        toggleBlockLock(id)
      }
    })
  }, [selectedIds, flatBlocks, toggleBlockLock])

  const bulkDuplicate = useCallback(() => {
    if (selectedIds.size === 0) return

    // Duplicate in order to maintain relative positions
    const sortedIds = flatBlocks
      .filter((b) => selectedIds.has(b.id))
      .map((b) => b.id)

    sortedIds.forEach((id) => {
      duplicateBlock(id)
    })

    // Clear selection after duplication
    clearSelection()
  }, [selectedIds, flatBlocks, duplicateBlock, clearSelection])

  const bulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return

    // Delete in reverse order to avoid index shifting issues
    const sortedIds = flatBlocks
      .filter((b) => selectedIds.has(b.id))
      .map((b) => b.id)
      .reverse()

    sortedIds.forEach((id) => {
      removeBlock(id)
    })

    // Clear selection after deletion
    clearSelection()
  }, [selectedIds, flatBlocks, removeBlock, clearSelection])

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // View Density
    viewDensity,
    setViewDensity,

    // Search
    searchQuery,
    setSearchQuery,
    searchResults,

    // Multi-Selection
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRange,

    // Bulk Actions
    bulkToggleVisibility,
    bulkToggleLock,
    bulkDuplicate,
    bulkDelete,
  }
}
