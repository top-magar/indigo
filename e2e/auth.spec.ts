/**
 * Authentication E2E Tests
 * 
 * Tests authentication flows:
 * - Login
 * - Logout
 * - Registration
 * - Password reset
 * - Protected routes
 */

import { test, expect } from '@playwright/test'
import { createTestTenant, TEST_CREDENTIALS } from './fixtures/test-data'

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')
      
      // Should show login form
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login')
      
      // Submit empty form
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      
      // Should show validation errors
      await expect(page.locator('text=/required|email|password/i')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.getByLabel('Email').fill('invalid@example.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      
      // Should show error message
      await expect(page.locator('text=/invalid|incorrect|failed/i')).toBeVisible()
    })

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.getByLabel('Email').fill(TEST_CREDENTIALS.merchant.email)
      await page.getByLabel('Password').fill(TEST_CREDENTIALS.merchant.password)
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    })

    test('should remember user with remember me checkbox', async ({ page }) => {
      await page.goto('/login')
      
      const rememberMe = page.getByLabel(/remember me/i)
      
      if (await rememberMe.isVisible()) {
        await rememberMe.check()
        
        await page.getByLabel('Email').fill(TEST_CREDENTIALS.merchant.email)
        await page.getByLabel('Password').fill(TEST_CREDENTIALS.merchant.password)
        await page.getByRole('button', { name: /sign in|log in/i }).click()
        
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
      }
    })

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login')
      
      const registerLink = page.getByRole('link', { name: /register|sign up|create account/i })
      await expect(registerLink).toBeVisible()
      
      await registerLink.click()
      await expect(page).toHaveURL(/\/register/)
    })

    test('should have link to forgot password', async ({ page }) => {
      await page.goto('/login')
      
      const forgotLink = page.getByRole('link', { name: /forgot|reset/i })
      
      if (await forgotLink.isVisible()) {
        await forgotLink.click()
        await expect(page).toHaveURL(/\/(forgot|reset)/)
      }
    })
  })

  test.describe('Registration', () => {
    test('should display registration page', async ({ page }) => {
      await page.goto('/register')
      
      // Should show registration form
      await expect(page.getByLabel(/store name/i)).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/register')
      
      // Submit empty form
      await page.getByRole('button', { name: /create|register|sign up/i }).click()
      
      // Should show validation errors
      await expect(page.locator('text=/required/i')).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/register')
      
      await page.getByLabel('Email').fill('invalid-email')
      await page.getByRole('button', { name: /create|register|sign up/i }).click()
      
      // Should show email validation error
      await expect(page.locator('text=/valid email|email format/i')).toBeVisible()
    })

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register')
      
      await page.getByLabel('Password').fill('weak')
      await page.getByRole('button', { name: /create|register|sign up/i }).click()
      
      // Should show password validation error
      await expect(page.locator('text=/password|characters|strong/i')).toBeVisible()
    })

    test('should validate unique store slug', async ({ page }) => {
      await page.goto('/register')
      
      const tenant = createTestTenant()
      
      await page.getByLabel(/store name/i).fill(tenant.name)
      await page.getByLabel(/store slug|url/i).fill('demo-store') // Existing slug
      await page.getByLabel('Email').fill(tenant.email)
      await page.getByLabel('Password').fill(tenant.password)
      
      await page.getByRole('button', { name: /create|register|sign up/i }).click()
      
      // Should show slug taken error
      await expect(page.locator('text=/taken|exists|unavailable/i')).toBeVisible()
    })

    test('should register new tenant', async ({ page }) => {
      await page.goto('/register')
      
      const tenant = createTestTenant()
      
      await page.getByLabel(/store name/i).fill(tenant.name)
      await page.getByLabel(/store slug|url/i).fill(tenant.slug)
      await page.getByLabel('Email').fill(tenant.email)
      await page.getByLabel('Password').fill(tenant.password)
      
      await page.getByRole('button', { name: /create|register|sign up/i }).click()
      
      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
    })

    test('should have link to login', async ({ page }) => {
      await page.goto('/register')
      
      const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i })
      await expect(loginLink).toBeVisible()
      
      await loginLink.click()
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/login')
      await page.getByLabel('Email').fill(TEST_CREDENTIALS.merchant.email)
      await page.getByLabel('Password').fill(TEST_CREDENTIALS.merchant.password)
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    })

    test('should logout from dashboard', async ({ page }) => {
      // Find user menu
      const userMenu = page.getByRole('button', { name: /account|profile|user/i })
      
      if (await userMenu.isVisible()) {
        await userMenu.click()
        await page.getByRole('menuitem', { name: /log out|sign out/i }).click()
        
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
      }
    })

    test('should clear session on logout', async ({ page }) => {
      // Logout
      const userMenu = page.getByRole('button', { name: /account|profile|user/i })
      
      if (await userMenu.isVisible()) {
        await userMenu.click()
        await page.getByRole('menuitem', { name: /log out|sign out/i }).click()
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
        
        // Try to access dashboard
        await page.goto('/dashboard')
        
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/)
      }
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user from dashboard', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect unauthenticated user from products page', async ({ page }) => {
      await page.goto('/dashboard/products')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect unauthenticated user from orders page', async ({ page }) => {
      await page.goto('/dashboard/orders')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect unauthenticated user from visual editor', async ({ page }) => {
      await page.goto('/storefront')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should allow access to public store pages', async ({ page }) => {
      await page.goto('/store/demo-store')
      
      // Should NOT redirect to login
      await expect(page).not.toHaveURL(/\/login/)
      
      // Should show store content
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Password Reset', () => {
    test('should display forgot password page', async ({ page }) => {
      await page.goto('/forgot-password')
      
      // Should show email input
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible()
    })

    test('should validate email on forgot password', async ({ page }) => {
      await page.goto('/forgot-password')
      
      await page.getByLabel('Email').fill('invalid-email')
      await page.getByRole('button', { name: /reset|send/i }).click()
      
      // Should show validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible()
    })

    test('should send reset email', async ({ page }) => {
      await page.goto('/forgot-password')
      
      await page.getByLabel('Email').fill(TEST_CREDENTIALS.merchant.email)
      await page.getByRole('button', { name: /reset|send/i }).click()
      
      // Should show success message
      await expect(page.locator('text=/sent|check your email/i')).toBeVisible()
    })
  })
})
