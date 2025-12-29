/**
 * Property-Based Test: Inline Edit State Tracking
 * 
 * Feature: inline-preview-refactor, Property 5: Inline Edit State Tracking
 * Validates: Requirements 3.2, 3.4
 * 
 * For any inline edit session, the Editor_Store SHALL track the blockId, 
 * fieldPath, and originalValue, and pressing Escape SHALL restore the originalValue.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectInlineEdit, selectBlocks, selectSelectedBlockId } from '../store'
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

// Arbitrary for field paths
const fieldPathArb = fc.constantFrom('headline', 'subheadline', 'logoText', 'primaryCtaText')

// Arbitrary for text values
const textValueArb = fc.string({ minLength: 1, maxLength: 100 })

describe('Editor Store - Inline Edit State Tracking Property Tests', () => {
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
   * Property 5: Inline Edit State Tracking - Track blockId, fieldPath, originalValue
   * When starting an inline edit, the store should track all required state.
   */
  it('should track blockId, fieldPath, and originalValue when inline edit starts', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        fieldPathArb,
        textValueArb,
        (initialBlocks, blockIndex, fieldPath, originalValue) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Verify inline edit state is tracked
          const inlineEdit = selectInlineEdit(useEditorStore.getState())
          
          expect(inlineEdit).not.toBeNull()
          expect(inlineEdit?.blockId).toBe(targetBlock.id)
          expect(inlineEdit?.fieldPath).toBe(fieldPath)
          expect(inlineEdit?.originalValue).toBe(originalValue)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Block Selection on Edit Start
   * Starting an inline edit should also select the block being edited.
   */
  it('should select the block when inline edit starts', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        fieldPathArb,
        textValueArb,
        (initialBlocks, blockIndex, fieldPath, originalValue) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.getState().selectBlock(null) // Ensure no selection
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Verify block is selected
          expect(selectSelectedBlockId(useEditorStore.getState())).toBe(targetBlock.id)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Cancel Restores Original Value
   * Pressing Escape (endInlineEdit with save=false) should restore the original value.
   */
  it('should restore original value when inline edit is cancelled (Escape)', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        textValueArb,
        textValueArb,
        (initialBlocks, blockIndex, originalValue, newValue) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          const fieldPath = 'settings.headline' // Use full path for setNestedValue
          
          // Set the original value in the block
          useEditorStore.getState().updateBlock(targetBlock.id, {
            settings: { ...targetBlock.settings, headline: originalValue }
          })
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Make some changes during editing
          useEditorStore.getState().updateInlineEdit(newValue)
          
          // Cancel the edit (simulate Escape key)
          useEditorStore.getState().endInlineEdit(false) // save = false
          
          // Verify the original value is restored
          const blocks = selectBlocks(useEditorStore.getState())
          const updatedBlock = blocks.find(b => b.id === targetBlock.id)
          
          expect((updatedBlock?.settings as Record<string, unknown>)?.headline).toBe(originalValue)
          
          // Verify inline edit state is cleared
          expect(selectInlineEdit(useEditorStore.getState())).toBeNull()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Save Preserves New Value
   * Ending inline edit with save=true should preserve the new value.
   */
  it('should preserve new value when inline edit is saved', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        textValueArb,
        textValueArb,
        (initialBlocks, blockIndex, originalValue, newValue) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          const fieldPath = 'settings.headline' // Use full path for setNestedValue
          
          // Set the original value in the block
          useEditorStore.getState().updateBlock(targetBlock.id, {
            settings: { ...targetBlock.settings, headline: originalValue }
          })
          
          // Clear history to start fresh
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Make changes during editing
          useEditorStore.getState().updateInlineEdit(newValue)
          
          // Save the edit
          useEditorStore.getState().endInlineEdit(true) // save = true
          
          // Verify the new value is preserved
          const blocks = selectBlocks(useEditorStore.getState())
          const updatedBlock = blocks.find(b => b.id === targetBlock.id)
          
          expect((updatedBlock?.settings as Record<string, unknown>)?.headline).toBe(newValue)
          
          // Verify inline edit state is cleared
          expect(selectInlineEdit(useEditorStore.getState())).toBeNull()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Update During Edit
   * Updates during inline edit should be reflected in the block state.
   */
  it('should update block state during inline edit', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        textValueArb,
        fc.array(textValueArb, { minLength: 1, maxLength: 5 }),
        (initialBlocks, blockIndex, originalValue, updateSequence) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          const fieldPath = 'settings.headline' // Use full path for setNestedValue
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Apply a sequence of updates
          for (const value of updateSequence) {
            useEditorStore.getState().updateInlineEdit(value)
            
            // Verify each update is reflected
            const blocks = selectBlocks(useEditorStore.getState())
            const updatedBlock = blocks.find(b => b.id === targetBlock.id)
            expect((updatedBlock?.settings as Record<string, unknown>)?.headline).toBe(value)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Only One Active Edit
   * Starting a new inline edit should replace any existing inline edit state.
   */
  it('should replace existing inline edit when starting a new one', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        textValueArb,
        textValueArb,
        (initialBlocks, originalValue1, originalValue2) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          const block1 = initialBlocks[0]
          const block2 = initialBlocks[1]
          const fieldPath1 = 'headline'
          const fieldPath2 = 'subheadline'
          
          // Start first inline edit
          useEditorStore.getState().startInlineEdit(block1.id, fieldPath1, originalValue1)
          
          // Verify first edit is active
          let inlineEdit = selectInlineEdit(useEditorStore.getState())
          expect(inlineEdit?.blockId).toBe(block1.id)
          expect(inlineEdit?.fieldPath).toBe(fieldPath1)
          
          // Start second inline edit (should replace first)
          useEditorStore.getState().startInlineEdit(block2.id, fieldPath2, originalValue2)
          
          // Verify second edit replaced first
          inlineEdit = selectInlineEdit(useEditorStore.getState())
          expect(inlineEdit?.blockId).toBe(block2.id)
          expect(inlineEdit?.fieldPath).toBe(fieldPath2)
          expect(inlineEdit?.originalValue).toBe(originalValue2)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Inline Edit State Tracking - Dirty State
   * Inline edit updates should mark the store as dirty.
   */
  it('should mark store as dirty during inline edit updates', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        textValueArb,
        textValueArb,
        (initialBlocks, blockIndex, originalValue, newValue) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.getState().markClean() // Start clean
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          const fieldPath = 'settings.headline' // Use full path for setNestedValue
          
          // Start inline edit
          useEditorStore.getState().startInlineEdit(targetBlock.id, fieldPath, originalValue)
          
          // Make a change
          useEditorStore.getState().updateInlineEdit(newValue)
          
          // Verify store is dirty
          expect(useEditorStore.getState().isDirty).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
