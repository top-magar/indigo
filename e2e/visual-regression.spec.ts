import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.waitForTimeout(1500)
    await page.fill('input[placeholder*="email"], input[type="email"]', process.env.TEST_EMAIL ?? '')
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD ?? '')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
    await page.goto('http://localhost:3000/editor-v2')
    await page.waitForSelector('aside', { timeout: 15000 })
    await page.waitForTimeout(1000)
  })

  test('empty editor', async ({ page }) => {
    await expect(page).toHaveScreenshot('empty-editor.png', { maxDiffPixelRatio: 0.05 })
  })

  test('with hero section', async ({ page }) => {
    await page.locator("button:has-text('Add Section')").first().click()
    await page.waitForTimeout(300)
    await page.locator("button:has-text('Sections')").first().click()
    await page.waitForTimeout(200)
    await page.locator('aside button').filter({ hasText: /^Hero/i }).first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('with-hero.png', { maxDiffPixelRatio: 0.05 })
  })

  test('design panel open', async ({ page }) => {
    await page.locator("button:has-text('Add Section')").first().click()
    await page.waitForTimeout(300)
    await page.locator("button:has-text('Sections')").first().click()
    await page.waitForTimeout(200)
    await page.locator('aside button').filter({ hasText: /^Hero/i }).first().click()
    await page.waitForTimeout(500)
    await page.locator("main .cursor-pointer, main [class*='group']").first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('design-panel.png', { maxDiffPixelRatio: 0.05 })
  })

  test('mobile viewport', async ({ page }) => {
    const btn = page.locator("[value='mobile']").first()
    if (await btn.isVisible()) await btn.click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('mobile-viewport.png', { maxDiffPixelRatio: 0.05 })
  })
})
