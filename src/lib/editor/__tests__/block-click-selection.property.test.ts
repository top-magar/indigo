/**
 * Property-Based Test: Block Click Selection
 * 
 * Feature: inline-preview-refactor, Property 3: Block Click Selection
 * Validates: Requirements 2.1
 * 
 * For any click event on a block in the InlinePreview, 
 * the Editor_Store's selectedBlockId SHALL be updated to that block's ID.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectSelectedBlockId, selectBlocks } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock } from '@/types/blocks'

// Helper to create test blocks
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

// Arbitrary for generating a list of blocks
const blocksArb = fc.array(
  fc.integer({ min: 0, max: 2 }).chain((blockType) => {
    return fc.integer({ min: 1, max: 1000 }).map((id) => {
      const order = 0 // Will be set correctly when added
      switch (blockType) {
        case 0:
          return createHeroBlock(`hero-${id}`, order)
        case 1:
          return createHeaderBlock(`header-${id}`, order)
        default:
          return createFooterBlock(`footer-${id}`, order)
      }
    })
  }),
  { minLength: 1, maxLength: 10 }
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
})

describe('Editor Store - Block Click Selection Property Tests', () => {
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
   * Property 3: Block Click Selection
   * For any click event on a block, the selectedBlockId should be updated
   * to that block's ID.
   */
  it('should update selectedBlockId when any block is clicked', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, clickIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          // Ensure no block is selected initially
          useEditorStore.getState().selectBlock(null)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBeNull()
          
          // Simulate clicking on a block (use modulo to ensure valid index)
          const targetIndex = clickIndex % initialBlocks.length
          const clickedBlock = initialBlocks[targetIndex]
          
          // Call selectBlock (this is what the click handler does)
          useEditorStore.getState().selectBlock(clickedBlock.id)
          
          // Verify the selection is updated
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(clickedBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Sequential Clicks
   * For any sequence of clicks on different blocks, each click should
   * update the selectedBlockId to the clicked block's ID.
   */
  it('should update selectedBlockId for each click in a sequence', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 10 }),
        (initialBlocks, clickSequence) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          // Simulate a sequence of clicks
          for (const clickIndex of clickSequence) {
            const targetIndex = clickIndex % initialBlocks.length
            const clickedBlock = initialBlocks[targetIndex]
            
            // Simulate click
            useEditorStore.getState().selectBlock(clickedBlock.id)
            
            // Verify the selection is updated immediately
            expect(selectSelectedBlockId(useEditorStore.getState())).toBe(clickedBlock.id)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Click on Same Block
   * Clicking on an already selected block should keep it selected.
   */
  it('should keep block selected when clicking on already selected block', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, clickIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = clickIndex % initialBlocks.length
          const clickedBlock = initialBlocks[targetIndex]
          
          // First click - select the block
          useEditorStore.getState().selectBlock(clickedBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(clickedBlock.id)
          
          // Second click on same block - should remain selected
          useEditorStore.getState().selectBlock(clickedBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(clickedBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Click Deselects Previous
   * Clicking on a different block should deselect the previously selected block.
   */
  it('should deselect previous block when clicking on a different block', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, firstClickIndex, secondClickIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const firstIndex = firstClickIndex % initialBlocks.length
          let secondIndex = secondClickIndex % initialBlocks.length
          
          // Ensure we click on different blocks
          if (secondIndex === firstIndex) {
            secondIndex = (secondIndex + 1) % initialBlocks.length
          }
          
          const firstBlock = initialBlocks[firstIndex]
          const secondBlock = initialBlocks[secondIndex]
          
          // First click
          useEditorStore.getState().selectBlock(firstBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(firstBlock.id)
          
          // Second click on different block
          useEditorStore.getState().selectBlock(secondBlock.id)
          
          // Verify only the second block is selected
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(secondBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).not.toBe(firstBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Selection Persists Through Other Operations
   * The selected block should remain selected after other store operations
   * (unless the selected block is removed).
   */
  it('should persist selection through other store operations', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, clickIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = clickIndex % initialBlocks.length
          const selectedBlock = initialBlocks[targetIndex]
          
          // Select a block
          useEditorStore.getState().selectBlock(selectedBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(selectedBlock.id)
          
          // Update a different block's settings
          const otherIndex = (targetIndex + 1) % initialBlocks.length
          const otherBlock = initialBlocks[otherIndex]
          useEditorStore.getState().updateBlock(otherBlock.id, { visible: false })
          
          // Selection should persist
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(selectedBlock.id)
          
          // Add a new block
          const newBlock = createHeroBlock(`new-hero-${Date.now()}`, initialBlocks.length)
          useEditorStore.getState().addBlock(newBlock)
          
          // Note: addBlock selects the new block, so we need to re-select
          useEditorStore.getState().selectBlock(selectedBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(selectedBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Selection Cleared When Block Removed
   * If the selected block is removed, the selection should be cleared.
   */
  it('should clear selection when selected block is removed', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, clickIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = clickIndex % initialBlocks.length
          const selectedBlock = initialBlocks[targetIndex]
          
          // Select a block
          useEditorStore.getState().selectBlock(selectedBlock.id)
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(selectedBlock.id)
          
          // Remove the selected block
          useEditorStore.getState().removeBlock(selectedBlock.id)
          
          // Selection should be cleared
          expect(selectSelectedBlockId(useEditorStore.getState())).toBeNull()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Block Click Selection - Click on Hidden Block
   * Clicking on a hidden block should still select it (for editing purposes).
   */
  it('should select hidden blocks when clicked', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, clickIndex) => {
          // Setup initial state with a hidden block
          const blocksWithHidden = initialBlocks.map((block, index) => ({
            ...block,
            visible: index !== clickIndex % initialBlocks.length ? block.visible : false,
          }))
          useEditorStore.getState().setBlocks(blocksWithHidden)
          
          const targetIndex = clickIndex % blocksWithHidden.length
          const hiddenBlock = blocksWithHidden[targetIndex]
          
          // Click on the hidden block
          useEditorStore.getState().selectBlock(hiddenBlock.id)
          
          // Verify the hidden block is selected
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(hiddenBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
