/**
 * Add Product Wizard E2E Tests
 *
 * Tests the multi-step product creation flow:
 * Step 1 (Details): title, subtitle, handle, description, media
 * Step 2 (Organize): category, collections, tags, shipping, SEO
 * Step 3 (Pricing): price, compare-at, cost, variants
 */

import { test, expect } from "@playwright/test";
import { login } from "./fixtures/auth";
import { createTestProduct, TEST_CREDENTIALS } from "./fixtures/test-data";

test.describe("Add Product Wizard", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, TEST_CREDENTIALS.merchant);
        await page.goto("/dashboard/products/new");
    });

    test.describe("Page Structure", () => {
        test("should display wizard with step indicator", async ({ page }) => {
            await expect(page.getByRole("heading", { name: "Add product" })).toBeVisible();
            await expect(page.getByText("Details")).toBeVisible();
            await expect(page.getByText("Organize")).toBeVisible();
            await expect(page.getByText("Pricing")).toBeVisible();
        });

        test("should show back link to products", async ({ page }) => {
            await expect(page.getByRole("link", { name: /products/i })).toBeVisible();
        });

        test("should show save draft button", async ({ page }) => {
            await expect(page.getByRole("button", { name: /save draft/i })).toBeVisible();
        });

        test("should show preview sidebar on desktop", async ({ page }) => {
            await expect(page.getByText("PREVIEW")).toBeVisible();
            await expect(page.getByText("CHECKLIST")).toBeVisible();
        });
    });

    test.describe("Step 1: Details", () => {
        test("should show title, subtitle, handle, description fields", async ({ page }) => {
            await expect(page.getByText("Product details")).toBeVisible();
            await expect(page.getByText("Title *")).toBeVisible();
            await expect(page.getByText("Subtitle")).toBeVisible();
            await expect(page.getByText("Description")).toBeVisible();
            await expect(page.getByText("/products/")).toBeVisible();
        });

        test("should show photo upload area", async ({ page }) => {
            await expect(page.getByText("Photos")).toBeVisible();
            await expect(page.getByText("Drop photos here")).toBeVisible();
        });

        test("should auto-generate handle from title", async ({ page }) => {
            await page.getByPlaceholder("What are you selling?").fill("Handwoven Dhaka Topi");
            await expect(page.getByPlaceholder("auto-generated")).toHaveValue("handwoven-dhaka-topi");
        });

        test("should show character counter for description", async ({ page }) => {
            await expect(page.getByText("0/5000")).toBeVisible();
            await page.getByPlaceholder(/tell customers/i).fill("A beautiful product");
            await expect(page.getByText("19/5000")).toBeVisible();
        });

        test("should validate title is required before continuing", async ({ page }) => {
            await page.getByRole("button", { name: /continue/i }).click();
            await expect(page.getByText("Product title is required")).toBeVisible();
        });

        test("should navigate to Step 2 when title is filled", async ({ page }) => {
            await page.getByPlaceholder("What are you selling?").fill("Test Product");
            await page.getByRole("button", { name: /continue/i }).click();
            // Step 2 content should appear
            await expect(page.getByText("Organization")).toBeVisible();
        });
    });

    test.describe("Step 2: Organize", () => {
        test.beforeEach(async ({ page }) => {
            // Fill Step 1 and advance
            await page.getByPlaceholder("What are you selling?").fill("Test Product");
            await page.getByRole("button", { name: /continue/i }).click();
        });

        test("should show category, brand, collections, tags", async ({ page }) => {
            await expect(page.getByText("Category")).toBeVisible();
            await expect(page.getByText("Brand")).toBeVisible();
            await expect(page.getByText("Collections")).toBeVisible();
            await expect(page.getByText("Tags")).toBeVisible();
        });

        test("should show shipping section", async ({ page }) => {
            await expect(page.getByText("Shipping")).toBeVisible();
            await expect(page.getByText("Physical product")).toBeVisible();
        });

        test("should show SEO section", async ({ page }) => {
            await expect(page.getByText("Search engine listing")).toBeVisible();
            await expect(page.getByText("Page title")).toBeVisible();
            await expect(page.getByText("Meta description")).toBeVisible();
        });

        test("should navigate back to Step 1", async ({ page }) => {
            await page.getByRole("button", { name: /back/i }).click();
            await expect(page.getByText("Product details")).toBeVisible();
            // Title should be preserved
            await expect(page.getByPlaceholder("What are you selling?")).toHaveValue("Test Product");
        });

        test("should navigate to Step 3", async ({ page }) => {
            await page.getByRole("button", { name: /continue/i }).click();
            await expect(page.getByText("Price (Rs)")).toBeVisible();
        });
    });

    test.describe("Step 3: Pricing", () => {
        test.beforeEach(async ({ page }) => {
            // Fill Step 1 and advance through Step 2
            await page.getByPlaceholder("What are you selling?").fill("Test Product");
            await page.getByRole("button", { name: /continue/i }).click();
            await page.getByRole("button", { name: /continue/i }).click();
        });

        test("should show price fields", async ({ page }) => {
            await expect(page.getByText("Price (Rs)")).toBeVisible();
            await expect(page.getByText("Compare-at price")).toBeVisible();
            await expect(page.getByText("Cost price")).toBeVisible();
        });

        test("should show publish button on last step", async ({ page }) => {
            await expect(page.getByRole("button", { name: /publish product/i })).toBeVisible();
        });

        test("should show profit margin when price and cost are set", async ({ page }) => {
            await page.getByPlaceholder("e.g. 1500").fill("1500");
            await page.getByPlaceholder("Your cost").fill("800");
            await expect(page.getByText(/Profit:/)).toBeVisible();
            await expect(page.getByText(/Margin:/)).toBeVisible();
        });

        test("should show variant toggle", async ({ page }) => {
            await expect(page.getByLabel(/enable variants/i)).toBeVisible();
        });
    });

    test.describe("Step Navigation", () => {
        test("should allow clicking completed step labels", async ({ page }) => {
            // Fill and advance to Step 2
            await page.getByPlaceholder("What are you selling?").fill("Test Product");
            await page.getByRole("button", { name: /continue/i }).click();

            // Click "Details" step label to go back
            await page.getByRole("button", { name: "Details" }).click();
            await expect(page.getByText("Product details")).toBeVisible();
        });

        test("should not allow skipping ahead", async ({ page }) => {
            // "Pricing" step should be disabled on Step 1
            const pricingBtn = page.getByRole("button", { name: "Pricing" });
            await expect(pricingBtn).toBeDisabled();
        });

        test("should preserve form data across steps", async ({ page }) => {
            const product = createTestProduct();

            // Fill Step 1
            await page.getByPlaceholder("What are you selling?").fill(product.name);
            await page.getByPlaceholder("Comfortable everyday wear").fill("A great subtitle");
            await page.getByRole("button", { name: /continue/i }).click();

            // Go to Step 3
            await page.getByRole("button", { name: /continue/i }).click();

            // Go back to Step 1
            await page.getByRole("button", { name: /back/i }).click();
            await page.getByRole("button", { name: /back/i }).click();

            // Data should be preserved
            await expect(page.getByPlaceholder("What are you selling?")).toHaveValue(product.name);
            await expect(page.getByPlaceholder("Comfortable everyday wear")).toHaveValue("A great subtitle");
        });
    });

    test.describe("Sidebar", () => {
        test("should update preview when title is entered", async ({ page }) => {
            await page.getByPlaceholder("What are you selling?").fill("Handwoven Scarf");
            // Preview should show the product name
            await expect(page.locator("text=Handwoven Scarf").last()).toBeVisible();
        });

        test("should show completion checklist", async ({ page }) => {
            await expect(page.getByText("0%")).toBeVisible();
            await expect(page.getByText("Add title")).toBeVisible();
            await expect(page.getByText("Add photos")).toBeVisible();
            await expect(page.getByText("Set price")).toBeVisible();
        });

        test("checklist should navigate to correct step", async ({ page }) => {
            // Click "Set price" should go to Step 3
            await page.getByPlaceholder("What are you selling?").fill("Test");
            await page.getByRole("button", { name: /set price/i }).click();
            await expect(page.getByText("Price (Rs)")).toBeVisible();
        });
    });

    test.describe("Save Draft", () => {
        test("should save draft via button", async ({ page }) => {
            await page.getByPlaceholder("What are you selling?").fill("Draft Product");
            await page.getByRole("button", { name: /save draft/i }).click();

            // Should show success toast or redirect
            await expect(page.getByText(/draft saved/i).or(page.locator('[data-sonner-toast]'))).toBeVisible({ timeout: 5000 });
        });

        test("should save draft via keyboard shortcut", async ({ page }) => {
            await page.getByPlaceholder("What are you selling?").fill("Keyboard Draft");
            await page.keyboard.press("Meta+s");

            await expect(page.getByText(/draft saved/i).or(page.locator('[data-sonner-toast]'))).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe("Full Flow: Create and Publish", () => {
        test("should create a product through all 3 steps", async ({ page }) => {
            const product = createTestProduct();

            // Step 1: Details
            await page.getByPlaceholder("What are you selling?").fill(product.name);
            await page.getByPlaceholder(/tell customers/i).fill(product.description);
            await page.getByRole("button", { name: /continue/i }).click();

            // Step 2: Organize
            await page.getByRole("button", { name: /continue/i }).click();

            // Step 3: Pricing
            await page.getByPlaceholder("e.g. 1500").fill(product.price);
            await page.getByRole("button", { name: /publish product/i }).click();

            // Should show celebration screen
            await expect(page.getByText(/is now live|product published/i)).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe("Accessibility", () => {
        test("should have proper heading hierarchy", async ({ page }) => {
            const h1 = page.getByRole("heading", { level: 1 });
            await expect(h1).toHaveText("Add product");
        });

        test("should have accessible form labels", async ({ page }) => {
            // Title field should be labeled
            await expect(page.getByText("Title *")).toBeVisible();
            // Continue button should be accessible
            await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled();
        });

        test("should show error alerts with role=alert", async ({ page }) => {
            await page.getByRole("button", { name: /continue/i }).click();
            await expect(page.locator("[role=alert]")).toBeVisible();
        });
    });
});
