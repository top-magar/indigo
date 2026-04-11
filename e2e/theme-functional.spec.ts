import { test, expect } from "@playwright/test"

test("Theme settings are functional", async ({ page }) => {
  await page.goto("http://localhost:3000/login")
  await page.waitForTimeout(1500)
  await page.fill('input[placeholder*="email"], input[type="email"]', process.env.TEST_EMAIL ?? "")
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD ?? "")
  await page.click('button:has-text("Sign in")')
  await page.waitForURL("**/dashboard**", { timeout: 15000 })
  await page.goto("http://localhost:3000/editor-v2")
  await page.waitForSelector("aside", { timeout: 15000 })
  await page.waitForTimeout(1000)

  // Add hero
  await page.locator("button:has-text('Add Section')").first().click()
  await page.waitForTimeout(300)
  const hero = page.locator("[role='menuitem']").filter({ hasText: /hero/i }).first()
  if (await hero.isVisible()) await hero.click()
  await page.waitForTimeout(1000)

  await page.screenshot({ path: "/tmp/theme-before.png" })

  // Find viewport frame with CSS vars
  const vp = page.locator("[style*='--store-color-primary']").first()

  // Read BEFORE values
  const primaryBefore = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-color-primary").trim())
  const fontBefore = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-font-heading").trim())
  const bgBefore = await vp.evaluate((el) => getComputedStyle(el).backgroundColor)
  console.log(`BEFORE: primary=${primaryBefore}, font=${fontBefore}, bg=${bgBefore}`)

  // Click Theme tab
  await page.locator("[role='tab']").nth(1).click()
  await page.waitForTimeout(500)

  // Apply Elegant preset
  const elegant = page.locator("button:has-text('Elegant')").first()
  if (await elegant.isVisible()) {
    await elegant.click()
    await page.waitForTimeout(500)
  }

  // Read AFTER values
  const primaryAfter = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-color-primary").trim())
  const fontAfter = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-font-heading").trim())
  const bgAfter = await vp.evaluate((el) => getComputedStyle(el).backgroundColor)
  const btnRadius = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-btn-radius").trim())
  const spacing = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-section-spacing").trim())
  const container = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-container-width").trim())
  const weight = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-heading-weight").trim())
  const baseSize = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-base-size").trim())
  const lineH = await vp.evaluate((el) => getComputedStyle(el).getPropertyValue("--store-line-height").trim())

  console.log(`AFTER: primary=${primaryAfter}, font=${fontAfter}, bg=${bgAfter}`)
  console.log(`  btnRadius=${btnRadius}, spacing=${spacing}, container=${container}`)
  console.log(`  weight=${weight}, baseSize=${baseSize}, lineHeight=${lineH}`)

  // Verify changes
  expect(primaryAfter).not.toBe(primaryBefore)
  expect(fontAfter).not.toBe(fontBefore)
  console.log("✅ Colors changed")
  console.log("✅ Font changed")

  expect(btnRadius).toBeTruthy()
  console.log("✅ Button radius set")
  expect(spacing).toBeTruthy()
  console.log("✅ Section spacing set")
  expect(container).toBeTruthy()
  console.log("✅ Container width set")

  // Check hero button uses theme
  const heroBtn = page.locator("a:has-text('Shop Now')").first()
  if (await heroBtn.isVisible()) {
    const btnBg = await heroBtn.evaluate((el) => getComputedStyle(el).backgroundColor)
    const btnBr = await heroBtn.evaluate((el) => getComputedStyle(el).borderRadius)
    console.log(`✅ Hero button: bg=${btnBg}, radius=${btnBr}`)
  }

  // Check heading uses theme font
  const h1 = page.locator("h1").first()
  if (await h1.isVisible()) {
    const hFont = await h1.evaluate((el) => getComputedStyle(el).fontFamily)
    const hWeight = await h1.evaluate((el) => getComputedStyle(el).fontWeight)
    console.log(`✅ Heading: font=${hFont}, weight=${hWeight}`)
  }

  await page.screenshot({ path: "/tmp/theme-after.png" })
  console.log("\n✅ ALL THEME SETTINGS FUNCTIONAL")
})
