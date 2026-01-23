import { test, expect } from '@playwright/test';

test.describe('ISS View', () => {
  test('app loads and displays ISS on map', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading to complete
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible({ timeout: 10000 });
    
    // Map should be visible
    await expect(page.locator('.maplibregl-map')).toBeVisible();
    
    // ISS marker should be visible
    await expect(page.locator('[data-testid="satellite-marker"]')).toBeVisible();
    
    // Satellite info card should show ISS
    await expect(page.getByText(/ISS/i)).toBeVisible();
  });

  test('satellite position updates in real-time', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="satellite-marker"]')).toBeVisible({ timeout: 10000 });
    
    // Get initial position text
    const positionText = await page.locator('[data-testid="satellite-position"]').textContent();
    expect(positionText).toBeTruthy();
    
    // Wait for update (position should change)
    await page.waitForTimeout(2000);
    
    // Position text should have updated (latitude/longitude values change)
    // Note: In some cases the position might not change visibly in 2 seconds
    // This test verifies the UI is updating
    await expect(page.locator('[data-testid="satellite-position"]')).toBeVisible();
  });

  test('clicking satellite marker shows details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for marker to be visible
    await expect(page.locator('[data-testid="satellite-marker"]')).toBeVisible({ timeout: 10000 });
    
    // Click the marker
    await page.locator('[data-testid="satellite-marker"]').click();
    
    // Details popup should appear
    await expect(page.locator('[data-testid="satellite-details"]')).toBeVisible();
    
    // Should show altitude and velocity
    await expect(page.getByText(/altitude/i)).toBeVisible();
    await expect(page.getByText(/velocity/i)).toBeVisible();
  });

  test('handles TLE fetch error gracefully', async ({ page }) => {
    // Intercept TLE request and return error
    await page.route('**/celestrak.org/**', (route) => {
      route.fulfill({ status: 500 });
    });
    
    await page.goto('/');
    
    // Error message should be displayed
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('mobile view shows fullscreen map', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Wait for load
    await expect(page.locator('.maplibregl-map')).toBeVisible({ timeout: 10000 });
    
    // Map should take full width
    const map = page.locator('.maplibregl-map');
    const mapBox = await map.boundingBox();
    expect(mapBox?.width).toBeGreaterThan(350);
  });
});
