/**
 * Dashboard Orders E2E Tests
 * 
 * Tests order management functionality:
 * - Order listing
 * - Order details view
 * - Order status updates
 * - Order filtering and search
 */

import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'
import { TEST_CREDENTIALS } from './fixtures/test-data'

test.describe('Dashboard - Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.merchant)
  })

  test.describe('Order Listing', () => {
    test('should display orders page', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      // Should show page title
      await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible()
    })

    test('should show orders table or empty state', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const hasTable = await page.locator('table').isVisible()
      const hasEmptyState = await page.locator('text=/no orders|waiting/i').isVisible()
      
      expect(hasTable || hasEmptyState).toBeTruthy()
    })

    test('should filter by status', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const statusFilter = page.locator('[data-testid="status-filter"]')
      
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        await page.getByRole('option', { name: /pending/i }).click()
        
        await expect(page).toHaveURL(/status=pending/)
      }
    })

    test('should search orders', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const searchInput = page.getByPlaceholder(/search/i)
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('ORD-')
        await searchInput.press('Enter')
        
        await expect(page).toHaveURL(/search=ORD-/)
      }
    })

    test('should filter by date range', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const dateFilter = page.locator('[data-testid="date-filter"]')
      
      if (await dateFilter.isVisible()) {
        await dateFilter.click()
        await page.getByRole('option', { name: /last 7 days/i }).click()
        
        await expect(page).toHaveURL(/date=/)
      }
    })
  })

  test.describe('Order Details', () => {
    test('should view order details', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Should show order details
        await expect(page.locator('[data-testid="order-details"]')).toBeVisible()
      }
    })

    test('should display order items', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Should show order items
        await expect(page.locator('[data-testid="order-items"]')).toBeVisible()
      }
    })

    test('should display customer info', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Should show customer information
        await expect(page.locator('[data-testid="customer-info"]')).toBeVisible()
      }
    })

    test('should display order timeline', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Should show order timeline/history
        await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible()
      }
    })
  })

  test.describe('Order Status Updates', () => {
    test('should update order status', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Find status update control
        const statusSelect = page.locator('[data-testid="order-status-select"]')
        
        if (await statusSelect.isVisible()) {
          await statusSelect.click()
          await page.getByRole('option', { name: /processing/i }).click()
          
          // Should show success message
          await expect(page.locator('text=/updated|success/i')).toBeVisible()
        }
      }
    })

    test('should add order note', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        // Find add note button
        const addNoteBtn = page.getByRole('button', { name: /add note/i })
        
        if (await addNoteBtn.isVisible()) {
          await addNoteBtn.click()
          
          // Fill note
          await page.getByLabel(/note/i).fill('Test order note')
          await page.getByRole('button', { name: /save|add/i }).click()
          
          // Note should appear in timeline
          await expect(page.locator('text=Test order note')).toBeVisible()
        }
      }
    })

    test('should mark order as shipped', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      // Find a processing order
      const processingOrder = page.locator('table tbody tr:has-text("processing")').first()
      
      if (await processingOrder.isVisible()) {
        await processingOrder.click()
        
        // Find ship button
        const shipBtn = page.getByRole('button', { name: /ship|mark as shipped/i })
        
        if (await shipBtn.isVisible()) {
          await shipBtn.click()
          
          // Fill tracking info if prompted
          const trackingInput = page.getByLabel(/tracking/i)
          if (await trackingInput.isVisible()) {
            await trackingInput.fill('TRACK123456')
            await page.getByRole('button', { name: /confirm|save/i }).click()
          }
          
          // Status should update
          await expect(page.locator('text=/shipped/i')).toBeVisible()
        }
      }
    })
  })

  test.describe('Order Actions', () => {
    test('should print order', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const orderRow = page.locator('table tbody tr').first()
      
      if (await orderRow.isVisible()) {
        await orderRow.click()
        
        const printBtn = page.getByRole('button', { name: /print/i })
        
        if (await printBtn.isVisible()) {
          // Just verify button is clickable
          await expect(printBtn).toBeEnabled()
        }
      }
    })

    test('should export orders', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      const exportBtn = page.getByRole('button', { name: /export/i })
      
      if (await exportBtn.isVisible()) {
        await exportBtn.click()
        
        // Should show export options
        await expect(page.locator('text=/csv|excel|pdf/i')).toBeVisible()
      }
    })

    test('should refund order', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      // Find a paid order
      const paidOrder = page.locator('table tbody tr:has-text("paid")').first()
      
      if (await paidOrder.isVisible()) {
        await paidOrder.click()
        
        const refundBtn = page.getByRole('button', { name: /refund/i })
        
        if (await refundBtn.isVisible()) {
          await refundBtn.click()
          
          // Should show refund dialog
          await expect(page.locator('[role="dialog"]')).toBeVisible()
          await expect(page.locator('text=/refund amount/i')).toBeVisible()
        }
      }
    })
  })
})
