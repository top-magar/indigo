/**
 * Property-Based Test: State-to-Render Synchronization
 * 
 * Feature: inline-preview-refactor, Property 1: State-to-Render Synchronization
 * Validates: Requirements 1.2, 1.3
 * 
 * For any block state change (settings update, reorder, add, remove), 
 * the InlinePreview SHALL reflect the change in the same React render cycle 
 * without requiring postMessage or async operations.
 * 
 * This test verifies that the Editor Store updates are synchronous and
 * immediately available to components that read from the store.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectBlocks, selectSelectedBlockId } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock, StoreBlock } from '@/types/blocks'

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

// Arbitrary for settings updates
const settingsUpdateArb = fc.record({
  headline: fc.string({ minLength: 1, maxLength: 50 }),
  visible: fc.boolean(),
})

describe('Editor Store - State-to-Render Synchronization Property Tests', () => {
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
   * Property 1: State-to-Render Synchronization - Settings Update
   * For any settings update, the store state should be immediately updated
   * synchronously without requiring async operations.
   */
  it('should synchronously update block settings without async operations', () => {
    fc.assert(
      fc.property(blocksArb, settingsUpdateArb, (initialBlocks, settingsUpdate) => {
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Get a block to update
        const blockToUpdate = initialBlocks[0]
        if (!blockToUpdate) return true // Skip if no blocks
        
        // Update block settings
        useEditorStore.getState().updateBlock(blockToUpdate.id, { 
          settings: { ...blockToUpdate.settings, ...settingsUpdate } 
        })
        
        // Immediately read the state (synchronous - no await needed)
        const updatedBlocks = selectBlocks(useEditorStore.getState())
        const updatedBlock = updatedBlocks.find(b => b.id === blockToUpdate.id)
        
        // Verify the update is immediately reflected
        expect(updatedBlock).toBeDefined()
        if (updatedBlock && 'headline' in settingsUpdate) {
          expect((updatedBlock.settings as Record<string, unknown>).headline).toBe(settingsUpdate.headline)
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Block Reorder
   * For any block reorder operation, the new order should be immediately
   * reflected in the store state.
   */
  it('should synchronously update block order on reorder', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        (initialBlocks) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          // Move first block to second position
          useEditorStore.getState().moveBlock(0, 1)
          
          // Immediately read the state (synchronous)
          const reorderedBlocks = selectBlocks(useEditorStore.getState())
          
          // Verify the reorder is immediately reflected
          // The block that was at index 0 should now be at index 1
          expect(reorderedBlocks[1].id).toBe(initialBlocks[0].id)
          expect(reorderedBlocks[0].id).toBe(initialBlocks[1].id)
          
          // Verify order values are updated
          expect(reorderedBlocks[0].order).toBe(0)
          expect(reorderedBlocks[1].order).toBe(1)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Block Add
   * For any block add operation, the new block should be immediately
   * present in the store state.
   */
  it('should synchronously add block to store', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        const initialLength = initialBlocks.length
        
        // Create a new block
        const newBlock = createHeroBlock(`new-hero-${Date.now()}`, initialLength)
        
        // Add the block
        useEditorStore.getState().addBlock(newBlock)
        
        // Immediately read the state (synchronous)
        const updatedBlocks = selectBlocks(useEditorStore.getState())
        
        // Verify the block is immediately present
        expect(updatedBlocks.length).toBe(initialLength + 1)
        expect(updatedBlocks.find(b => b.id === newBlock.id)).toBeDefined()
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Block Remove
   * For any block remove operation, the block should be immediately
   * absent from the store state.
   */
  it('should synchronously remove block from store', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        (initialBlocks) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          const initialLength = initialBlocks.length
          const blockToRemove = initialBlocks[0]
          
          // Remove the block
          useEditorStore.getState().removeBlock(blockToRemove.id)
          
          // Immediately read the state (synchronous)
          const updatedBlocks = selectBlocks(useEditorStore.getState())
          
          // Verify the block is immediately absent
          expect(updatedBlocks.length).toBe(initialLength - 1)
          expect(updatedBlocks.find(b => b.id === blockToRemove.id)).toBeUndefined()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Block Duplicate
   * For any block duplicate operation, the duplicated block should be
   * immediately present in the store state.
   */
  it('should synchronously duplicate block in store', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        (initialBlocks) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          const initialLength = initialBlocks.length
          const blockToDuplicate = initialBlocks[0]
          
          // Duplicate the block
          useEditorStore.getState().duplicateBlock(blockToDuplicate.id)
          
          // Immediately read the state (synchronous)
          const updatedBlocks = selectBlocks(useEditorStore.getState())
          
          // Verify the duplicate is immediately present
          expect(updatedBlocks.length).toBe(initialLength + 1)
          
          // The duplicate should be right after the original
          const originalIndex = updatedBlocks.findIndex(b => b.id === blockToDuplicate.id)
          const duplicateBlock = updatedBlocks[originalIndex + 1]
          
          expect(duplicateBlock).toBeDefined()
          expect(duplicateBlock.type).toBe(blockToDuplicate.type)
          expect(duplicateBlock.id).not.toBe(blockToDuplicate.id) // Different ID
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Selection Update
   * For any selection change, the selectedBlockId should be immediately
   * updated in the store state.
   */
  it('should synchronously update selection state', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, blockIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          // Select a block (use modulo to ensure valid index)
          const targetIndex = blockIndex % initialBlocks.length
          const blockToSelect = initialBlocks[targetIndex]
          
          useEditorStore.getState().selectBlock(blockToSelect.id)
          
          // Immediately read the state (synchronous)
          const selectedId = selectSelectedBlockId(useEditorStore.getState())
          
          // Verify the selection is immediately reflected
          expect(selectedId).toBe(blockToSelect.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1: State-to-Render Synchronization - Multiple Operations
   * For any sequence of operations, each operation should be immediately
   * reflected before the next operation.
   */
  it('should synchronously reflect each operation in sequence', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Add a block
        const newBlock = createHeroBlock(`seq-hero-${Date.now()}`, initialBlocks.length)
        useEditorStore.getState().addBlock(newBlock)
        
        // Verify add is reflected
        let currentBlocks = selectBlocks(useEditorStore.getState())
        expect(currentBlocks.find(b => b.id === newBlock.id)).toBeDefined()
        
        // Update the new block
        useEditorStore.getState().updateBlock(newBlock.id, { visible: false })
        
        // Verify update is reflected
        currentBlocks = selectBlocks(useEditorStore.getState())
        const updatedBlock = currentBlocks.find(b => b.id === newBlock.id)
        expect(updatedBlock?.visible).toBe(false)
        
        // Remove the block
        useEditorStore.getState().removeBlock(newBlock.id)
        
        // Verify remove is reflected
        currentBlocks = selectBlocks(useEditorStore.getState())
        expect(currentBlocks.find(b => b.id === newBlock.id)).toBeUndefined()
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})
