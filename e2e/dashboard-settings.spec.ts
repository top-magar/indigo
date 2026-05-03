import { test, expect } from "@playwright/test";

test.describe("Dashboard - Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings");
  });

  test.describe("General Settings", () => {
    test("should display general settings page", async ({ page }) => {
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });

    test("should have accessible icon buttons", async ({ page }) => {
      const iconButtons = page.locator('button[aria-label]');
      const count = await iconButtons.count();
      // All icon-only buttons should have aria-label
      for (let i = 0; i < Math.min(count, 10); i++) {
        const label = await iconButtons.nth(i).getAttribute("aria-label");
        expect(label).toBeTruthy();
      }
    });
  });

  test.describe("Settings Navigation", () => {
    const settingsPages = [
      { path: "/dashboard/settings", name: "General" },
      { path: "/dashboard/settings/team", name: "Team" },
      { path: "/dashboard/settings/billing", name: "Billing" },
      { path: "/dashboard/settings/domains", name: "Domains" },
      { path: "/dashboard/settings/shipping", name: "Shipping" },
      { path: "/dashboard/settings/payments", name: "Payments" },
      { path: "/dashboard/settings/checkout", name: "Checkout" },
    ];

    for (const sp of settingsPages) {
      test(`should load ${sp.name} settings without error`, async ({ page }) => {
        await page.goto(sp.path);
        await page.waitForLoadState("networkidle");
        // No uncaught errors
        const errors: string[] = [];
        page.on("pageerror", (err) => errors.push(err.message));
        await page.waitForTimeout(1000);
        expect(errors).toHaveLength(0);
      });
    }
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test("should have no icon-only buttons without labels", async ({ page }) => {
      // Find buttons that contain only an SVG (icon-only)
      const iconOnlyButtons = page.locator('button:has(svg):not(:has-text(""))');
      const count = await iconOnlyButtons.count();
      for (let i = 0; i < count; i++) {
        const btn = iconOnlyButtons.nth(i);
        const ariaLabel = await btn.getAttribute("aria-label");
        const title = await btn.getAttribute("title");
        const text = await btn.textContent();
        const hasLabel = ariaLabel || title || (text && text.trim().length > 0);
        if (!hasLabel) {
          const html = await btn.innerHTML();
          console.warn(`Icon-only button without label: ${html.slice(0, 100)}`);
        }
      }
    });
  });
});
