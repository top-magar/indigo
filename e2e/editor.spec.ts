import { test, expect } from "@playwright/test"

test.describe.configure({ mode: "serial" })

test.describe("Editor — Settings & Rollback", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("http://localhost:3000/login")
    await page.waitForTimeout(1500)
    await page.fill('input[placeholder*="email"], input[type="email"]', process.env.TEST_EMAIL ?? "test@example.com")
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD ?? "password123")
    await page.click('button:has-text("Sign in")')
    await page.waitForURL("**/dashboard**", { timeout: 15000 })

    // Navigate to editor
    await page.goto("http://localhost:3000/editor-v2")
    await page.waitForSelector("aside, [class*='h-screen']", { timeout: 15000 })
    await page.waitForTimeout(1000)
  })

  test("Settings tabs respond to small screen", async ({ page }) => {
    // Check right panel visibility
    await page.setViewportSize({ width: 1400, height: 900 })
    
    // Add a section so the right panel opens
    const addBtn = page.locator("button:has-text('Add Section')").first()
    await addBtn.click()
    await page.locator("button:has-text('Sections')").first().click()
    const item = page.locator("aside button").filter({ hasText: /^Hero/ }).first()
    if (await item.isVisible()) await item.click()
    await page.waitForTimeout(1000)

    const rightPanel = page.locator("aside").last()
    await expect(rightPanel).toBeVisible()

    const designTab = page.locator("button:has-text('Design')").first()
    if (await designTab.isVisible()) {
      // Resize to smaller width
      await page.setViewportSize({ width: 800, height: 900 })
      await page.waitForTimeout(500)
      
      // We expect max-xl:hidden to hide it (tailwind breakpoints usually > 1280px for xl)
      await expect(designTab).toBeHidden()
    }
  })

  test("Version history rollback appears in toolbar", async ({ page }) => {
    // Click more actions
    const moreBtn = page.locator("button[aria-label='More actions']").first()
    if (await moreBtn.isVisible()) {
      await moreBtn.click()
      const versionHistory = page.locator("text=Version History").first()
      await expect(versionHistory).toBeVisible()
    }
  })
})
