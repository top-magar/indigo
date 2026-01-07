/**
 * Dashboard Products E2E Tests
 * 
 * Tests product management functionality:
 * - Product listing
 * - Create new product
 * - Edit product
 * - Delete product
 * - Product search and filtering
 */

import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'
import { createTestProduct, TEST_CREDENTIALS } from './fixtures/test-data'

test.describe('Dashboard - Products', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, TEST_CREDENTIALS.merchant)
  })

  test.describe('Product Listing', () => {
    test('should display products page', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Should show page title
      await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()
      
      // Should show add product button
      await expect(page.getByRole('button', { name: /add|create|new/i })).toBeVisible()
    })

    test('should show products table or empty state', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Either show products table or empty state
      const hasTable = await page.locator('table').isVisible()
      const hasEmptyState = await page.locator('text=/no products|get started/i').isVisible()
      
      expect(hasTable || hasEmptyState).toBeTruthy()
    })

    test('should search products', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const searchInput = page.getByPlaceholder(/search/i)
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await searchInput.press('Enter')
        
        // URL should update with search param
        await expect(page).toHaveURL(/search=test/)
      }
    })

    test('should filter by status', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const statusFilter = page.locator('[data-testid="status-filter"]')
      
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        await page.getByRole('option', { name: /active/i }).click()
        
        // URL should update with status param
        await expect(page).toHaveURL(/status=active/)
      }
    })

    test('should paginate products', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const nextPageBtn = page.getByRole('button', { name: /next/i })
      
      if (await nextPageBtn.isEnabled()) {
        await nextPageBtn.click()
        
        // URL should update with page param
        await expect(page).toHaveURL(/page=2/)
      }
    })
  })

  test.describe('Create Product', () => {
    test('should open create product form', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      await page.getByRole('button', { name: /add|create|new/i }).click()
      
      // Should navigate to create page or open modal
      const isOnCreatePage = await page.url().includes('/new')
      const hasModal = await page.locator('[role="dialog"]').isVisible()
      
      expect(isOnCreatePage || hasModal).toBeTruthy()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard/products/new')
      
      // Try to submit empty form
      const submitBtn = page.getByRole('button', { name: /save|create|submit/i })
      await submitBtn.click()
      
      // Should show validation errors
      await expect(page.locator('text=/required|name is required/i')).toBeVisible()
    })

    test('should create new product', async ({ page }) => {
      await page.goto('/dashboard/products/new')
      
      const product = createTestProduct()
      
      // Fill product form
      await page.getByLabel(/name/i).fill(product.name)
      await page.getByLabel(/price/i).fill(product.price)
      
      // Fill slug if visible
      const slugField = page.getByLabel(/slug|url/i)
      if (await slugField.isVisible()) {
        await slugField.fill(product.slug)
      }
      
      // Fill description if visible
      const descField = page.getByLabel(/description/i)
      if (await descField.isVisible()) {
        await descField.fill(product.description)
      }
      
      // Submit form
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      // Should redirect to products list or show success
      await expect(page.locator('text=/created|success/i')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Edit Product', () => {
    test('should open edit product form', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Click first product row
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        await productRow.click()
        
        // Should navigate to edit page
        await expect(page).toHaveURL(/\/products\/[^/]+/)
      }
    })

    test('should update product name', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Click first product
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        await productRow.click()
        
        // Update name
        const nameField = page.getByLabel(/name/i)
        await nameField.clear()
        await nameField.fill('Updated Product Name')
        
        // Save
        await page.getByRole('button', { name: /save|update/i }).click()
        
        // Should show success
        await expect(page.locator('text=/updated|saved|success/i')).toBeVisible()
      }
    })

    test('should update product price', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        await productRow.click()
        
        // Update price
        const priceField = page.getByLabel(/price/i)
        await priceField.clear()
        await priceField.fill('99.99')
        
        // Save
        await page.getByRole('button', { name: /save|update/i }).click()
        
        // Should show success
        await expect(page.locator('text=/updated|saved|success/i')).toBeVisible()
      }
    })

    test('should change product status', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        await productRow.click()
        
        // Find status selector
        const statusSelect = page.locator('[data-testid="status-select"]')
        
        if (await statusSelect.isVisible()) {
          await statusSelect.click()
          await page.getByRole('option', { name: /draft/i }).click()
          
          // Save
          await page.getByRole('button', { name: /save|update/i }).click()
          
          // Should show success
          await expect(page.locator('text=/updated|saved|success/i')).toBeVisible()
        }
      }
    })
  })

  test.describe('Delete Product', () => {
    test('should show delete confirmation', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        // Find delete button (might be in dropdown menu)
        const moreBtn = productRow.getByRole('button', { name: /more|actions/i })
        
        if (await moreBtn.isVisible()) {
          await moreBtn.click()
          await page.getByRole('menuitem', { name: /delete/i }).click()
        } else {
          await productRow.getByRole('button', { name: /delete/i }).click()
        }
        
        // Should show confirmation dialog
        await expect(page.locator('[role="alertdialog"]')).toBeVisible()
      }
    })

    test('should cancel delete', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      const productRow = page.locator('table tbody tr').first()
      
      if (await productRow.isVisible()) {
        const moreBtn = productRow.getByRole('button', { name: /more|actions/i })
        
        if (await moreBtn.isVisible()) {
          await moreBtn.click()
          await page.getByRole('menuitem', { name: /delete/i }).click()
        }
        
        // Cancel deletion
        await page.getByRole('button', { name: /cancel/i }).click()
        
        // Dialog should close
        await expect(page.locator('[role="alertdialog"]')).not.toBeVisible()
      }
    })
  })

  test.describe('Bulk Actions', () => {
    test('should select multiple products', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Select first two products
      const checkboxes = page.locator('table tbody input[type="checkbox"]')
      
      if (await checkboxes.count() >= 2) {
        await checkboxes.nth(0).check()
        await checkboxes.nth(1).check()
        
        // Bulk action bar should appear
        await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()
      }
    })

    test('should select all products', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Click select all checkbox
      const selectAll = page.locator('table thead input[type="checkbox"]')
      
      if (await selectAll.isVisible()) {
        await selectAll.check()
        
        // All row checkboxes should be checked
        const rowCheckboxes = page.locator('table tbody input[type="checkbox"]')
        const count = await rowCheckboxes.count()
        
        for (let i = 0; i < count; i++) {
          await expect(rowCheckboxes.nth(i)).toBeChecked()
        }
      }
    })
  })
})
