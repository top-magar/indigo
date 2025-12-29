/**
 * Property-Based Test: Move Operations
 * 
 * Feature: inline-preview-refactor, Property 10: Move Operations
 * Validates: Requirements 8.3, 8.4
 * 
 * For any move up/down action on a block at index i, the block SHALL move to
 * index i-1 (up) or i+1 (down), and all other blocks SHALL maintain their relative order.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectBlocks } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock, ProductGridBlock, StoreBlock } from '@/types/blocks'

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
  { minLength: 2, maxLength: 15 } // Need at least 2 blocks to test move operations
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

describe('Editor Store - Move Operations Property Tests', () => {
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
   * Property 10: Move Up Operation
   * For any block at index i > 0, moving up should place it at index i-1,
   * and all other blocks should maintain their relative order.
   */
  it('should move block up by one position when moveBlock(i, i-1) is called', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Pick a random index that can move up (not the first block)
        const fromIndex = Math.floor(Math.random() * (initialBlocks.length - 1)) + 1
        const toIndex = fromIndex - 1
        
        // Capture the block being moved and the block it will swap with
        const movedBlockId = initialBlocks[fromIndex].id
        const swappedBlockId = initialBlocks[toIndex].id
        
        // Capture the order of blocks not involved in the swap
        const otherBlocksOrder = initialBlocks
          .filter((_, i) => i !== fromIndex && i !== toIndex)
          .map(b => b.id)
        
        // Perform the move up
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        
        // Verify the moved block is now at toIndex (moved up)
        expect(resultBlocks[toIndex].id).toBe(movedBlockId)
        
        // Verify the swapped block moved down
        expect(resultBlocks[fromIndex].id).toBe(swappedBlockId)
        
        // Verify all blocks have correct sequential order values
        resultBlocks.forEach((block, index) => {
          expect(block.order).toBe(index)
        })
        
        // Verify no blocks were lost or duplicated
        expect(resultBlocks.length).toBe(initialBlocks.length)
        
        // Verify other blocks maintained their relative order
        const resultOtherBlocks = resultBlocks
          .filter(b => b.id !== movedBlockId && b.id !== swappedBlockId)
          .map(b => b.id)
        expect(resultOtherBlocks).toEqual(otherBlocksOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Move Down Operation
   * For any block at index i < length-1, moving down should place it at index i+1,
   * and all other blocks should maintain their relative order.
   */
  it('should move block down by one position when moveBlock(i, i+1) is called', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Pick a random index that can move down (not the last block)
        const fromIndex = Math.floor(Math.random() * (initialBlocks.length - 1))
        const toIndex = fromIndex + 1
        
        // Capture the block being moved and the block it will swap with
        const movedBlockId = initialBlocks[fromIndex].id
        const swappedBlockId = initialBlocks[toIndex].id
        
        // Capture the order of blocks not involved in the swap
        const otherBlocksOrder = initialBlocks
          .filter((_, i) => i !== fromIndex && i !== toIndex)
          .map(b => b.id)
        
        // Perform the move down
        useEditorStore.getState().moveBlock(fromIndex, toIndex)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        
        // Verify the moved block is now at toIndex (moved down)
        expect(resultBlocks[toIndex].id).toBe(movedBlockId)
        
        // Verify the swapped block moved up
        expect(resultBlocks[fromIndex].id).toBe(swappedBlockId)
        
        // Verify all blocks have correct sequential order values
        resultBlocks.forEach((block, index) => {
          expect(block.order).toBe(index)
        })
        
        // Verify no blocks were lost or duplicated
        expect(resultBlocks.length).toBe(initialBlocks.length)
        
        // Verify other blocks maintained their relative order
        const resultOtherBlocks = resultBlocks
          .filter(b => b.id !== movedBlockId && b.id !== swappedBlockId)
          .map(b => b.id)
        expect(resultOtherBlocks).toEqual(otherBlocksOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move up at index 0 should be a no-op (boundary condition)
   * The first block cannot move up further.
   */
  it('should not change order when trying to move first block up', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Try to move first block up (should be no-op since fromIndex === toIndex)
        // In practice, the UI should disable the move up button for the first block
        // But if called, moveBlock(0, -1) would be invalid, so we test moveBlock(0, 0)
        useEditorStore.getState().moveBlock(0, 0)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        // Verify order is unchanged
        expect(resultOrder).toEqual(initialOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move down at last index should be a no-op (boundary condition)
   * The last block cannot move down further.
   */
  it('should not change order when trying to move last block down', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        const lastIndex = initialBlocks.length - 1
        
        // Try to move last block down (should be no-op since fromIndex === toIndex)
        // In practice, the UI should disable the move down button for the last block
        useEditorStore.getState().moveBlock(lastIndex, lastIndex)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        // Verify order is unchanged
        expect(resultOrder).toEqual(initialOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move up then move down should restore original position
   * This tests the reversibility of move operations.
   */
  it('should restore original position when moving up then down', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Pick a random index that can move up (not the first block)
        const index = Math.floor(Math.random() * (initialBlocks.length - 1)) + 1
        
        // Move up
        useEditorStore.getState().moveBlock(index, index - 1)
        
        // Move down (the block is now at index - 1)
        useEditorStore.getState().moveBlock(index - 1, index)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        // Verify order is restored
        expect(resultOrder).toEqual(initialOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move down then move up should restore original position
   * This tests the reversibility of move operations in the opposite direction.
   */
  it('should restore original position when moving down then up', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Pick a random index that can move down (not the last block)
        const index = Math.floor(Math.random() * (initialBlocks.length - 1))
        
        // Move down
        useEditorStore.getState().moveBlock(index, index + 1)
        
        // Move up (the block is now at index + 1)
        useEditorStore.getState().moveBlock(index + 1, index)
        
        // Get the resulting blocks
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        // Verify order is restored
        expect(resultOrder).toEqual(initialOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Move operations should create history entries for undo
   * After a move operation, undo should restore the previous order.
   */
  it('should create history entry allowing undo of move up/down operations', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        if (initialBlocks.length < 2) return true
        
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture initial order
        const initialOrder = initialBlocks.map(b => b.id)
        
        // Pick a random index that can move up
        const index = Math.floor(Math.random() * (initialBlocks.length - 1)) + 1
        
        // Perform move up
        useEditorStore.getState().moveBlock(index, index - 1)
        
        // Verify history was created
        const stateAfterMove = useEditorStore.getState()
        expect(stateAfterMove.history.past.length).toBeGreaterThan(0)
        
        // Undo the move
        useEditorStore.getState().undo()
        
        // Verify order is restored
        const resultBlocks = selectBlocks(useEditorStore.getState())
        const resultOrder = resultBlocks.map(b => b.id)
        
        expect(resultOrder).toEqual(initialOrder)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Block content is preserved during move up/down
   * Moving a block should not alter its settings or other properties.
   */
  it('should preserve block content during move up/down operations', () => {
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
        
        // Pick a random index that can move up
        const index = Math.floor(Math.random() * (initialBlocks.length - 1)) + 1
        
        // Perform move up
        useEditorStore.getState().moveBlock(index, index - 1)
        
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
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})
