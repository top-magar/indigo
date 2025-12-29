/**
 * Property-Based Tests: Clipboard Manager
 * 
 * Feature: editor-improvements, Property 4
 * Validates: Requirements 3.1, 3.2, 3.5, 3.7
 * 
 * Property 4: Clipboard Round-Trip
 * For any valid block, copying it to clipboard and then pasting should produce
 * a block with identical type, variant, and settings, but with a different unique ID.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { serializeBlock, createClipboardManager, type ClipboardBlock } from '../clipboard'
import { useEditorStore } from '../store'
import type { StoreBlock, BlockType, HeroVariant, HeaderVariant } from '@/types/blocks'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

// Mock navigator.clipboard
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
}

// Setup mocks before tests
beforeEach(() => {
  localStorageMock.clear()
  clipboardMock.writeText.mockClear()
  clipboardMock.readText.mockClear()
  
  // Reset store state
  useEditorStore.setState({
    blocks: [],
    selectedBlockId: null,
    clipboardBlock: null,
    isDirty: false,
    history: { past: [], future: [] },
  })
  
  // Mock global objects
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('navigator', { clipboard: clipboardMock })
})

// Arbitrary generators for block types
const blockTypeArb = fc.constantFrom<BlockType>(
  'header', 'hero', 'featured-product', 'product-grid', 
  'promotional-banner', 'testimonials', 'trust-signals', 
  'newsletter', 'footer'
)

const heroVariantArb = fc.constantFrom<HeroVariant>(
  'full-width', 'split', 'video', 'minimal-text', 'product-showcase'
)

const headerVariantArb = fc.constantFrom<HeaderVariant>(
  'classic', 'centered', 'minimal', 'mega-menu', 'announcement'
)

// Generate arbitrary settings (simplified for testing)
const settingsArb = fc.record({
  headline: fc.string({ minLength: 0, maxLength: 100 }),
  subheadline: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
  backgroundColor: fc.option(fc.stringMatching(/^#[0-9a-f]{6}$/)),
  showCta: fc.boolean(),
})

// Generate arbitrary hero block
const heroBlockArb: fc.Arbitrary<StoreBlock> = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }).map(s => `hero-${s}`),
  type: fc.constant('hero' as BlockType),
  variant: heroVariantArb,
  order: fc.nat({ max: 100 }),
  visible: fc.boolean(),
  settings: fc.record({
    headline: fc.string({ minLength: 1, maxLength: 100 }),
    subheadline: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
    primaryCtaText: fc.string({ minLength: 1, maxLength: 50 }),
    primaryCtaLink: fc.string({ minLength: 1, maxLength: 100 }),
    overlayOpacity: fc.integer({ min: 0, max: 100 }),
    textAlignment: fc.constantFrom('left', 'center', 'right'),
    height: fc.constantFrom('full', 'large', 'medium'),
  }),
}).map(block => block as StoreBlock)

// Generate arbitrary header block
const headerBlockArb: fc.Arbitrary<StoreBlock> = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }).map(s => `header-${s}`),
  type: fc.constant('header' as BlockType),
  variant: headerVariantArb,
  order: fc.nat({ max: 100 }),
  visible: fc.boolean(),
  settings: fc.record({
    logoText: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    navLinks: fc.array(
      fc.record({
        label: fc.string({ minLength: 1, maxLength: 30 }),
        href: fc.string({ minLength: 1, maxLength: 100 }),
      }),
      { minLength: 0, maxLength: 5 }
    ),
    showSearch: fc.boolean(),
    showAccount: fc.boolean(),
    sticky: fc.boolean(),
  }),
}).map(block => block as StoreBlock)

// Combined block arbitrary
const storeBlockArb = fc.oneof(heroBlockArb, headerBlockArb)

describe('Clipboard Manager - Property Tests', () => {
  /**
   * Property 4: Clipboard Round-Trip
   * Validates: Requirements 3.1, 3.2, 3.5, 3.7
   */
  describe('Property 4: Clipboard Round-Trip', () => {
    it('serialized block should preserve type, variant, and settings', () => {
      fc.assert(
        fc.property(storeBlockArb, (block) => {
          const serialized = serializeBlock(block)
          
          // Type should be preserved
          expect(serialized.type).toBe(block.type)
          
          // Variant should be preserved
          expect(serialized.variant).toBe(block.variant)
          
          // Settings should be deeply equal
          expect(serialized.settings).toEqual(block.settings)
          
          // Visible should be preserved
          expect(serialized.visible).toBe(block.visible)
          
          // copiedAt should be set
          expect(typeof serialized.copiedAt).toBe('number')
          expect(serialized.copiedAt).toBeGreaterThan(0)
          
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('serialized block should NOT include id or order (runtime fields)', () => {
      fc.assert(
        fc.property(storeBlockArb, (block) => {
          const serialized = serializeBlock(block)
          
          // Should not have id property
          expect('id' in serialized).toBe(false)
          
          // Should not have order property
          expect('order' in serialized).toBe(false)
          
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('copy then paste via store should produce block with same content but different ID', () => {
      fc.assert(
        fc.property(storeBlockArb, (originalBlock) => {
          const store = useEditorStore.getState()
          
          // Add original block to store
          useEditorStore.setState({
            blocks: [originalBlock],
            selectedBlockId: originalBlock.id,
          })
          
          // Copy the block
          store.copyBlock(originalBlock.id)
          
          // Verify clipboard has content
          const clipboardBlock = useEditorStore.getState().clipboardBlock
          expect(clipboardBlock).not.toBeNull()
          expect(clipboardBlock?.type).toBe(originalBlock.type)
          expect(clipboardBlock?.variant).toBe(originalBlock.variant)
          expect(clipboardBlock?.settings).toEqual(originalBlock.settings)
          
          // Paste the block
          store.pasteBlock()
          
          // Get the pasted block
          const blocks = useEditorStore.getState().blocks
          expect(blocks.length).toBe(2)
          
          const pastedBlock = blocks[1]
          
          // Type, variant, settings should be identical
          expect(pastedBlock.type).toBe(originalBlock.type)
          expect(pastedBlock.variant).toBe(originalBlock.variant)
          expect(pastedBlock.settings).toEqual(originalBlock.settings)
          expect(pastedBlock.visible).toBe(originalBlock.visible)
          
          // ID should be different (Requirement 3.7)
          expect(pastedBlock.id).not.toBe(originalBlock.id)
          
          // Order should be updated
          expect(pastedBlock.order).toBe(1)
          
          // Reset for next iteration
          useEditorStore.setState({
            blocks: [],
            selectedBlockId: null,
            clipboardBlock: null,
          })
          
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('pasted block should be selected (Requirement 3.5)', () => {
      fc.assert(
        fc.property(storeBlockArb, (originalBlock) => {
          const store = useEditorStore.getState()
          
          // Setup
          useEditorStore.setState({
            blocks: [originalBlock],
            selectedBlockId: originalBlock.id,
          })
          
          // Copy and paste
          store.copyBlock(originalBlock.id)
          store.pasteBlock()
          
          // Pasted block should be selected
          const state = useEditorStore.getState()
          const pastedBlock = state.blocks[1]
          expect(state.selectedBlockId).toBe(pastedBlock.id)
          
          // Reset
          useEditorStore.setState({
            blocks: [],
            selectedBlockId: null,
            clipboardBlock: null,
          })
          
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('paste with no selection should add block at end (Requirement 3.3)', () => {
      fc.assert(
        fc.property(
          fc.array(storeBlockArb, { minLength: 1, maxLength: 5 }),
          storeBlockArb,
          (existingBlocks, blockToCopy) => {
            // Ensure unique IDs
            const blocksWithUniqueIds = existingBlocks.map((b, i) => ({
              ...b,
              id: `block-${i}-${Date.now()}`,
              order: i,
            }))
            
            const store = useEditorStore.getState()
            
            // Setup with existing blocks and no selection
            useEditorStore.setState({
              blocks: blocksWithUniqueIds as StoreBlock[],
              selectedBlockId: null,
              clipboardBlock: {
                type: blockToCopy.type,
                variant: blockToCopy.variant,
                settings: { ...blockToCopy.settings },
                visible: blockToCopy.visible,
                copiedAt: Date.now(),
              },
            })
            
            // Paste with no selection
            store.pasteBlock()
            
            // Block should be added at end
            const blocks = useEditorStore.getState().blocks
            expect(blocks.length).toBe(blocksWithUniqueIds.length + 1)
            
            const pastedBlock = blocks[blocks.length - 1]
            expect(pastedBlock.order).toBe(blocksWithUniqueIds.length)
            
            // Reset
            useEditorStore.setState({
              blocks: [],
              selectedBlockId: null,
              clipboardBlock: null,
            })
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('paste after selected block should insert at correct position (Requirement 3.2)', () => {
      fc.assert(
        fc.property(
          fc.array(storeBlockArb, { minLength: 2, maxLength: 5 }),
          fc.nat(),
          storeBlockArb,
          (existingBlocks, selectedIndexSeed, blockToCopy) => {
            // Ensure unique IDs
            const blocksWithUniqueIds = existingBlocks.map((b, i) => ({
              ...b,
              id: `block-${i}-${Date.now()}`,
              order: i,
            }))
            
            // Select a block in the middle
            const selectedIndex = selectedIndexSeed % blocksWithUniqueIds.length
            const selectedBlockId = blocksWithUniqueIds[selectedIndex].id
            
            const store = useEditorStore.getState()
            
            // Setup
            useEditorStore.setState({
              blocks: blocksWithUniqueIds as StoreBlock[],
              selectedBlockId,
              clipboardBlock: {
                type: blockToCopy.type,
                variant: blockToCopy.variant,
                settings: { ...blockToCopy.settings },
                visible: blockToCopy.visible,
                copiedAt: Date.now(),
              },
            })
            
            // Paste
            store.pasteBlock()
            
            // Block should be inserted after selected block
            const blocks = useEditorStore.getState().blocks
            expect(blocks.length).toBe(blocksWithUniqueIds.length + 1)
            
            // Find the pasted block (it should be right after the selected block)
            const newSelectedIndex = blocks.findIndex(b => b.id === selectedBlockId)
            const pastedBlock = blocks[newSelectedIndex + 1]
            
            expect(pastedBlock.type).toBe(blockToCopy.type)
            expect(pastedBlock.order).toBe(newSelectedIndex + 1)
            
            // Reset
            useEditorStore.setState({
              blocks: [],
              selectedBlockId: null,
              clipboardBlock: null,
            })
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('multiple pastes should generate unique IDs each time', () => {
      fc.assert(
        fc.property(
          storeBlockArb,
          fc.integer({ min: 2, max: 5 }),
          (originalBlock, pasteCount) => {
            const store = useEditorStore.getState()
            
            // Setup
            useEditorStore.setState({
              blocks: [originalBlock],
              selectedBlockId: null,
              clipboardBlock: {
                type: originalBlock.type,
                variant: originalBlock.variant,
                settings: { ...originalBlock.settings },
                visible: originalBlock.visible,
                copiedAt: Date.now(),
              },
            })
            
            // Paste multiple times
            for (let i = 0; i < pasteCount; i++) {
              store.pasteBlock()
            }
            
            // All IDs should be unique
            const blocks = useEditorStore.getState().blocks
            const ids = blocks.map(b => b.id)
            const uniqueIds = new Set(ids)
            
            expect(uniqueIds.size).toBe(ids.length)
            
            // Reset
            useEditorStore.setState({
              blocks: [],
              selectedBlockId: null,
              clipboardBlock: null,
            })
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
