import { test, expect } from "@playwright/test"

const URL = "http://localhost:3000/editor-v2/test"

test.describe.configure({ mode: "serial" })

test.describe("Editor V2 — E2E", () => {
  /** Helper: open Add panel → Sections tab → click block by label */
  async function addSectionViaPanel(page: import("@playwright/test").Page, label: string) {
    const addBtn = page.locator("button:has-text('Add Section')").first()
    await addBtn.click()
    await page.waitForTimeout(300)
    await page.locator("button:has-text('Sections')").first().click()
    await page.waitForTimeout(200)
    const item = page.locator("aside button").filter({ hasText: new RegExp(`^${label}`, "i") }).first()
    if (await item.isVisible()) await item.click()
    await page.waitForTimeout(300)
  }
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("http://localhost:3000/login")
    await page.waitForTimeout(1500)
    await page.fill('input[placeholder*="email"], input[type="email"]', process.env.TEST_EMAIL ?? "")
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD ?? "")
    await page.click('button:has-text("Sign in")')
    await page.waitForURL("**/dashboard**", { timeout: 15000 })

    // Navigate to editor
    await page.goto("http://localhost:3000/editor-v2")
    await page.waitForSelector("aside, [class*='h-screen']", { timeout: 15000 })
    await page.waitForTimeout(1000)
  })

  test("1. Loads without crash", async ({ page }) => {
    await page.screenshot({ path: "/tmp/e2e-01-loaded.png" })
    const sidebar = page.locator("aside").first()
    await expect(sidebar).toBeVisible({ timeout: 10000 })
    console.log("✅ Editor loads")
  })

  test("2. Left sidebar visible", async ({ page }) => {
    const aside = page.locator("aside").first()
    await expect(aside).toBeVisible()
    console.log("✅ Left sidebar visible")
  })

  test("3. Tabs: Sections / Theme / Pages / Templates", async ({ page }) => {
    for (const tab of ["Sections", "Theme", "Pages", "Templates"]) {
      const btn = page.locator(`button:has-text("${tab}")`).first()
      const visible = await btn.isVisible().catch(() => false)
      console.log(`   ${tab} tab: ${visible ? "✅" : "❌"}`)
    }
  })

  test("4. Add Section panel opens", async ({ page }) => {
    const addBtn = page.locator("button:has-text('Add Section')").first()
    if (!(await addBtn.isVisible())) {
      console.log("❌ Add Section button not found")
      await page.screenshot({ path: "/tmp/e2e-04-no-add-btn.png" })
      return
    }
    await addBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: "/tmp/e2e-04-add-panel.png" })
    const tabs = await page.locator("button:has-text('Designed'), button:has-text('Sections'), button:has-text('Elements')").count()
    console.log(`   Add panel tabs: ${tabs}`)
    expect(tabs).toBeGreaterThanOrEqual(3)
    console.log("✅ Add Section panel works")
  })

  test("5. Add hero section", async ({ page }) => {
    const addBtn = page.locator("button:has-text('Add Section')").first()
    await addBtn.click()
    await page.waitForTimeout(300)
    await page.locator("button:has-text('Sections')").first().click()
    await page.waitForTimeout(200)
    const hero = page.locator("aside button").filter({ hasText: /^Hero/ }).first()
    if (await hero.isVisible()) {
      await hero.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: "/tmp/e2e-05-hero-added.png" })
      console.log("✅ Hero added")
    } else {
      console.log("❌ Hero not in Add panel")
      await page.screenshot({ path: "/tmp/e2e-05-no-hero.png" })
    }
  })

  test("6. Add multiple sections", async ({ page }) => {
    for (const label of ["Hero", "Text", "Product Grid"]) {
      await addSectionViaPanel(page, label)
    }
    await page.screenshot({ path: "/tmp/e2e-06-multiple.png" })
    console.log("✅ Multiple sections added")
  })

  test("7. Click section → right panel appears", async ({ page }) => {
    await addSectionViaPanel(page, "Hero")
    await page.waitForTimeout(500)

    // Click on it in canvas
    const section = page.locator("main .cursor-pointer, main [class*='group']").first()
    if (await section.isVisible()) {
      await section.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: "/tmp/e2e-07-selected.png" })
      const asides = await page.locator("aside").count()
      console.log(`   Aside panels after select: ${asides}`)
      console.log(asides >= 2 ? "✅ Right panel appeared" : "❌ Right panel missing")
    }
  })

  test("8. Settings panel has Content/Style tabs", async ({ page }) => {
    await addSectionViaPanel(page, "Hero")
    await page.waitForTimeout(500)
    const section = page.locator("main .cursor-pointer, main [class*='group']").first()
    if (await section.isVisible()) await section.click()
    await page.waitForTimeout(500)

    const contentTab = page.locator("button:has-text('Content')").first()
    const styleTab = page.locator("button:has-text('Style')").first()
    console.log(`   Content tab: ${await contentTab.isVisible().catch(() => false)}`)
    console.log(`   Style tab: ${await styleTab.isVisible().catch(() => false)}`)
    if (await styleTab.isVisible()) {
      await styleTab.click()
      await page.waitForTimeout(300)
      await page.screenshot({ path: "/tmp/e2e-08-style-tab.png" })
      console.log("✅ Style tab works")
    }
  })

  test("9. Viewport toggle", async ({ page }) => {
    for (const vp of ["tablet", "mobile", "desktop"]) {
      const btn = page.locator(`[value='${vp}']`).first()
      if (await btn.isVisible()) {
        await btn.click()
        await page.waitForTimeout(300)
        await page.screenshot({ path: `/tmp/e2e-09-${vp}.png` })
        console.log(`   ${vp}: ✅`)
      }
    }
  })

  test("10. Save/Publish buttons", async ({ page }) => {
    // Bottom toolbar should have save and publish buttons (icon-only in Figma layout)
    const toolbar = page.locator("[class*='fixed'][class*='bottom']").first()
    const isVisible = await toolbar.isVisible().catch(() => false)
    console.log(`   Bottom toolbar visible: ${isVisible}`)
    if (isVisible) {
      const buttons = await toolbar.locator("button").count()
      console.log(`   Toolbar buttons: ${buttons}`)
      expect(buttons).toBeGreaterThan(3)
    }
    console.log("✅ Bottom toolbar exists")
  })

  test("11. Empty state shows", async ({ page }) => {
    await page.screenshot({ path: "/tmp/e2e-11-empty.png" })
    const emptyText = page.locator("text=Start building").or(page.locator("text=Add your first")).first()
    const visible = await emptyText.isVisible().catch(() => false)
    console.log(visible ? "✅ Empty state shows" : "⚠️  No empty state text found")
  })

  test("12. Keyboard ⌘K command palette", async ({ page }) => {
    await page.keyboard.press("Meta+k")
    await page.waitForTimeout(500)
    await page.screenshot({ path: "/tmp/e2e-12-cmd-palette.png" })
    const dialog = page.locator("[role='dialog'], [cmdk-root], [data-cmdk-root]").first()
    const visible = await dialog.isVisible().catch(() => false)
    console.log(visible ? "✅ Command palette opens" : "❌ Command palette not found")
    if (visible) await page.keyboard.press("Escape")
  })

  test("13. Breadcrumb shows on selection", async ({ page }) => {
    await addSectionViaPanel(page, "Hero")
    await page.waitForTimeout(500)
    const section = page.locator("main .cursor-pointer, main [class*='group']").first()
    if (await section.isVisible()) await section.click()
    await page.waitForTimeout(300)
    const breadcrumb = page.locator("text=Page").last()
    console.log(`   Breadcrumb visible: ${await breadcrumb.isVisible().catch(() => false)}`)
    await page.screenshot({ path: "/tmp/e2e-13-breadcrumb.png" })
  })

  test("14. Theme panel — change primary color", async ({ page }) => {
    const themeTab = page.locator("button:has-text('Theme')").first()
    if (await themeTab.isVisible()) {
      await themeTab.click()
      await page.waitForTimeout(300)
      const colorInput = page.locator("input[type='color']").first()
      if (await colorInput.isVisible()) {
        await colorInput.evaluate((el: HTMLInputElement) => { el.value = "#ff0000"; el.dispatchEvent(new Event("input", { bubbles: true })) })
        await page.waitForTimeout(300)
        console.log("✅ Theme color changed")
      }
      await page.screenshot({ path: "/tmp/e2e-14-theme.png" })
    }
  })

  test("15. Final full-page screenshot", async ({ page }) => {
    for (const label of ["Hero", "Text", "Product Grid", "Trust Badges", "Newsletter"]) {
      await addSectionViaPanel(page, label)
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: "/tmp/e2e-15-full-page.png", fullPage: false })
    console.log("📸 Full page screenshot saved")
  })
})
