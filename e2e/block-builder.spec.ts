/**
 * Block Builder E2E Tests
 * 
 * Tests the block builder (Tier 1 editor) functionality:
 * - Editor loading and 2-panel layout
 * - Block selection and editing
 * - Drag and drop reordering
 * - Save and publish
 */

import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'
import { TEST_CREDENTIALS } from './fixtures/test-data'

test.describe('Block Builder', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.merchant)
  })

  test.describe('Editor Loading', () => {
    test('should load block builder', async ({ page }) => {
      await page.goto('/storefront')
      
      // Should show block builder layout
      await expect(page.locator('[data-testid="block-builder"]')).toBeVisible({ timeout: 15000 })
    })

    test('should display two-panel layout', async ({ page }) => {
      await page.goto('/storefront')
      
      // Wait for block builder to load
      await expect(page.locator('[data-testid="block-builder"]')).toBeVisible({ timeout: 15000 })
      
      // Left panel (block list)
      await expect(page.locator('[data-testid="block-list"]')).toBeVisible()
      
      // Center (preview)
      await expect(page.locator('[data-testid="preview-frame"]')).toBeVisible()
    })

    test('should show builder header with controls', async ({ page }) => {
      await page.goto('/storefront')
      
      // Header should be visible
      const header = page.locator('[data-testid="builder-header"]')
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
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Click first block in list
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Block should be selected (has visual indicator)
      await expect(block).toHaveAttribute('data-selected', 'true')
    })

    test('should show settings panel for selected block', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Click a block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Settings panel should appear
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible()
    })

    test('should deselect block on escape', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Select block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Press escape
      await page.keyboard.press('Escape')
      
      // Settings panel should close
      await expect(page.locator('[data-testid="settings-panel"]')).not.toBeVisible()
    })
  })

  test.describe('Block Editing', () => {
    test('should edit block settings', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Select a block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Find a text input in settings panel
      const textInput = page.locator('[data-testid="settings-panel"] input[type="text"]').first()
      
      if (await textInput.isVisible()) {
        await textInput.clear()
        await textInput.fill('Updated Content')
        
        // Should mark as dirty (unsaved changes)
        await expect(page.locator('[data-testid="unsaved-indicator"]')).toBeVisible()
      }
    })

    test('should toggle block visibility', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Select a block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Find visibility toggle
      const visibilityBtn = page.locator('[data-testid="toggle-visibility"]')
      
      if (await visibilityBtn.isVisible()) {
        await visibilityBtn.click()
        
        // Block should show hidden indicator
        await expect(block.locator('[data-testid="hidden-indicator"]')).toBeVisible()
      }
    })
  })

  test.describe('Block Management', () => {
    test('should open block picker', async ({ page }) => {
      await page.goto('/storefront')
      
      // Click add block button
      const addBtn = page.getByRole('button', { name: /add block/i })
      await addBtn.click()
      
      // Block picker should open
      await expect(page.locator('[data-testid="block-picker"]')).toBeVisible()
    })

    test('should add new block', async ({ page }) => {
      await page.goto('/storefront')
      
      // Get initial block count
      const initialCount = await page.locator('[data-testid="block-list-item"]').count()
      
      // Open block picker
      const addBtn = page.getByRole('button', { name: /add block/i })
      await addBtn.click()
      
      // Select a block type
      const blockType = page.locator('[data-testid="block-picker"] [data-block-type]').first()
      if (await blockType.isVisible()) {
        await blockType.click()
        
        // Block count should increase
        await expect(page.locator('[data-testid="block-list-item"]')).toHaveCount(initialCount + 1)
      }
    })

    test('should delete block', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Get initial block count
      const initialCount = await page.locator('[data-testid="block-list-item"]').count()
      
      if (initialCount > 1) {
        // Select a block
        const block = page.locator('[data-testid="block-list-item"]').first()
        await block.click()
        
        // Click delete button
        const deleteBtn = page.locator('[data-testid="delete-block"]')
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click()
          
          // Block count should decrease
          await expect(page.locator('[data-testid="block-list-item"]')).toHaveCount(initialCount - 1)
        }
      }
    })

    test('should duplicate block', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Get initial block count
      const initialCount = await page.locator('[data-testid="block-list-item"]').count()
      
      // Select a block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Click duplicate button
      const duplicateBtn = page.locator('[data-testid="duplicate-block"]')
      if (await duplicateBtn.isVisible()) {
        await duplicateBtn.click()
        
        // Block count should increase
        await expect(page.locator('[data-testid="block-list-item"]')).toHaveCount(initialCount + 1)
      }
    })
  })

  test.describe('Drag and Drop', () => {
    test('should show drag handle on hover', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Hover over block
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.hover()
      
      // Drag handle should appear
      await expect(block.locator('[data-testid="drag-handle"]')).toBeVisible()
    })

    test('should reorder blocks via drag', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      const blocks = page.locator('[data-testid="block-list-item"]')
      
      if (await blocks.count() >= 2) {
        const firstBlock = blocks.nth(0)
        const secondBlock = blocks.nth(1)
        
        // Get initial order
        const firstBlockId = await firstBlock.getAttribute('data-block-id')
        
        // Drag first block below second
        await firstBlock.hover()
        const dragHandle = firstBlock.locator('[data-testid="drag-handle"]')
        
        if (await dragHandle.isVisible()) {
          await dragHandle.dragTo(secondBlock)
          
          // Order should change - first block should now be second
          const newSecondBlockId = await blocks.nth(1).getAttribute('data-block-id')
          expect(newSecondBlockId).toBe(firstBlockId)
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
        const preview = page.locator('[data-testid="preview-frame"]')
        await expect(preview).toHaveAttribute('data-viewport', 'tablet')
      }
    })

    test('should switch to mobile viewport', async ({ page }) => {
      await page.goto('/storefront')
      
      const mobileBtn = page.locator('[data-testid="viewport-mobile"]')
      
      if (await mobileBtn.isVisible()) {
        await mobileBtn.click()
        
        const preview = page.locator('[data-testid="preview-frame"]')
        await expect(preview).toHaveAttribute('data-viewport', 'mobile')
      }
    })
  })

  test.describe('Save and Publish', () => {
    test('should save draft', async ({ page }) => {
      await page.goto('/storefront')
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-testid="block-list-item"]').first()
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
      
      await page.waitForSelector('[data-testid="block-list-item"]', { timeout: 10000 })
      
      // Make a change
      const block = page.locator('[data-testid="block-list-item"]').first()
      await block.click()
      
      // Press Cmd/Ctrl+S
      await page.keyboard.press('Meta+s')
      
      // Should trigger save
      await expect(page.locator('text=/saving|saved/i')).toBeVisible()
    })
  })
})
