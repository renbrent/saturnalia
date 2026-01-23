import { test, expect } from '@playwright/test';

test.describe('Pass Predictions Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    
    // Set a test location (San Francisco)
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
    
    await page.goto('/');
  });

  test('T064: view pass predictions with location', async ({ page }) => {
    // Wait for ISS to load
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Click "Predict Passes" or "Passes" button
    const passesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await expect(passesButton).toBeVisible();
    await passesButton.click();

    // Wait for pass predictions modal/panel to appear
    await expect(page.getByRole('heading', { name: /upcoming passes|pass predictions/i })).toBeVisible({ timeout: 5000 });

    // Verify location is shown
    await expect(page.getByText(/latitude|lat/i)).toBeVisible();
    await expect(page.getByText(/37\.77/)).toBeVisible(); // San Francisco latitude

    // Verify pass list is displayed
    const passList = page.getByRole('list', { name: /passes/i });
    await expect(passList).toBeVisible();

    // Check that at least one pass is shown (or "no passes" message)
    const passItems = passList.locator('[role="listitem"]');
    const passCount = await passItems.count();
    
    if (passCount > 0) {
      // Verify pass details are shown
      const firstPass = passItems.first();
      await expect(firstPass).toContainText(/rise|start/i);
      await expect(firstPass).toContainText(/set|end/i);
      await expect(firstPass).toContainText(/max elevation|elevation/i);
    } else {
      // No passes in the prediction window
      await expect(page.getByText(/no passes|no visible passes/i)).toBeVisible();
    }
  });

  test('should handle location permission denied', async ({ page, context }) => {
    // Revoke geolocation permission for this test
    await context.clearPermissions();
    
    await page.goto('/');
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Click passes button
    const passesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await passesButton.click();

    // Should show manual location entry option
    await expect(page.getByText(/enter location|manual location|permission denied/i)).toBeVisible({ timeout: 5000 });

    // Should have input for location
    const locationInput = page.getByPlaceholder(/city|location|address/i);
    await expect(locationInput).toBeVisible();

    // Enter a location
    await locationInput.fill('New York');
    
    // Submit or search for location
    const searchButton = page.getByRole('button', { name: /search|find location|use location/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await locationInput.press('Enter');
    }

    // Should show passes for entered location
    await expect(page.getByText(/new york|40\./i)).toBeVisible({ timeout: 5000 });
  });

  test('should display pass details correctly', async ({ page }) => {
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    const passesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await passesButton.click();

    await expect(page.getByRole('heading', { name: /upcoming passes|pass predictions/i })).toBeVisible({ timeout: 5000 });

    const passList = page.getByRole('list', { name: /passes/i });
    const passItems = passList.locator('[role="listitem"]');
    
    // If there are passes, check their structure
    if (await passItems.count() > 0) {
      const firstPass = passItems.first();
      
      // Should show time information
      await expect(firstPass).toContainText(/am|pm|:\d{2}/i); // Time format
      
      // Should show direction (compass heading or cardinal direction)
      await expect(firstPass).toContainText(/north|south|east|west|ne|nw|se|sw|°/i);
      
      // Should show elevation
      await expect(firstPass).toContainText(/°|degrees/i);
      
      // Should show duration or start/end times
      await expect(firstPass).toContainText(/rise|start|begin/i);
      await expect(firstPass).toContainText(/set|end/i);
    }
  });

  test('should highlight passes within 24 hours', async ({ page }) => {
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    const passesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await passesButton.click();

    await expect(page.getByRole('heading', { name: /upcoming passes|pass predictions/i })).toBeVisible({ timeout: 5000 });

    // Look for highlighted/emphasized passes
    // They might have a special class, badge, or background color
    const highlightedPasses = page.locator('[data-upcoming="true"], .pass-upcoming, .bg-yellow, .bg-blue-100');
    
    // If there are highlighted passes, they should be within 24 hours
    if (await highlightedPasses.count() > 0) {
      const firstHighlighted = highlightedPasses.first();
      await expect(firstHighlighted).toBeVisible();
      
      // Should contain "today" or "soon" or similar indicator
      await expect(firstHighlighted).toContainText(/today|soon|upcoming|next/i);
    }
  });

  test('should update passes when switching satellites', async ({ page }) => {
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Open passes for ISS
    const passesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await passesButton.click();

    await expect(page.getByRole('heading', { name: /upcoming passes|pass predictions/i })).toBeVisible({ timeout: 5000 });

    // Close pass predictions
    const closeButton = page.getByRole('button', { name: /close/i });
    await closeButton.click();

    // Search for another satellite
    const searchInput = page.getByPlaceholder(/search satellites/i);
    await searchInput.fill('Hubble');
    await page.waitForTimeout(500);

    const hubbleResult = page.getByRole('button', { name: /hubble/i }).first();
    await hubbleResult.click();

    // Wait for Hubble to be tracked
    await expect(page.getByText(/hubble/i)).toBeVisible();

    // Open passes for Hubble
    const hubblePassesButton = page.getByRole('button', { name: /passes|predict passes/i });
    await hubblePassesButton.click();

    // Should show Hubble passes (or loading state)
    await expect(page.getByRole('heading', { name: /upcoming passes|pass predictions/i })).toBeVisible({ timeout: 5000 });
    
    // Verify it's for Hubble
    await expect(page.getByText(/hubble/i)).toBeVisible();
  });
});
