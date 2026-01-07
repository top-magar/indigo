/**
 * Authentication Fixtures for E2E Tests
 * 
 * Provides helper functions for authentication flows.
 */

import { Page, expect } from '@playwright/test'

export interface AuthCredentials {
  email: string
  password: string
}

/**
 * Login to the dashboard
 */
export async function login(page: Page, credentials: AuthCredentials) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

/**
 * Logout from the dashboard
 */
export async function logout(page: Page) {
  // Click user menu and logout
  await page.getByRole('button', { name: /account|profile|user/i }).click()
  await page.getByRole('menuitem', { name: /log out|sign out/i }).click()
  
  // Wait for redirect to login
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
}

/**
 * Register a new tenant/merchant
 */
export async function register(
  page: Page,
  data: {
    name: string
    slug: string
    email: string
    password: string
  }
) {
  await page.goto('/register')
  
  // Fill registration form
  await page.getByLabel(/store name/i).fill(data.name)
  await page.getByLabel(/store slug|url/i).fill(data.slug)
  await page.getByLabel('Email').fill(data.email)
  await page.getByLabel('Password').fill(data.password)
  
  // Submit
  await page.getByRole('button', { name: /create|register|sign up/i }).click()
  
  // Wait for success - either redirect to dashboard or onboarding
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/, { timeout: 5000 })
    return true
  } catch {
    return false
  }
}
