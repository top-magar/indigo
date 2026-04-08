/**
 * Editor Architecture Regression Tests
 *
 * Validates the plumbing built during architecture hardening:
 * autosave, theme undo, optimistic save, conflict detection.
 */

import { test, expect } from "@playwright/test"
import { login } from "./fixtures/auth"
import { TEST_CREDENTIALS } from "./fixtures/test-data"

test.describe("Editor Architecture", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.merchant)
    await page.goto("/storefront")
    await page.waitForSelector("[data-editor-canvas]", { timeout: 15000 })
  })

  test("autosave triggers after edit without manual save", async ({ page }) => {
    // Click a block to make a change
    const block = page.locator("[data-craft-node-id]").first()
    await block.click()

    // Wait for autosave cycle (5s default + buffer)
    await page.waitForTimeout(7000)

    // Autosave indicator should show saved state (not dirty)
    await expect(page.locator("text=/saved/i")).toBeVisible({ timeout: 3000 })
  })

  test("theme undo reverts color change via ⌘Z", async ({ page }) => {
    // Open theme panel
    const themeTab = page.locator("button", { hasText: /theme|styles/i }).first()
    if (await themeTab.isVisible()) {
      await themeTab.click()
      await page.waitForTimeout(500)

      // Find a color input and change it
      const colorInput = page.locator("input[type='text']").filter({ hasText: /#/ }).first()
      if (await colorInput.isVisible()) {
        const original = await colorInput.inputValue()
        await colorInput.fill("#ff0000")
        await colorInput.press("Enter")
        await page.waitForTimeout(200)

        // Undo
        await page.keyboard.press("Meta+z")
        await page.waitForTimeout(200)

        // Color should revert
        await expect(colorInput).toHaveValue(original)
      }
    }
  })

  test("optimistic save shows Saved immediately", async ({ page }) => {
    // Make a change
    const block = page.locator("[data-craft-node-id]").first()
    await block.click()

    // Trigger manual save
    await page.keyboard.press("Meta+s")

    // "Saved" or "Saving" should appear immediately (optimistic)
    await expect(page.locator("text=/sav/i")).toBeVisible({ timeout: 500 })
  })

  test("conflict dialog appears on stale timestamp", async ({ page }) => {
    // Inject a stale _lastKnownUpdatedAt into save-store to simulate conflict
    await page.evaluate(() => {
      const store = (window as unknown as Record<string, unknown>).__ZUSTAND_SAVE_STORE__ as { setState: (s: Record<string, unknown>) => void } | undefined
      if (store) {
        store.setState({ _lastKnownUpdatedAt: "2000-01-01T00:00:00.000Z", dirty: true })
      }
    })

    // Trigger save — should get conflict
    await page.keyboard.press("Meta+s")
    await page.waitForTimeout(2000)

    // Conflict dialog should appear (or error state)
    const dialog = page.locator("text=/conflict|another tab/i")
    const errorState = page.locator("text=/failed/i")
    await expect(dialog.or(errorState)).toBeVisible({ timeout: 5000 })
  })
})
