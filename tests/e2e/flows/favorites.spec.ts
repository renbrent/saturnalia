import { test, expect } from '@playwright/test';

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('T054: add favorite, refresh, favorite persists', async ({ page }) => {
    await page.goto('/');

    // Wait for ISS to load (default satellite)
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Find and click the favorite button
    const favoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();

    // Verify favorite was added (button state should change)
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Refresh the page
    await page.reload();

    // Wait for app to reload
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Verify favorite persists after refresh
    const favoriteButtonAfterRefresh = page.getByRole('button', { name: /favorite|add to favorites/i });
    await expect(favoriteButtonAfterRefresh).toHaveAttribute('aria-pressed', 'true');

    // Verify favorites list shows the satellite
    const favoritesList = page.getByRole('list', { name: /favorites/i });
    await expect(favoritesList).toBeVisible();
    await expect(favoritesList.getByText(/ISS/i)).toBeVisible();
  });

  test('should unfavorite a satellite', async ({ page }) => {
    await page.goto('/');

    // Wait for ISS to load
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Add to favorites
    const favoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Remove from favorites
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');

    // Verify it's removed from favorites list
    const favoritesList = page.getByRole('list', { name: /favorites/i });
    await expect(favoritesList.getByText(/ISS/i)).not.toBeVisible();
  });

  test('should select satellite from favorites list', async ({ page }) => {
    await page.goto('/');

    // Wait for ISS to load
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });

    // Add ISS to favorites
    const favoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await favoriteButton.click();

    // Search for another satellite (Hubble)
    const searchInput = page.getByPlaceholder(/search satellites/i);
    await searchInput.fill('Hubble');
    await page.waitForTimeout(500); // Wait for debounce

    // Select Hubble from search results
    const hubbleResult = page.getByRole('button', { name: /hubble/i }).first();
    await hubbleResult.click();

    // Wait for Hubble to be tracked
    await expect(page.getByText(/hubble/i)).toBeVisible();

    // Add Hubble to favorites
    const hubbleFavoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await hubbleFavoriteButton.click();

    // Now select ISS from favorites list
    const favoritesList = page.getByRole('list', { name: /favorites/i });
    const issFavoriteItem = favoritesList.getByRole('button', { name: /ISS/i });
    await issFavoriteItem.click();

    // Verify ISS is now being tracked
    await expect(page.getByText(/ISS/i)).toBeVisible();
    
    // The satellite card should show ISS details
    const satelliteCard = page.locator('[data-testid="satellite-card"]');
    await expect(satelliteCard).toContainText(/ISS/i);
  });

  test('should handle multiple favorites', async ({ page }) => {
    await page.goto('/');

    // Add ISS to favorites
    await expect(page.getByText(/ISS/i)).toBeVisible({ timeout: 10000 });
    const favoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await favoriteButton.click();

    // Search and add Hubble
    const searchInput = page.getByPlaceholder(/search satellites/i);
    await searchInput.fill('Hubble');
    await page.waitForTimeout(500);
    const hubbleResult = page.getByRole('button', { name: /hubble/i }).first();
    await hubbleResult.click();
    await page.waitForTimeout(1000);
    
    const hubbleFavoriteButton = page.getByRole('button', { name: /favorite|add to favorites/i });
    await hubbleFavoriteButton.click();

    // Verify favorites list has both
    const favoritesList = page.getByRole('list', { name: /favorites/i });
    await expect(favoritesList.getByText(/ISS/i)).toBeVisible();
    await expect(favoritesList.getByText(/hubble/i)).toBeVisible();

    // Refresh and verify both persist
    await page.reload();
    await page.waitForTimeout(1000);

    const favoritesListAfterRefresh = page.getByRole('list', { name: /favorites/i });
    await expect(favoritesListAfterRefresh.getByText(/ISS/i)).toBeVisible();
    await expect(favoritesListAfterRefresh.getByText(/hubble/i)).toBeVisible();
  });
});
