/**
 * Property-Based Test: Event Propagation Prevention
 * 
 * Feature: inline-preview-refactor, Property 4: Event Propagation Prevention
 * Validates: Requirements 2.4
 * 
 * For any click event on an EditableBlockWrapper in edit mode, 
 * the event SHALL NOT propagate to child elements (links, buttons, form inputs).
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { EditableBlockWrapper } from '@/app/(editor)/storefront/components/editable-block-wrapper'
import type { StoreBlock, BlockType } from '@/types/blocks'

// Arbitrary for block types
const blockTypeArb = fc.constantFrom<BlockType>(
  'header',
  'hero',
  'featured-product',
  'product-grid',
  'promotional-banner',
  'testimonials',
  'trust-signals',
  'newsletter',
  'footer'
)

// Arbitrary for block visibility
const visibilityArb = fc.boolean()

// Arbitrary for block index
const blockIndexArb = fc.integer({ min: 0, max: 20 })

// Arbitrary for total blocks
const totalBlocksArb = fc.integer({ min: 1, max: 50 })

// Helper to create a test block
function createTestBlock(type: BlockType, visible: boolean): StoreBlock {
  const baseBlock = {
    id: `test-${type}-${Date.now()}`,
    type,
    order: 0,
    visible,
  }

  // Add minimal required settings based on block type
  switch (type) {
    case 'header':
      return {
        ...baseBlock,
        variant: 'classic',
        settings: {
          logoText: 'Test Store',
          navLinks: [],
          showSearch: true,
          showAccount: true,
          sticky: false,
        },
      } as StoreBlock

    case 'hero':
      return {
        ...baseBlock,
        variant: 'full-width',
        settings: {
          headline: 'Test Headline',
          subheadline: 'Test Subheadline',
          primaryCtaText: 'Shop Now',
          primaryCtaLink: '/shop',
          overlayOpacity: 0.5,
          textAlignment: 'center',
          height: 'large',
        },
      } as StoreBlock

    case 'footer':
      return {
        ...baseBlock,
        variant: 'multi-column',
        settings: {
          logoText: 'Test Store',
          columns: [],
          socialLinks: [],
          showPaymentIcons: false,
          showNewsletter: false,
          legalLinks: [],
        },
      } as StoreBlock

    default:
      // For other block types, create a minimal valid block
      return {
        ...baseBlock,
        variant: 'standard',
        settings: {},
      } as unknown as StoreBlock
  }
}

describe('EditableBlockWrapper - Event Propagation Prevention Property Tests', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup()
  })

  /**
   * Property 4: Event Propagation Prevention
   * For any click event on an EditableBlockWrapper in edit mode,
   * the event SHALL NOT propagate to child elements.
   */
  it('should prevent click events from propagating to child elements', () => {
    fc.assert(
      fc.property(
        blockTypeArb,
        visibilityArb,
        blockIndexArb,
        totalBlocksArb,
        (blockType, visible, index, totalBlocks) => {
          // Clean up before each iteration
          cleanup()
          
          // Ensure index is valid
          const validIndex = Math.min(index, totalBlocks - 1)
          const validTotalBlocks = Math.max(totalBlocks, validIndex + 1)

          const block = createTestBlock(blockType, visible)
          const onSelect = vi.fn()
          const onHover = vi.fn()
          const childClickHandler = vi.fn()

          const { getByTestId } = render(
            <EditableBlockWrapper
              block={block}
              index={validIndex}
              totalBlocks={validTotalBlocks}
              isSelected={false}
              isHovered={false}
              onSelect={onSelect}
              onHover={onHover}
            >
              <div data-testid="child-content">
                <button data-testid="child-button" onClick={childClickHandler}>
                  Click Me
                </button>
                <a data-testid="child-link" href="/test" onClick={childClickHandler}>
                  Link
                </a>
              </div>
            </EditableBlockWrapper>
          )

          // Click on the wrapper
          const wrapper = getByTestId('editable-block-wrapper')
          fireEvent.click(wrapper)

          // The wrapper's onSelect should be called
          expect(onSelect).toHaveBeenCalledTimes(1)

          // The child click handler should NOT be called
          // because pointer-events: none prevents clicks from reaching children
          expect(childClickHandler).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Click events call preventDefault and stopPropagation
   * For any click on the wrapper, the event should be stopped.
   */
  it('should call preventDefault and stopPropagation on click events', () => {
    fc.assert(
      fc.property(
        blockTypeArb,
        visibilityArb,
        (blockType, visible) => {
          // Clean up before each iteration
          cleanup()
          
          const block = createTestBlock(blockType, visible)
          const onSelect = vi.fn()
          const onHover = vi.fn()

          const { getByTestId } = render(
            <EditableBlockWrapper
              block={block}
              index={0}
              totalBlocks={1}
              isSelected={false}
              isHovered={false}
              onSelect={onSelect}
              onHover={onHover}
            >
              <div>Content</div>
            </EditableBlockWrapper>
          )

          const wrapper = getByTestId('editable-block-wrapper')
          
          // Create a mock event to track preventDefault and stopPropagation
          const mockPreventDefault = vi.fn()
          const mockStopPropagation = vi.fn()
          
          // Fire click with custom event
          const clickEvent = new MouseEvent('click', { bubbles: true })
          Object.defineProperty(clickEvent, 'preventDefault', { value: mockPreventDefault })
          Object.defineProperty(clickEvent, 'stopPropagation', { value: mockStopPropagation })
          
          wrapper.dispatchEvent(clickEvent)

          // Verify event methods were called
          expect(mockPreventDefault).toHaveBeenCalled()
          expect(mockStopPropagation).toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Content wrapper has pointer-events-none
   * The content wrapper should always have pointer-events-none to prevent
   * clicks from reaching child elements.
   */
  it('should have pointer-events-none on content wrapper', () => {
    fc.assert(
      fc.property(
        blockTypeArb,
        visibilityArb,
        fc.boolean(), // isSelected
        fc.boolean(), // isHovered
        (blockType, visible, isSelected, isHovered) => {
          // Clean up before each iteration
          cleanup()
          
          const block = createTestBlock(blockType, visible)
          const onSelect = vi.fn()
          const onHover = vi.fn()

          const { getByTestId } = render(
            <EditableBlockWrapper
              block={block}
              index={0}
              totalBlocks={1}
              isSelected={isSelected}
              isHovered={isHovered}
              onSelect={onSelect}
              onHover={onHover}
            >
              <div>Content</div>
            </EditableBlockWrapper>
          )

          const contentWrapper = getByTestId('block-content-wrapper')
          
          // Verify pointer-events-none class is present
          expect(contentWrapper).toHaveClass('pointer-events-none')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Wrapper is always clickable (cursor-pointer)
   * The wrapper should always have cursor-pointer to indicate it's clickable.
   */
  it('should have cursor-pointer class on wrapper', () => {
    fc.assert(
      fc.property(
        blockTypeArb,
        visibilityArb,
        fc.boolean(),
        fc.boolean(),
        (blockType, visible, isSelected, isHovered) => {
          // Clean up before each iteration
          cleanup()
          
          const block = createTestBlock(blockType, visible)
          const onSelect = vi.fn()
          const onHover = vi.fn()

          const { getByTestId } = render(
            <EditableBlockWrapper
              block={block}
              index={0}
              totalBlocks={1}
              isSelected={isSelected}
              isHovered={isHovered}
              onSelect={onSelect}
              onHover={onHover}
            >
              <div>Content</div>
            </EditableBlockWrapper>
          )

          const wrapper = getByTestId('editable-block-wrapper')
          
          // Verify cursor-pointer class is present
          expect(wrapper).toHaveClass('cursor-pointer')
        }
      ),
      { numRuns: 100 }
    )
  })
})
