/**
 * Property-Based Test: Drag Operation Correctness
 * 
 * Feature: editor-improvements, Property 5: Drag Operation Correctness
 * Validates: Requirements 2.3, 2.5, 2.6
 * 
 * For any drag-and-drop operation, the resulting block order should reflect the visual
 * drop position, cancelled drags should restore original order, and ghost preview should
 * accurately show the target position.
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
  { minLength: 2, maxLength: 15 }
).map((blocks) => {
  const seen = new Set<string>()
  return blocks
    .filter((block) => {
      if (seen.has(block.id)) return false
      seen.add(block.id)
      return true
    })
    .map((block, index) => ({ ...block, order: index }))
}).filter((blocks) => blocks.length >= 2)

// Arbitrary for generating valid drag operations
const dragOperationArb = (blockCount: number) => {
  if (blockCount < 2) {
    return fc.constant({ dragIndex: 0, dropIndex: 0 })
  }
  return fc.tuple(
    fc.integer({ min: 0, max: blockCount - 1 }),
    fc.integer({ min: 0, max: blockCount - 1 })
  ).filter(([drag, drop]) => drag !== drop)
    .map(([dragIndex, dropIndex]) => ({ dragIndex, dropIndex }))
}

describe('Editor Store - Drag Operation Correctness Property Tests', () => {
  beforeEach(() => {
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
      autosaveStatus: 'idle',
      lastAutosaveAt: null,
      autosaveError: null,
      clipboardBlock: null,
      focusMode: null,
    })
  })

  /**
   * Property 5: Drag Operation Correctness - Visual Drop Position
   * For any drag-and-drop operation, the resulting block order should reflect
   * the visual drop position (the block should end up at the target index).
   * 
   * Validates: Requirement 2.5 - WHEN a drag ends successfully, THE InlinePreview
   * SHALL animate the block into its new position
   */
  it('should place block at the visual drop position after successful drag', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, operation: { dragIndex: 0, dropIndex: 0 } })
          return dragOperationArb(blocks.length).map((operation) => ({ blocks, operation }))
        }),
        ({ blocks, operation }) => {
          if (blocks.length < 2) return true
          
          const { dragIndex, dropIndex } = operation
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Capture the block being dragged
          const draggedBlockId = blocks[dragIndex].id
          
          // Simulate drag start
          useEditorStore.getState().setActiveDragId(draggedBlockId)
          
          // Simulate drag over target
          const targetBlockId = blocks[dropIndex].id
          useEditorStore.getState().setOverBlockId(targetBlockId)
          
          // Verify drag state is set correctly (ghost preview would use this)
          const dragState = useEditorStore.getState()
          expect(dragState.activeDragId).toBe(draggedBlockId)
          expect(dragState.overBlockId).toBe(targetBlockId)
          
          // Perform the move (simulating drag end)
          useEditorStore.getState().moveBlock(dragIndex, dropIndex)
          
          // Clear drag state
          useEditorStore.getState().setActiveDragId(null)
          useEditorStore.getState().setOverBlockId(null)
          
          // Verify the block is at the target position
          const resultBlocks = selectBlocks(useEditorStore.getState())
          expect(resultBlocks[dropIndex].id).toBe(draggedBlockId)
          
          // Verify all order values are sequential
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
   * Property 5: Drag Operation Correctness - Cancelled Drag Restoration
   * For any cancelled drag operation, the block order should remain unchanged
   * from the original state.
   * 
   * Validates: Requirement 2.6 - WHEN a drag is cancelled, THE Visual_Editor
   * SHALL smoothly return the block to its original position
   */
  it('should restore original order when drag is cancelled', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, operation: { dragIndex: 0, dropIndex: 0 } })
          return dragOperationArb(blocks.length).map((operation) => ({ blocks, operation }))
        }),
        ({ blocks, operation }) => {
          if (blocks.length < 2) return true
          
          const { dragIndex, dropIndex } = operation
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Capture initial order
          const initialOrder = blocks.map(b => b.id)
          
          // Simulate drag start
          const draggedBlockId = blocks[dragIndex].id
          useEditorStore.getState().setActiveDragId(draggedBlockId)
          
          // Simulate drag over target
          const targetBlockId = blocks[dropIndex].id
          useEditorStore.getState().setOverBlockId(targetBlockId)
          
          // Simulate drag cancel (clear state without moving)
          useEditorStore.getState().setActiveDragId(null)
          useEditorStore.getState().setOverBlockId(null)
          
          // Verify order is unchanged
          const resultBlocks = selectBlocks(useEditorStore.getState())
          const resultOrder = resultBlocks.map(b => b.id)
          
          expect(resultOrder).toEqual(initialOrder)
          
          // Verify all order values are still sequential
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
   * Property 5: Drag Operation Correctness - Ghost Preview Target Position
   * For any drag operation, the ghost preview should accurately show the target
   * position by having the correct overBlockId set in the store.
   * 
   * Validates: Requirement 2.3 - WHEN dragging over a block, THE InlinePreview
   * SHALL display a ghost preview showing the final position
   */
  it('should accurately track target position for ghost preview during drag', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, dragIndex: 0, hoverSequence: [] as number[] })
          return fc.tuple(
            fc.integer({ min: 0, max: blocks.length - 1 }),
            fc.array(fc.integer({ min: 0, max: blocks.length - 1 }), { minLength: 1, maxLength: 5 })
          ).map(([dragIndex, hoverSequence]) => ({ blocks, dragIndex, hoverSequence }))
        }),
        ({ blocks, dragIndex, hoverSequence }) => {
          if (blocks.length < 2) return true
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Simulate drag start
          const draggedBlockId = blocks[dragIndex].id
          useEditorStore.getState().setActiveDragId(draggedBlockId)
          
          // Simulate hovering over multiple blocks (as user drags around)
          for (const hoverIndex of hoverSequence) {
            const hoverBlockId = blocks[hoverIndex].id
            useEditorStore.getState().setOverBlockId(hoverBlockId)
            
            // Verify the ghost preview target is correctly tracked
            const state = useEditorStore.getState()
            expect(state.activeDragId).toBe(draggedBlockId)
            expect(state.overBlockId).toBe(hoverBlockId)
            
            // The ghost preview component would use these values to:
            // 1. Show the dragged block info (from activeDragId)
            // 2. Show the target position (from overBlockId index)
            const targetIndex = blocks.findIndex(b => b.id === hoverBlockId)
            expect(targetIndex).toBeGreaterThanOrEqual(0)
            expect(targetIndex).toBeLessThan(blocks.length)
          }
          
          // Clean up
          useEditorStore.getState().setActiveDragId(null)
          useEditorStore.getState().setOverBlockId(null)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Drag Operation Correctness - Block Integrity
   * For any successful drag operation, the block's content (type, variant, settings)
   * should remain unchanged - only the order should change.
   * 
   * Validates: Requirements 2.5, 2.6 - Block content preservation during drag
   */
  it('should preserve block content during drag operations', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, operation: { dragIndex: 0, dropIndex: 0 } })
          return dragOperationArb(blocks.length).map((operation) => ({ blocks, operation }))
        }),
        ({ blocks, operation }) => {
          if (blocks.length < 2) return true
          
          const { dragIndex, dropIndex } = operation
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Capture the dragged block's content (excluding order)
          const draggedBlock = blocks[dragIndex]
          const { order: _order, ...draggedBlockContent } = draggedBlock
          const originalContent = JSON.stringify(draggedBlockContent)
          
          // Simulate complete drag operation
          useEditorStore.getState().setActiveDragId(draggedBlock.id)
          useEditorStore.getState().setOverBlockId(blocks[dropIndex].id)
          useEditorStore.getState().moveBlock(dragIndex, dropIndex)
          useEditorStore.getState().setActiveDragId(null)
          useEditorStore.getState().setOverBlockId(null)
          
          // Find the block in the result
          const resultBlocks = selectBlocks(useEditorStore.getState())
          const resultBlock = resultBlocks.find(b => b.id === draggedBlock.id)
          
          expect(resultBlock).toBeDefined()
          
          if (resultBlock) {
            const { order: _resultOrder, ...resultBlockContent } = resultBlock
            const resultContent = JSON.stringify(resultBlockContent)
            
            // Content should be identical
            expect(resultContent).toBe(originalContent)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Drag Operation Correctness - No Block Loss
   * For any drag operation (successful or cancelled), no blocks should be
   * lost or duplicated.
   * 
   * Validates: Requirements 2.5, 2.6 - Block preservation during drag
   */
  it('should never lose or duplicate blocks during drag operations', () => {
    fc.assert(
      fc.property(
        blocksArb.chain((blocks) => {
          if (blocks.length < 2) return fc.constant({ blocks, operation: { dragIndex: 0, dropIndex: 0 }, shouldComplete: true })
          return fc.tuple(
            dragOperationArb(blocks.length),
            fc.boolean()
          ).map(([operation, shouldComplete]) => ({ blocks, operation, shouldComplete }))
        }),
        ({ blocks, operation, shouldComplete }) => {
          if (blocks.length < 2) return true
          
          const { dragIndex, dropIndex } = operation
          
          // Setup initial state
          useEditorStore.getState().setBlocks(blocks)
          
          // Capture initial block IDs
          const initialIds = new Set(blocks.map(b => b.id))
          const initialCount = blocks.length
          
          // Simulate drag start
          const draggedBlockId = blocks[dragIndex].id
          useEditorStore.getState().setActiveDragId(draggedBlockId)
          useEditorStore.getState().setOverBlockId(blocks[dropIndex].id)
          
          if (shouldComplete) {
            // Complete the drag
            useEditorStore.getState().moveBlock(dragIndex, dropIndex)
          }
          // else: cancel the drag (just clear state)
          
          // Clear drag state
          useEditorStore.getState().setActiveDragId(null)
          useEditorStore.getState().setOverBlockId(null)
          
          // Verify no blocks were lost or duplicated
          const resultBlocks = selectBlocks(useEditorStore.getState())
          const resultIds = new Set(resultBlocks.map(b => b.id))
          
          expect(resultBlocks.length).toBe(initialCount)
          expect(resultIds).toEqual(initialIds)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
