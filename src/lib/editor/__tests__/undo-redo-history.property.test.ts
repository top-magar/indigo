/**
 * Property-Based Test: Undo/Redo History Maintenance
 * 
 * Feature: inline-preview-refactor, Property 8: Undo/Redo History Maintenance
 * Validates: Requirements 6.4
 * 
 * For any block mutation operation (update, move, add, remove, duplicate), 
 * the Editor_Store's history.past SHALL contain the previous state, enabling undo.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectBlocks, selectCanUndo, selectCanRedo } from '../store'
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

// Helper to compare blocks (ignoring order property for some tests)
function blocksEqual(a: StoreBlock[], b: StoreBlock[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

describe('Editor Store - Undo/Redo History Maintenance Property Tests', () => {
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
   * Property 8: Undo/Redo History Maintenance - Update Operation
   * For any block update operation, history.past should contain the previous state.
   */
  it('should add previous state to history.past on block update', () => {
    fc.assert(
      fc.property(
        blocksArb,
        fc.integer({ min: 0, max: 9 }),
        fc.boolean(),
        (initialBlocks, blockIndex, newVisibility) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Capture state before update
          const stateBeforeUpdate = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Perform update
          useEditorStore.getState().updateBlock(targetBlock.id, { visible: newVisibility })
          
          // Verify history contains previous state
          const history = useEditorStore.getState().history
          expect(history.past.length).toBe(1)
          expect(JSON.stringify(history.past[0])).toBe(stateBeforeUpdate)
          expect(selectCanUndo(useEditorStore.getState())).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Move Operation
   * For any block move operation, history.past should contain the previous state.
   */
  it('should add previous state to history.past on block move', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        (initialBlocks) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          // Capture state before move
          const stateBeforeMove = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Perform move (first block to second position)
          useEditorStore.getState().moveBlock(0, 1)
          
          // Verify history contains previous state
          const history = useEditorStore.getState().history
          expect(history.past.length).toBe(1)
          expect(JSON.stringify(history.past[0])).toBe(stateBeforeMove)
          expect(selectCanUndo(useEditorStore.getState())).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Add Operation
   * For any block add operation, history.past should contain the previous state.
   */
  it('should add previous state to history.past on block add', () => {
    fc.assert(
      fc.property(blocksArb, (initialBlocks) => {
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        useEditorStore.setState({ history: { past: [], future: [] } })
        
        // Capture state before add
        const stateBeforeAdd = JSON.stringify(selectBlocks(useEditorStore.getState()))
        
        // Perform add
        const newBlock = createHeroBlock(`new-hero-${Date.now()}`, initialBlocks.length)
        useEditorStore.getState().addBlock(newBlock)
        
        // Verify history contains previous state
        const history = useEditorStore.getState().history
        expect(history.past.length).toBe(1)
        expect(JSON.stringify(history.past[0])).toBe(stateBeforeAdd)
        expect(selectCanUndo(useEditorStore.getState())).toBe(true)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Remove Operation
   * For any block remove operation, history.past should contain the previous state.
   */
  it('should add previous state to history.past on block remove', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, blockIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Capture state before remove
          const stateBeforeRemove = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Perform remove
          useEditorStore.getState().removeBlock(targetBlock.id)
          
          // Verify history contains previous state
          const history = useEditorStore.getState().history
          expect(history.past.length).toBe(1)
          expect(JSON.stringify(history.past[0])).toBe(stateBeforeRemove)
          expect(selectCanUndo(useEditorStore.getState())).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Duplicate Operation
   * For any block duplicate operation, history.past should contain the previous state.
   */
  it('should add previous state to history.past on block duplicate', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, blockIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Capture state before duplicate
          const stateBeforeDuplicate = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Perform duplicate
          useEditorStore.getState().duplicateBlock(targetBlock.id)
          
          // Verify history contains previous state
          const history = useEditorStore.getState().history
          expect(history.past.length).toBe(1)
          expect(JSON.stringify(history.past[0])).toBe(stateBeforeDuplicate)
          expect(selectCanUndo(useEditorStore.getState())).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Undo Restores Previous State
   * Calling undo should restore the previous state from history.past.
   */
  it('should restore previous state when undo is called', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        fc.boolean(),
        (initialBlocks, blockIndex, newVisibility) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Capture original state
          const originalState = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Perform update
          useEditorStore.getState().updateBlock(targetBlock.id, { visible: newVisibility })
          
          // Verify state changed
          const stateAfterUpdate = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Undo
          useEditorStore.getState().undo()
          
          // Verify state is restored
          const stateAfterUndo = JSON.stringify(selectBlocks(useEditorStore.getState()))
          expect(stateAfterUndo).toBe(originalState)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Redo Restores Undone State
   * Calling redo after undo should restore the undone state.
   */
  it('should restore undone state when redo is called', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        fc.boolean(),
        (initialBlocks, blockIndex, newVisibility) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Perform update
          useEditorStore.getState().updateBlock(targetBlock.id, { visible: newVisibility })
          
          // Capture state after update
          const stateAfterUpdate = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Undo
          useEditorStore.getState().undo()
          expect(selectCanRedo(useEditorStore.getState())).toBe(true)
          
          // Redo
          useEditorStore.getState().redo()
          
          // Verify state is restored to after-update state
          const stateAfterRedo = JSON.stringify(selectBlocks(useEditorStore.getState()))
          expect(stateAfterRedo).toBe(stateAfterUpdate)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - Multiple Operations
   * Multiple operations should each add to history, enabling multiple undos.
   */
  it('should support multiple undos for multiple operations', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 2),
        fc.array(fc.boolean(), { minLength: 2, maxLength: 5 }),
        (initialBlocks, visibilitySequence) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetBlock = initialBlocks[0]
          
          // Capture states at each step
          const states: string[] = [JSON.stringify(selectBlocks(useEditorStore.getState()))]
          
          // Perform multiple updates
          for (const visibility of visibilitySequence) {
            useEditorStore.getState().updateBlock(targetBlock.id, { visible: visibility })
            states.push(JSON.stringify(selectBlocks(useEditorStore.getState())))
          }
          
          // Verify history length
          expect(useEditorStore.getState().history.past.length).toBe(visibilitySequence.length)
          
          // Undo all operations and verify each state
          for (let i = visibilitySequence.length - 1; i >= 0; i--) {
            useEditorStore.getState().undo()
            const currentState = JSON.stringify(selectBlocks(useEditorStore.getState()))
            expect(currentState).toBe(states[i])
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Undo/Redo History Maintenance - New Action Clears Future
   * Performing a new action after undo should clear the redo history.
   */
  it('should clear future history when new action is performed after undo', () => {
    fc.assert(
      fc.property(
        blocksArb.filter(blocks => blocks.length >= 1),
        fc.integer({ min: 0, max: 9 }),
        (initialBlocks, blockIndex) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          useEditorStore.setState({ history: { past: [], future: [] } })
          
          const targetIndex = blockIndex % initialBlocks.length
          const targetBlock = initialBlocks[targetIndex]
          
          // Perform first update
          useEditorStore.getState().updateBlock(targetBlock.id, { visible: false })
          
          // Undo
          useEditorStore.getState().undo()
          expect(selectCanRedo(useEditorStore.getState())).toBe(true)
          
          // Perform new action
          useEditorStore.getState().updateBlock(targetBlock.id, { visible: true })
          
          // Verify future is cleared
          expect(selectCanRedo(useEditorStore.getState())).toBe(false)
          expect(useEditorStore.getState().history.future.length).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
