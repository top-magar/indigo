/**
 * Property-Based Test: Drag-Drop Order Synchronization
 * 
 * Feature: inline-preview-refactor, Property 9: Drag-Drop Order Synchronization
 * Validates: Requirements 7.3, 7.4
 * 
 * For any drag-drop reorder operation in InlinePreview, the resulting block order
 * SHALL match the order displayed in the LayersPanel (both use the same Editor Store).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectBlocks } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock, ProductGridBlock } from '@/types/blocks'

// Helper to create test blocks with unique IDs
function createHeroBlock(id: string, order: number): HeroBlock {
  return {
    id,
    type: 'hero',
    order,
    visible: true,
    variant: 'full-width',
    settings: {
      headline: `Hero ${id}`,
      subheadline: 'Test subheadline',
      primaryCtaText: 'Shop Now',
      primaryCtaLink: '/shop',
      overlayOpacity: 0.5,
      textAlignment: 'center',
      height: 'large',
    },
  }
}

function createHeaderBlock(id: string, order: number): HeaderBlock {
  return {
    id,
    type: 'header',
    order,
    visible: true,
    variant: 'classic',
    settings: {
      logoText: 'Test Store',
      navLinks: [{ label: 'Home', href: '/' }],
      showSearch: true,
      showAccount: true,
      sticky: true,
    },
  }
}

function createFooterBlock(id: string, order: number): FooterBlock {
  return {
    id,
    type: 'footer',
    order,
    visible: true,
    variant: 'multi-column',
    settings: {
      logoText: 'Test Store',
      columns: [{ title: 'Links', links: [{ label: 'About', href: '/about' }] }],
      socialLinks: [],
      showPaymentIcons: true,
      showNewsletter: false,
      legalLinks: [],
    },
  }
}

function createProductGridBlock(id: string, order: number): ProductGridBlock {
  return {
    id,
    type: 'product-grid',
    order,
    visible: true,
    variant: 'standard',
    settings: {
      productsToShow: 8,
      columns: 4,
      showPrices: true,
      showQuickAdd: true,
      showReviews: false,
      showViewAll: true,
      sortOrder: 'newest',
    },
  }
}

// Arbitrary for generating a list of blocks with unique IDs
const blocksArb = fc.array(
  fc.integer({ min: 0, max: 3 }).chain((blockType) => {
    return fc.integer({ min: 1, max: 10000 }).map((id) => {
      switch (blockType) {
        case 0:
          return createHeroBlock(`hero-${id}`, 0)
        case 1:
          return createHeaderBlock(`header-${id}`, 0)
        case 2:
          return createFooterBlock(`footer-${id}`, 0)
        default:
          return createProductGridBlock(`product-grid-${id}`, 0)
      }
    })
  }),
  { minLength: 2, maxLength: 15 } // Need at least 2 blocks to test reordering
).map((blocks) => {
  // Ensure unique IDs and correct order
  const seen = new Set<string>()
  return blocks
    .filter((block) => {
      if (seen.has(block.id)) return false
      seen.add(block.id)
      return true
    })
    .map((block, index) => ({ ...block, order: index }))
}).filter((blocks) => blocks.length >= 2) // Ensure we have at least 2 blocks after deduplication

// Arbitrary for generating valid move operations (fromIndex, toIndex)
const moveOperationArb = (blockCount: number) => {
  if (blockCount < 2) {
    return fc.constant({ fromIndex: 0, toIndex: 0 })
  }
  return fc.tuple(
    fc.integer({ min: 0, max: blockCount - 1 }),
    fc.integer({ min: 0, max: blockCount - 1 })
  ).filter(([from, to]) => from !== to)
    .map(([fromIndex, toIndex]) => ({ fromIndex, toIndex }))
}

// Arbitrary for generating a sequence of move operations
const moveSequenceArb = (blockCount: number, maxMoves: number = 10) => {
  return fc.array(moveOperationArb(blockCount), { minLength: 1, maxLength: maxMoves })
}

describe('Editor Store - Drag-Drop Order Synchronization Property Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      isDirty: false,
      isPreviewReady: false,
      history: { past: [], future: [] },
      inlineEdit: null,
      editorMode: 'edit',
      viewport: 'desktop',
      activeDragId: null,
      overBlockId: null,
    })
  })

  /**
   * Property 9: Drag-Drop Order Synchronization
   * For any drag-drop reorder operation, the resulting block order SHALL be consistent.
   * The block at fromIndex should move to toIndex, and all other blocks should shift accordingly.
   */
  it('should correctly reorder blocks when moveBlock is called', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true // Skip if not enough blocks
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Generate a valid move operation
        const fromIndex = Math.floor(Math.random() * initialBlocks.length)
        let toIndex = Math.floor(Math.random() * initialBlocks.length)
        while (toIndex === fromIndex && initialBlocks.length > 1) {
          toIndex = Math.floor(Math.random() * initialBlocks.length)
        }
        
        // Capture the block being moved
        const movedBlockId = initialBlocks[fromIndex].id
        
        // Perform the move
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        
        // Verify the moved block is at the new position
        expect(resultBlocks[toIndex].id).toBe(movedBlockId)
        
        // Verify all blocks have correct order values
        resultBlocks.forEach((block, index) => {
          expect(block.order).toBe(index)
        })
        
        // Verify no blocks were lost or duplicated
        expect(resultBlocks.length).toBe(initialBlocks.length)
        const resultIds = new Set(resultBlocks.map(b => b.id))
        const initialIds = new Set(initialBlocks.map(b => b.id))
        expect(resultIds).toEqual(initialIds)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Block order values are always sequential after any move operation
   * For any sequence of move operations, block.order values should always be 0, 1, 2, ...
   */
  it('should maintain sequential order values after any sequence of moves', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, moves: [] })
          return moveSequenceArb(blocks.length).map((moves) => ({ blocks, moves }))
        }),
        ({ blocks, moves }) => {
          if (blocks.length < 2) return true
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Apply all move operations
          for (const { fromIndex, toIndex } of moves) {
            const currentBlocks = selectBlocks(useEditorStore.getState())
            // Ensure indices are still valid after previous moves
            if (fromIndex < currentBlocks.length && toIndex < currentBlocks.length) {
              useEditorStore.getState().moveBlock(fromIndex, toIndex)
            }
          }
          
          // Verify order values are sequential
          const resultBlocks = selectBlocks(useEditorStore.getState())
          resultBlocks.forEach((block, index) => {
            expect(block.order).toBe(index)
          })
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move operation is reversible
   * Moving a block from A to B and then from B to A should restore original order
   */
  it('should be reversible - moving back restores original order', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Generate valid indices
        const fromIndex = Math.floor(Math.random() * initialBlocks.length)
        let toIndex = Math.floor(Math.random() * initialBlocks.length)
        while (toIndex === fromIndex && initialBlocks.length > 1) {
          toIndex = Math.floor(Math.random() * initialBlocks.length)
        }
        
        // Move forward
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Move back
        useEditorStore.getState().moveBlock(toIndex, fromIndex)
        
        // Verify order is restored
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        expect(resultOrder).toEqual(initialOrder)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Drag state synchronization
   * Setting activeDragId and overBlockId should be reflected in the store
   * This ensures InlinePreview and LayersPanel can share drag state
   */
  it('should synchronize drag state between components', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Pick random blocks for drag state
        const dragBlockIndex = Math.floor(Math.random() * initialBlocks.length)
        const overBlockIndex = Math.floor(Math.random() * initialBlocks.length)
        
        const dragBlockId = initialBlocks[dragBlockIndex].id
        const overBlockId = initialBlocks[overBlockIndex].id
        
        // Set drag state (simulating drag start)
        useEditorStore.getState().setActiveDragId(dragBlockId)
        useEditorStore.getState().setOverBlockId(overBlockId)
        
        // Verify drag state is set
        const state = useEditorStore.getState()
        expect(state.activeDragId).toBe(dragBlockId)
        expect(state.overBlockId).toBe(overBlockId)
        
        // Clear drag state (simulating drag end)
        useEditorStore.getState().setActiveDragId(null)
        useEditorStore.getState().setOverBlockId(null)
        
        // Verify drag state is cleared
        const clearedState = useEditorStore.getState()
        expect(clearedState.activeDragId).toBeNull()
        expect(clearedState.overBlockId).toBeNull()
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move operation creates history entry for undo
   * After a move operation, undo should restore the previous order
   */
  it('should create history entry allowing undo of move operations', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Generate valid indices
        const fromIndex = Math.floor(Math.random() * initialBlocks.length)
        let toIndex = Math.floor(Math.random() * initialBlocks.length)
        while (toIndex === fromIndex && initialBlocks.length > 1) {
          toIndex = Math.floor(Math.random() * initialBlocks.length)
        }
        
        // Perform move
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Verify history was created
        const stateAfterMove = useEditorStore.getState()
        expect(stateAfterMove.history.past.length).toBeGreaterThan(0)
        
        // Undo the move
        useEditorStore.getState().undo()
        
        // Verify order is restored
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        expect(resultOrder).toEqual(initialOrder)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Block content is preserved during move
   * Moving a block should not alter its settings or other properties
   */
  it('should preserve block content during move operations', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial block data (excluding order)
        const initialBlockData = initialBlocks.map(b => {
          const { order, ...rest } = b
          return JSON.stringify(rest)
        })
        
        // Generate valid indices
        const fromIndex = Math.floor(Math.random() * initialBlocks.length)
        let toIndex = Math.floor(Math.random() * initialBlocks.length)
        while (toIndex === fromIndex && initialBlocks.length > 1) {
          toIndex = Math.floor(Math.random() * initialBlocks.length)
        }
        
        // Perform move
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Get result blocks and compare content (excluding order)
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultBlockData = resultBlocks.map(b => {
          const { order, ...rest } = b
          return JSON.stringify(rest)
        })
        
        // Sort both arrays to compare content regardless of order
        const sortedInitial = [...initialBlockData].sort()
        const sortedResult = [...resultBlockData].sort()
        
        expect(sortedResult).toEqual(sortedInitial)
      }),
      { numRuns: 100 }
    )
  })
})
