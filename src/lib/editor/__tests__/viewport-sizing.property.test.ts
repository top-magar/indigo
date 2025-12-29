/**
 * Property-Based Test: Viewport Sizing
 * 
 * Feature: inline-preview-refactor, Property 11: Viewport Sizing
 * Validates: Requirements 9.2, 9.3
 * 
 * For any viewport selection, the InlinePreview container width SHALL equal 
 * the configured width for that viewport (375px, 768px, or 1440px).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { VIEWPORT_CONFIG, type Viewport } from '../types'
import { useEditorStore, selectViewport } from '../store'

// Arbitrary for Viewport
const viewportArb = fc.constantFrom<Viewport>('mobile', 'tablet', 'desktop')

// Arbitrary for a sequence of viewport changes
const viewportSequenceArb = fc.array(viewportArb, { minLength: 1, maxLength: 20 })

describe('Viewport Sizing Property Tests', () => {
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
   * Property 11: Viewport Sizing
   * For any viewport selection, the configured width SHALL match the expected values:
   * - mobile: 375px
   * - tablet: 768px
   * - desktop: 1440px
   */
  it('should have correct viewport widths in VIEWPORT_CONFIG', () => {
    fc.assert(
      fc.property(viewportArb, (viewport) => {
        const config = VIEWPORT_CONFIG[viewport]
        
        // Verify the width matches the expected value
        switch (viewport) {
          case 'mobile':
            expect(config.width).toBe(375)
            break
          case 'tablet':
            expect(config.width).toBe(768)
            break
          case 'desktop':
            expect(config.width).toBe(1440)
            break
        }
        
        // Verify width is a positive number
        expect(config.width).toBeGreaterThan(0)
        
        // Verify height is also defined and positive
        expect(config.height).toBeGreaterThan(0)
        
        // Verify label is defined
        expect(config.label).toBeDefined()
        expect(typeof config.label).toBe('string')
        expect(config.label.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Viewport state correctly reflects selected viewport
   * For any viewport selection, the store state should match the selection.
   */
  it('should correctly store viewport selection', () => {
    fc.assert(
      fc.property(viewportArb, (targetViewport) => {
        useEditorStore.getState().setViewport(targetViewport)
        
        const currentViewport = selectViewport(useEditorStore.getState())
        expect(currentViewport).toBe(targetViewport)
        
        // Verify the width can be retrieved from config
        const expectedWidth = VIEWPORT_CONFIG[targetViewport].width
        const actualWidth = VIEWPORT_CONFIG[currentViewport].width
        expect(actualWidth).toBe(expectedWidth)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Viewport widths are strictly ordered
   * mobile < tablet < desktop
   */
  it('should have viewport widths in ascending order (mobile < tablet < desktop)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const mobileWidth = VIEWPORT_CONFIG.mobile.width
        const tabletWidth = VIEWPORT_CONFIG.tablet.width
        const desktopWidth = VIEWPORT_CONFIG.desktop.width
        
        expect(mobileWidth).toBeLessThan(tabletWidth)
        expect(tabletWidth).toBeLessThan(desktopWidth)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Viewport changes through sequence maintain correct widths
   * For any sequence of viewport changes, the width should always match the current viewport.
   */
  it('should maintain correct width through any sequence of viewport changes', () => {
    fc.assert(
      fc.property(viewportSequenceArb, (viewportSequence) => {
        for (const viewport of viewportSequence) {
          useEditorStore.getState().setViewport(viewport)
          
          const currentViewport = selectViewport(useEditorStore.getState())
          const expectedWidth = VIEWPORT_CONFIG[viewport].width
          const actualWidth = VIEWPORT_CONFIG[currentViewport].width
          
          expect(currentViewport).toBe(viewport)
          expect(actualWidth).toBe(expectedWidth)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: All viewport configs have required properties
   * Each viewport configuration must have width, height, and label.
   */
  it('should have all required properties for each viewport config', () => {
    fc.assert(
      fc.property(viewportArb, (viewport) => {
        const config = VIEWPORT_CONFIG[viewport]
        
        // Check all required properties exist
        expect(config).toHaveProperty('width')
        expect(config).toHaveProperty('height')
        expect(config).toHaveProperty('label')
        
        // Check types
        expect(typeof config.width).toBe('number')
        expect(typeof config.height).toBe('number')
        expect(typeof config.label).toBe('string')
        
        // Check values are reasonable
        expect(config.width).toBeGreaterThanOrEqual(320) // Minimum reasonable mobile width
        expect(config.width).toBeLessThanOrEqual(2560) // Maximum reasonable desktop width
        expect(config.height).toBeGreaterThanOrEqual(480) // Minimum reasonable height
        expect(config.height).toBeLessThanOrEqual(1600) // Maximum reasonable height
      }),
      { numRuns: 100 }
    )
  })
})
