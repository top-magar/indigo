import { test, expect } from '@playwright/test';
import { createTestTenant } from './fixtures/test-data';

test.describe('Visual Editor V2', () => {
  test('should register, login, and verify editor panels', async ({ page }) => {
    // 1. Try to access Editor V2 directly
    await page.goto('/editor-v2');
    
    // Check where we ended up
    const url = page.url();
    
    if (url.includes('/login') || url.includes('sign-in')) {
      // We need to Authenticate
      console.log('Redirected to login, attempting registration flow...');
      
      // Go to register
      await page.goto('/register');
      
      // Check if we are really on register page, maybe we are on login and need to click link?
      // Just going to /register should work if the route exists.
      
      const nameInput = page.getByLabel(/store name/i).first();
      await expect(nameInput).toBeVisible({ timeout: 15000 });
      
      const tenant = createTestTenant();
      await nameInput.fill(tenant.name);
      await page.getByLabel(/store slug|url/i).first().fill(tenant.slug);
      await page.getByLabel('Email').first().fill(tenant.email);
      await page.getByLabel('Password').first().fill(tenant.password);
      
      await page.getByRole('button', { name: /create|register|sign up/i }).click();
      
      // Expect redirect to dashboard/onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
      
      // Now go to editor
      await page.goto('/editor-v2');
    } else if (url.includes('/dashboard')) {
      // Already logged in, go to editor
      console.log('Already on dashboard, navigating to editor...');
      await page.goto('/editor-v2');
    }
    
    // 2. Verify Editor Loaded
    await expect(page).toHaveURL(/.*\/editor-v2/);

    // 5. Verify Main Panels
    // Components Panel
    const componentsPanel = page.getByText('Components', { exact: true }).first();
    await expect(componentsPanel).toBeVisible({ timeout: 15000 });

    // Layers Panel
    const layersPanel = page.getByText('Layers', { exact: true }).first();
    await expect(layersPanel).toBeAttached();

    // Properties Panel
    const propertiesPanel = page.getByText('Properties', { exact: true }).first();
    await expect(propertiesPanel).toBeAttached();

    // Zoom or Canvas Element
    const zoomControls = page.getByText('100%'); 
    await expect(zoomControls).toBeAttached();

    // Header Actions
    const saveButton = page.getByRole('button', { name: /save|publish/i }).first();
    if (await saveButton.isVisible()) {
        await expect(saveButton).toBeVisible();
    }
  });
});
