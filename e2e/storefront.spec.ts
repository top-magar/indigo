/**
 * Storefront E2E Tests
 * 
 * Tests the public storefront functionality:
 * - Store homepage loads correctly
 * - Product listing and detail pages
 * - Shopping cart operations
 * - Checkout flow
 */

import { test, expect } from '@playwright/test'
import { createTestCustomer, SEEDED_STORES } from './fixtures/test-data'

const STORE_SLUG = SEEDED_STORES.demo

test.describe('Storefront', () => {
  test.describe('Homepage', () => {
    test('should load store homepage', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}`)
      
      // Should have header with store branding
      await expect(page.locator('header')).toBeVisible()
      
      // Should have main content area
      await expect(page.locator('main')).toBeVisible()
      
      // Should have footer
      await expect(page.locator('footer')).toBeVisible()
    })

    test('should display hero section', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}`)
      
      // Hero section should be visible
      const hero = page.locator('[data-block-type="hero"]').first()
      await expect(hero).toBeVisible({ timeout: 10000 })
    })

    test('should navigate to product from homepage', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}`)
      
      // Find and click a product link
      const productLink = page.locator('a[href*="/products/"]').first()
      
      if (await productLink.isVisible()) {
        await productLink.click()
        await expect(page).toHaveURL(/\/products\//)
      }
    })
  })

  test.describe('Product Pages', () => {
    test('should display product listing', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/products`)
      
      // Should show products or empty state
      const hasProducts = await page.locator('[data-testid="product-card"]').count() > 0
      const hasEmptyState = await page.locator('text=/no products/i').isVisible()
      
      expect(hasProducts || hasEmptyState).toBeTruthy()
    })

    test('should filter products by category', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/products`)
      
      // Look for category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]')
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click()
        // Select first category option
        await page.locator('[role="option"]').first().click()
        
        // URL should update with category param
        await expect(page).toHaveURL(/category=/)
      }
    })

    test('should show product details', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/products`)
      
      // Click first product
      const productCard = page.locator('[data-testid="product-card"]').first()
      
      if (await productCard.isVisible()) {
        await productCard.click()
        
        // Product detail page should show
        await expect(page.locator('[data-testid="product-name"]')).toBeVisible()
        await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
        await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible()
      }
    })
  })

  test.describe('Shopping Cart', () => {
    test('should add product to cart', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/products`)
      
      // Navigate to first product
      const productCard = page.locator('[data-testid="product-card"]').first()
      
      if (await productCard.isVisible()) {
        await productCard.click()
        
        // Add to cart
        await page.getByRole('button', { name: /add to cart/i }).click()
        
        // Cart should update - look for cart indicator
        const cartBadge = page.locator('[data-testid="cart-count"]')
        await expect(cartBadge).toHaveText(/[1-9]/)
      }
    })

    test('should view cart contents', async ({ page }) => {
      // First add item to cart
      await page.goto(`/store/${STORE_SLUG}/products`)
      const productCard = page.locator('[data-testid="product-card"]').first()
      
      if (await productCard.isVisible()) {
        await productCard.click()
        await page.getByRole('button', { name: /add to cart/i }).click()
        
        // Navigate to cart
        await page.goto(`/store/${STORE_SLUG}/cart`)
        
        // Should show cart items
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
      }
    })

    test('should update cart quantity', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/cart`)
      
      const cartItem = page.locator('[data-testid="cart-item"]').first()
      
      if (await cartItem.isVisible()) {
        // Find quantity controls
        const increaseBtn = cartItem.getByRole('button', { name: /increase|\+/i })
        
        if (await increaseBtn.isVisible()) {
          await increaseBtn.click()
          
          // Quantity should update
          await expect(cartItem.locator('[data-testid="quantity"]')).toHaveText(/[2-9]/)
        }
      }
    })

    test('should remove item from cart', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/cart`)
      
      const cartItem = page.locator('[data-testid="cart-item"]').first()
      
      if (await cartItem.isVisible()) {
        const removeBtn = cartItem.getByRole('button', { name: /remove|delete/i })
        await removeBtn.click()
        
        // Item should be removed
        await expect(cartItem).not.toBeVisible()
      }
    })
  })

  test.describe('Checkout', () => {
    test.beforeEach(async ({ page }) => {
      // Add item to cart before checkout tests
      await page.goto(`/store/${STORE_SLUG}/products`)
      const productCard = page.locator('[data-testid="product-card"]').first()
      
      if (await productCard.isVisible()) {
        await productCard.click()
        await page.getByRole('button', { name: /add to cart/i }).click()
      }
    })

    test('should navigate to checkout', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/cart`)
      
      const checkoutBtn = page.getByRole('button', { name: /checkout|proceed/i })
      
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click()
        await expect(page).toHaveURL(/\/checkout/)
      }
    })

    test('should display checkout form', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/checkout`)
      
      // Should show customer info fields
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/name/i)).toBeVisible()
      
      // Should show order summary
      await expect(page.locator('[data-testid="order-summary"]')).toBeVisible()
    })

    test('should validate checkout form', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/checkout`)
      
      // Try to submit empty form
      const submitBtn = page.getByRole('button', { name: /place order|pay|submit/i })
      
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        
        // Should show validation errors
        await expect(page.locator('text=/required|invalid/i')).toBeVisible()
      }
    })

    test('should fill checkout form', async ({ page }) => {
      await page.goto(`/store/${STORE_SLUG}/checkout`)
      
      const customer = createTestCustomer()
      
      // Fill customer info
      await page.getByLabel(/email/i).fill(customer.email)
      await page.getByLabel(/name/i).first().fill(customer.name)
      
      // Fill shipping address if visible
      const addressField = page.getByLabel(/address|street/i)
      if (await addressField.isVisible()) {
        await addressField.fill(customer.address.line1)
        await page.getByLabel(/city/i).fill(customer.address.city)
        await page.getByLabel(/postal|zip/i).fill(customer.address.postalCode)
      }
      
      // Form should be valid (no error messages)
      await expect(page.locator('[data-testid="form-error"]')).not.toBeVisible()
    })
  })
})
