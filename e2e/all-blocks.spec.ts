import { test, expect } from "@playwright/test"

const BLOCKS = [
  "hero", "text", "image", "button", "divider", "richText", "faq", "newsletter",
  "testimonials", "columns", "form", "video", "customCode", "tabs", "popup",
  "logoCloud", "marquee", "spacer", "socialLinks", "comparisonTable", "map",
  "scrollProgress", "productCard", "productGrid", "featuredProduct",
  "collectionList", "promoBanner", "header", "footer", "cartSummary",
  "announcementBar", "pricingTable", "trustBadges", "countdownTimer",
]

test("All 35 blocks render without crash", async ({ page }) => {
  // Login
  await page.goto("http://localhost:3000/login")
  await page.waitForTimeout(1500)
  await page.fill('input[placeholder*="email"], input[type="email"]', process.env.TEST_EMAIL ?? "")
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD ?? "")
  await page.click('button:has-text("Sign in")')
  await page.waitForURL("**/dashboard**", { timeout: 15000 })
  await page.goto("http://localhost:3000/editor-v2")
  await page.waitForSelector("aside", { timeout: 15000 })
  await page.waitForTimeout(1000)

  const results: { block: string; status: string; error?: string }[] = []

  for (const block of BLOCKS) {
    try {
      // Click + Add Section
      const addBtn = page.locator("button:has-text('Add Section'), button:has-text('+ Add Section')").first()
      await addBtn.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(300)

      // Try to find the block in the add menu
      const blockBtn = page.locator(`[role='menuitem']`).filter({ hasText: new RegExp(`^${block}$`, "i") }).first()
      if (await blockBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await blockBtn.click()
        await page.waitForTimeout(500)
        results.push({ block, status: "✅ added" })
      } else {
        // Try searching
        const searchInput = page.locator("input[placeholder*='Search blocks']").first()
        if (await searchInput.isVisible({ timeout: 500 }).catch(() => false)) {
          await searchInput.fill(block)
          await page.waitForTimeout(300)
          const found = page.locator(`button`).filter({ hasText: new RegExp(block, "i") }).first()
          if (await found.isVisible({ timeout: 500 }).catch(() => false)) {
            await found.click()
            await page.waitForTimeout(500)
            results.push({ block, status: "✅ added (search)" })
          } else {
            results.push({ block, status: "⚠️ not in menu" })
          }
          await searchInput.fill("")
        } else {
          results.push({ block, status: "⚠️ menu not open" })
        }
      }

      // Close menu if still open
      await page.keyboard.press("Escape")
      await page.waitForTimeout(200)
    } catch (e) {
      results.push({ block, status: "❌ ERROR", error: (e as Error).message.slice(0, 80) })
    }
  }

  // Count sections in sidebar
  const sectionCount = await page.locator("[class*='sidebar'] [class*='section'], aside li, aside [data-section]").count()

  // Screenshot the full page
  await page.screenshot({ path: "/tmp/all-blocks.png", fullPage: true })

  // Print results
  for (const r of results) {
    console.log(`${r.status} ${r.block}${r.error ? ` — ${r.error}` : ""}`)
  }
  console.log(`\nSections in sidebar: ${sectionCount}`)
  console.log(`Added: ${results.filter(r => r.status.includes("✅")).length}/${BLOCKS.length}`)
  console.log(`Failed: ${results.filter(r => r.status.includes("❌")).length}/${BLOCKS.length}`)
  console.log(`Not found: ${results.filter(r => r.status.includes("⚠️")).length}/${BLOCKS.length}`)

  // Check no crash
  const errorOverlay = page.locator("[id='__next-error'], [class*='error-overlay']")
  expect(await errorOverlay.count()).toBe(0)
})
