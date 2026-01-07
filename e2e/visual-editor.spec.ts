/**
 * Visual Editor E2E Tests
 * 
 * Tests the visual store editor functionality:
 * - Editor loading and layout
 * - Block selection and editing
 * - Drag and drop reordering
 * - Global styles
 * - Save and publish
 */

import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'
import { TEST_CREDENTIALS } from './fixtures/test-data'

test.describe('Visual Editor', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.merchant)
  })

  test.describe('Editor Loading', () => {
    test('should load visual editor', async ({ page }) => {
      await page.goto('/storefront')
      
      // Should show editor layout
      await expect(page.locator('[data-testid="visual-editor"]')).toBeVisible({ timeout: 15000 })
    })

    test('should display three-panel layout', async ({ page }) => {
      await page.goto('/storefront')
      
      // Left panel (layers)
      await expect(page.locator('[data-testid="layers-panel"]')).toBeVisible()
      
      // Center (preview)
      await expect(page.locator('[data-testid="inline-preview-viewport"]')).toBeVisible()
      
      // Right panel (settings)
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible()
    })

    test('should show editor header with controls', async ({ page }) => {
      await page.goto('/storefront')
      
      // Header should be visible
      const header = page.locator('[data-testid="editor-header"]')
      await expect(header).toBeVisible()
      
      // Should have save button
      await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
      
      // Should have publish button
      await expect(page.getByRole('button', { name: /publish/i })).toBeVisible()
    })

    test('should show viewport controls', async ({ page }) => {
      await page.goto('/storefront')
      
      // Viewport switcher should be visible
      await expect(page.locator('[data-testid="viewport-switcher"]')).toBeVisible()
    })
  })

  test.describe('Block Selection', () => {
    test('should select block on click', async ({ page }) => {
      await page.goto('/storefront')
      
      // Wait for blocks to load
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Click first block
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Block should be selected (has ring/border)
      await expect(block).toHaveClass(/ring/)
    })

    test('should show settings panel for selected block', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Click a block
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Settings panel should show block settings
      await expect(page.locator('[data-testid="settings-panel"]')).toContainText(/settings/i)
    })

    test('should deselect block on escape', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Select block
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Press escape
      await page.keyboard.press('Escape')
      
      // Block should not be selected
      await expect(block).not.toHaveClass(/ring-primary/)
    })

    test('should multi-select with shift+click', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      const blocks = page.locator('[data-block-type]')
      
      if (await blocks.count() >= 2) {
        // Select first block
        await blocks.nth(0).click()
        
        // Shift+click second block
        await blocks.nth(1).click({ modifiers: ['Shift'] })
        
        // Both should be selected
        await expect(blocks.nth(0)).toHaveClass(/ring/)
        await expect(blocks.nth(1)).toHaveClass(/ring/)
      }
    })
  })

  test.describe('Block Editing', () => {
    test('should edit block settings', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type="hero"]', { timeout: 10000 })
      
      // Select hero block
      const heroBlock = page.locator('[data-block-type="hero"]').first()
      await heroBlock.click()
      
      // Find a text input in settings panel
      const textInput = page.locator('[data-testid="settings-panel"] input[type="text"]').first()
      
      if (await textInput.isVisible()) {
        await textInput.clear()
        await textInput.fill('Updated Heading')
        
        // Change should reflect in preview
        await expect(heroBlock).toContainText('Updated Heading')
      }
    })

    test('should change block variant', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Select a block
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Find variant selector
      const variantSelector = page.locator('[data-testid="variant-picker"]')
      
      if (await variantSelector.isVisible()) {
        // Click a different variant
        const variants = variantSelector.locator('button')
        if (await variants.count() > 1) {
          await variants.nth(1).click()
          
          // Block should update
          await expect(block).toBeVisible()
        }
      }
    })

    test('should toggle block visibility', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Select a block
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Find visibility toggle
      const visibilityBtn = page.getByRole('button', { name: /hide|visibility/i })
      
      if (await visibilityBtn.isVisible()) {
        await visibilityBtn.click()
        
        // Block should be hidden (has opacity or hidden indicator)
        await expect(block).toHaveClass(/opacity-50|hidden/)
      }
    })
  })

  test.describe('Drag and Drop', () => {
    test('should show drag handle on hover', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Hover over block
      const block = page.locator('[data-block-type]').first()
      await block.hover()
      
      // Drag handle should appear
      await expect(page.locator('[data-testid="drag-handle"]')).toBeVisible()
    })

    test('should reorder blocks via drag', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      const blocks = page.locator('[data-block-type]')
      
      if (await blocks.count() >= 2) {
        const firstBlock = blocks.nth(0)
        const secondBlock = blocks.nth(1)
        
        // Get initial order
        const firstBlockType = await firstBlock.getAttribute('data-block-type')
        
        // Drag first block below second
        await firstBlock.hover()
        const dragHandle = page.locator('[data-testid="drag-handle"]').first()
        
        if (await dragHandle.isVisible()) {
          await dragHandle.dragTo(secondBlock)
          
          // Order should change
          const newFirstBlockType = await blocks.nth(0).getAttribute('data-block-type')
          expect(newFirstBlockType).not.toBe(firstBlockType)
        }
      }
    })
  })

  test.describe('Viewport Switching', () => {
    test('should switch to tablet viewport', async ({ page }) => {
      await page.goto('/storefront')
      
      // Click tablet viewport button
      const tabletBtn = page.locator('[data-testid="viewport-tablet"]')
      
      if (await tabletBtn.isVisible()) {
        await tabletBtn.click()
        
        // Preview should resize
        const preview = page.locator('[data-testid="inline-preview-viewport"]')
        await expect(preview).toHaveAttribute('data-viewport', 'tablet')
      }
    })

    test('should switch to mobile viewport', async ({ page }) => {
      await page.goto('/storefront')
      
      const mobileBtn = page.locator('[data-testid="viewport-mobile"]')
      
      if (await mobileBtn.isVisible()) {
        await mobileBtn.click()
        
        const preview = page.locator('[data-testid="inline-preview-viewport"]')
        await expect(preview).toHaveAttribute('data-viewport', 'mobile')
      }
    })

    test('should use keyboard shortcuts for viewport', async ({ page }) => {
      await page.goto('/storefront')
      
      // Press 2 for tablet
      await page.keyboard.press('2')
      
      const preview = page.locator('[data-testid="inline-preview-viewport"]')
      await expect(preview).toHaveAttribute('data-viewport', 'tablet')
      
      // Press 3 for mobile
      await page.keyboard.press('3')
      await expect(preview).toHaveAttribute('data-viewport', 'mobile')
      
      // Press 1 for desktop
      await page.keyboard.press('1')
      await expect(preview).toHaveAttribute('data-viewport', 'desktop')
    })
  })

  test.describe('Save and Publish', () => {
    test('should save draft', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      const textInput = page.locator('[data-testid="settings-panel"] input[type="text"]').first()
      if (await textInput.isVisible()) {
        await textInput.fill('Test change')
      }
      
      // Save
      await page.getByRole('button', { name: /save/i }).click()
      
      // Should show success
      await expect(page.locator('text=/saved|success/i')).toBeVisible()
    })

    test('should publish changes', async ({ page }) => {
      await page.goto('/storefront')
      
      // Click publish
      await page.getByRole('button', { name: /publish/i }).click()
      
      // Should show success or confirmation
      await expect(page.locator('text=/published|live|success/i')).toBeVisible({ timeout: 10000 })
    })

    test('should use keyboard shortcut to save', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      // Press Cmd/Ctrl+S
      await page.keyboard.press('Meta+s')
      
      // Should trigger save
      await expect(page.locator('text=/saving|saved/i')).toBeVisible()
    })
  })

  test.describe('Global Styles', () => {
    test('should open global styles panel', async ({ page }) => {
      await page.goto('/storefront')
      
      // Find and click global styles button
      const stylesBtn = page.getByRole('button', { name: /styles|theme/i })
      
      if (await stylesBtn.isVisible()) {
        await stylesBtn.click()
        
        // Global styles panel should open
        await expect(page.locator('[data-testid="global-styles-panel"]')).toBeVisible()
      }
    })

    test('should change primary color', async ({ page }) => {
      await page.goto('/storefront')
      
      const stylesBtn = page.getByRole('button', { name: /styles|theme/i })
      
      if (await stylesBtn.isVisible()) {
        await stylesBtn.click()
        
        // Find color picker
        const colorInput = page.locator('[data-testid="primary-color-input"]')
        
        if (await colorInput.isVisible()) {
          await colorInput.fill('#ff0000')
          
          // Preview should update with new color
          await expect(page.locator('[data-testid="inline-preview-viewport"]')).toHaveCSS('--primary', /#ff0000/i)
        }
      }
    })

    test('should apply style preset', async ({ page }) => {
      await page.goto('/storefront')
      
      const stylesBtn = page.getByRole('button', { name: /styles|theme/i })
      
      if (await stylesBtn.isVisible()) {
        await stylesBtn.click()
        
        // Find preset selector
        const presetBtn = page.locator('[data-testid="style-preset"]').first()
        
        if (await presetBtn.isVisible()) {
          await presetBtn.click()
          
          // Styles should update
          await expect(page.locator('text=/applied|updated/i')).toBeVisible()
        }
      }
    })
  })

  test.describe('Undo/Redo', () => {
    test('should undo changes', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      const textInput = page.locator('[data-testid="settings-panel"] input[type="text"]').first()
      if (await textInput.isVisible()) {
        const originalValue = await textInput.inputValue()
        await textInput.fill('Changed value')
        
        // Undo with Cmd/Ctrl+Z
        await page.keyboard.press('Meta+z')
        
        // Value should revert
        await expect(textInput).toHaveValue(originalValue)
      }
    })

    test('should redo changes', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-block-type]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-block-type]').first()
      await block.click()
      
      const textInput = page.locator('[data-testid="settings-panel"] input[type="text"]').first()
      if (await textInput.isVisible()) {
        await textInput.fill('Changed value')
        
        // Undo
        await page.keyboard.press('Meta+z')
        
        // Redo with Cmd/Ctrl+Shift+Z
        await page.keyboard.press('Meta+Shift+z')
        
        // Value should be restored
        await expect(textInput).toHaveValue('Changed value')
      }
    })
  })
})
