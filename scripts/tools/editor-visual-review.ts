/**
 * Editor Visual Review Tool
 * 
 * Takes screenshots of the editor in various states so the AI assistant
 * can visually inspect the UI and find issues.
 * 
 * Usage: 
 *   1. Open the editor in your browser, copy your auth cookie
 *   2. Run: EDITOR_COOKIE="your-cookie-value" npx tsx scripts/editor-visual-review.ts
 *   
 *   Or use --storage to load from a Playwright storage state file:
 *   npx tsx scripts/editor-visual-review.ts --storage auth-state.json
 *   
 *   Or use --browser to launch a visible browser for manual login:
 *   npx tsx scripts/editor-visual-review.ts --browser
 * 
 * Prerequisites: Dev server running on localhost:3000
 * Output: screenshots in /tmp/editor-review/
 */

import { chromium, type Page, type BrowserContext } from "playwright"
import { mkdirSync, existsSync } from "fs"

const BASE_URL = process.env.EDITOR_URL || "http://localhost:3000"
const OUTPUT_DIR = "/tmp/editor-review"
const EDITOR_PATH = "/storefront"
const AUTH_STORAGE = process.argv.includes("--storage") 
  ? process.argv[process.argv.indexOf("--storage") + 1] 
  : null
const INTERACTIVE = process.argv.includes("--browser")

async function waitForEditor(page: Page) {
  // Wait for the editor grid layout to appear
  await page.waitForSelector("[class*='grid-cols']", { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000) // let animations settle
}

async function screenshot(page: Page, name: string, description: string) {
  const path = `${OUTPUT_DIR}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`✅ ${name}: ${description}`)
  return path
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log("🚀 Starting visual review...")
  console.log(`   Base URL: ${BASE_URL}`)
  console.log(`   Output: ${OUTPUT_DIR}/`)
  console.log("")

  const browser = await chromium.launch({ headless: !INTERACTIVE })
  
  let context: BrowserContext
  
  if (AUTH_STORAGE && existsSync(AUTH_STORAGE)) {
    console.log(`🔑 Loading auth from: ${AUTH_STORAGE}`)
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: AUTH_STORAGE,
    })
  } else if (process.env.EDITOR_COOKIE) {
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    // Parse cookie string and set cookies
    const cookieStr = process.env.EDITOR_COOKIE
    const cookies = cookieStr.split(";").map(c => {
      const [name, ...rest] = c.trim().split("=")
      return { name, value: rest.join("="), domain: "localhost", path: "/" }
    })
    await context.addCookies(cookies)
    console.log(`🔑 Set ${cookies.length} cookies from EDITOR_COOKIE`)
  } else if (INTERACTIVE) {
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto(BASE_URL)
    console.log("🔑 Browser opened — please log in manually.")
    console.log("   After logging in and reaching the editor, press Enter here...")
    await new Promise<void>(resolve => {
      process.stdin.once("data", () => resolve())
    })
    // Save state for next time
    await context.storageState({ path: "auth-state.json" })
    console.log("   Auth saved to auth-state.json for future runs")
    await page.close()
  } else {
    console.log("⚠️  No auth provided. Options:")
    console.log("   1. EDITOR_COOKIE='...' npx tsx scripts/editor-visual-review.ts")
    console.log("   2. npx tsx scripts/editor-visual-review.ts --storage auth-state.json")
    console.log("   3. npx tsx scripts/editor-visual-review.ts --browser  (manual login)")
    await browser.close()
    return
  }

  const page = await context.newPage()

  try {
    // 1. Navigate to editor
    console.log("📍 Navigating to editor...")
    await page.goto(`${BASE_URL}${EDITOR_PATH}`, { waitUntil: "networkidle", timeout: 30000 })
    await waitForEditor(page)

    // === SCREENSHOT SERIES ===

    // 1. Full editor — default state (desktop viewport)
    await screenshot(page, "01-editor-default", "Full editor, no block selected, desktop viewport")

    // 2. Click first block to select it
    const firstBlock = page.locator("[data-block-id]").first()
    if (await firstBlock.count() > 0) {
      await firstBlock.click()
      await page.waitForTimeout(500)
      await screenshot(page, "02-block-selected", "First block selected — check breadcrumb, settings panel, selection highlight")
    }

    // 3. Check breadcrumb — click a nested block if possible
    const nestedBlock = page.locator("[data-block-id] [data-block-id]").first()
    if (await nestedBlock.count() > 0) {
      await nestedBlock.click()
      await page.waitForTimeout(500)
      await screenshot(page, "03-nested-block-breadcrumb", "Nested block selected — breadcrumb should show hierarchy")
    }

    // 4. Switch to tablet viewport
    const tabletBtn = page.locator("button[aria-label*='Tablet'], button[aria-label*='tablet']").first()
    if (await tabletBtn.count() > 0) {
      await tabletBtn.click()
      await page.waitForTimeout(1000)
      await screenshot(page, "04-tablet-viewport", "Tablet viewport — check responsive preview + settings panel override banner")
    }

    // 5. Switch to mobile viewport
    const mobileBtn = page.locator("button[aria-label*='Mobile'], button[aria-label*='mobile']").first()
    if (await mobileBtn.count() > 0) {
      await mobileBtn.click()
      await page.waitForTimeout(2000)
      // Wait for iframe to load (mobile/tablet use LivePreview iframe)
      const iframe = page.frameLocator('iframe[title="Store Preview"]')
      try { await iframe.locator('body').waitFor({ timeout: 10000 }) } catch {}
      await page.waitForTimeout(2000)
      await screenshot(page, "05-mobile-viewport", "Mobile viewport — check responsive preview + override banner")
    }

    // 6. Back to desktop
    const desktopBtn = page.locator("button[aria-label*='Desktop'], button[aria-label*='desktop']").first()
    if (await desktopBtn.count() > 0) {
      await desktopBtn.click()
      await page.waitForTimeout(1000)
    }

    // 7. Layers panel
    await screenshot(page, "06-layers-panel", "Left panel — layers tree, toolbar buttons, filter")

    // 8. Settings panel close-up (right side)
    const settingsPanel = page.locator("[class*='overflow-y-auto'], [class*='ScrollArea']").last()
    if (await settingsPanel.count() > 0) {
      await screenshot(page, "07-settings-panel", "Right panel — settings fields, variant selector, responsive section")
    }

    // 9. Open command palette
    await page.keyboard.press("Meta+k")
    await page.waitForTimeout(500)
    await screenshot(page, "08-command-palette", "Command palette open")
    await page.keyboard.press("Escape")
    await page.waitForTimeout(300)

    // 10. Keyboard shortcuts dialog
    const shortcutsBtn = page.locator("button[aria-label='Keyboard shortcuts']").first()
    if (await shortcutsBtn.count() > 0) {
      await shortcutsBtn.click()
      await page.waitForTimeout(500)
      await screenshot(page, "09-keyboard-shortcuts", "Keyboard shortcuts dialog")
      await page.keyboard.press("Escape")
      await page.waitForTimeout(300)
    }

    console.log("")
    console.log("✅ Visual review complete!")
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}/`)
    console.log("")
    console.log("Files:")
    const { readdirSync } = await import("fs")
    readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".png")).sort().forEach(f => {
      console.log(`   ${OUTPUT_DIR}/${f}`)
    })

  } catch (error) {
    console.error("❌ Error:", error)
    // Take error screenshot
    await page.screenshot({ path: `${OUTPUT_DIR}/error-state.png` })
    console.log(`   Error screenshot: ${OUTPUT_DIR}/error-state.png`)
  } finally {
    await browser.close()
  }
}

main()
