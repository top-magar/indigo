/**
 * Property-Based Test: Mode Switching Preserves State
 * 
 * Feature: inline-preview-refactor, Property 7: Mode Switching Preserves State
 * Validates: Requirements 4.4
 * 
 * For any sequence of mode switches between edit and preview, 
 * the blocks array in Editor_Store SHALL remain unchanged.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useEditorStore, selectBlocks, selectEditorMode, selectViewport } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock } from '@/types/blocks'
import type { EditorMode, Viewport } from '../types'

// Arbitrary for EditorMode
const editorModeArb = fc.constantFrom<EditorMode>('edit', 'preview')

// Arbitrary for Viewport
const viewportArb = fc.constantFrom<Viewport>('mobile', 'tablet', 'desktop')

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
  { minLength: 0, maxLength: 10 }
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

// Arbitrary for a sequence of mode switches
const modeSwitchSequenceArb = fc.array(editorModeArb, { minLength: 1, maxLength: 20 })

// Arbitrary for a sequence of viewport changes
const viewportSequenceArb = fc.array(viewportArb, { minLength: 1, maxLength: 20 })

describe('Editor Store - Mode Switching Property Tests', () => {
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
    })
  })

  /**
   * Property 7: Mode Switching Preserves State
   * For any sequence of mode switches between edit and preview,
   * the blocks array in Editor_Store SHALL remain unchanged.
   */
  it('should preserve blocks array through any sequence of mode switches', () => {
    fc.assert(
      fc.property(blocksArb, modeSwitchSequenceArb, (initialBlocks, modeSequence) => {
        // Setup initial state
        useEditorStore.getState().setBlocks(initialBlocks)
        
        // Capture the initial blocks state (deep copy for comparison)
        const blocksBeforeSwitches = JSON.stringify(selectBlocks(useEditorStore.getState()))
        
        // Apply all mode switches
        for (const mode of modeSequence) {
          useEditorStore.getState().setEditorMode(mode)
        }
        
        // Verify blocks are unchanged
        const blocksAfterSwitches = JSON.stringify(selectBlocks(useEditorStore.getState()))
        
        expect(blocksAfterSwitches).toBe(blocksBeforeSwitches)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Mode state is correctly updated
   * For any mode switch, the editorMode state should reflect the new mode.
   */
  it('should correctly update editorMode state on mode switch', () => {
    fc.assert(
      fc.property(editorModeArb, (targetMode) => {
        useEditorStore.getState().setEditorMode(targetMode)
        
        expect(selectEditorMode(useEditorStore.getState())).toBe(targetMode)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Viewport state is correctly updated
   * For any viewport change, the viewport state should reflect the new viewport.
   */
  it('should correctly update viewport state on viewport change', () => {
    fc.assert(
      fc.property(viewportArb, (targetViewport) => {
        useEditorStore.getState().setViewport(targetViewport)
        
        expect(selectViewport(useEditorStore.getState())).toBe(targetViewport)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Combined mode and viewport changes preserve blocks
   * For any sequence of mode and viewport changes, blocks should remain unchanged.
   */
  it('should preserve blocks through combined mode and viewport changes', () => {
    fc.assert(
      fc.property(
        blocksArb,
        modeSwitchSequenceArb,
        viewportSequenceArb,
        (initialBlocks, modeSequence, viewportSequence) => {
          // Setup initial state
          useEditorStore.getState().setBlocks(initialBlocks)
          
          // Capture the initial blocks state
          const blocksBeforeChanges = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          // Interleave mode and viewport changes
          const maxLength = Math.max(modeSequence.length, viewportSequence.length)
          for (let i = 0; i < maxLength; i++) {
            if (i < modeSequence.length) {
              useEditorStore.getState().setEditorMode(modeSequence[i])
            }
            if (i < viewportSequence.length) {
              useEditorStore.getState().setViewport(viewportSequence[i])
            }
          }
          
          // Verify blocks are unchanged
          const blocksAfterChanges = JSON.stringify(selectBlocks(useEditorStore.getState()))
          
          expect(blocksAfterChanges).toBe(blocksBeforeChanges)
        }
      ),
      { numRuns: 100 }
    )
  })
})
