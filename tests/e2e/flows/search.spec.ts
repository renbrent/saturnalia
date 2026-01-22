import { test, expect } from '@playwright/test';

test.describe('Satellite Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial load
    await expect(page.getByTestId('satellite-map')).toBeVisible({ timeout: 10000 });
  });

  test('search bar is visible and functional', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('typing in search shows results', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Type a search query
    await searchInput.fill('hubble');
    
    // Wait for results to appear (debounced)
    const results = page.getByTestId('search-results');
    await expect(results).toBeVisible({ timeout: 5000 });
    
    // Should have at least one result
    const resultItems = page.getByTestId('search-result-item');
    await expect(resultItems.first()).toBeVisible();
  });

  test('selecting a satellite from search updates the map', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Search for Hubble
    await searchInput.fill('hubble');
    
    // Wait for and click on a result
    const resultItem = page.getByTestId('search-result-item').first();
    await expect(resultItem).toBeVisible({ timeout: 5000 });
    await resultItem.click();
    
    // Search should close
    await expect(page.getByTestId('search-results')).not.toBeVisible();
    
    // Satellite card should show the new satellite
    const satelliteCard = page.getByTestId('satellite-card');
    await expect(satelliteCard).toContainText(/hubble/i, { timeout: 10000 });
  });

  test('empty search query shows no results', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Focus and clear
    await searchInput.click();
    await searchInput.fill('');
    
    // Results should not be visible
    await expect(page.getByTestId('search-results')).not.toBeVisible();
  });

  test('no results message appears for unknown satellites', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Search for something that won't exist
    await searchInput.fill('xyznonexistent123');
    
    // Wait for the "no results" message
    await expect(page.getByTestId('no-results-message')).toBeVisible({ timeout: 5000 });
  });

  test('keyboard navigation works in search results', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Search for something with multiple results
    await searchInput.fill('starlink');
    
    // Wait for results
    const results = page.getByTestId('search-results');
    await expect(results).toBeVisible({ timeout: 5000 });
    
    // Press down arrow to highlight first result
    await searchInput.press('ArrowDown');
    
    // First result should be highlighted
    const firstResult = page.getByTestId('search-result-item').first();
    await expect(firstResult).toHaveAttribute('data-highlighted', 'true');
    
    // Press Enter to select
    await searchInput.press('Enter');
    
    // Results should close and satellite should change
    await expect(results).not.toBeVisible();
  });

  test('escape key closes search results', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await searchInput.fill('iss');
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 5000 });
    
    await searchInput.press('Escape');
    await expect(page.getByTestId('search-results')).not.toBeVisible();
  });

  test('clicking outside closes search results', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await searchInput.fill('iss');
    await expect(page.getByTestId('search-results')).toBeVisible({ timeout: 5000 });
    
    // Click on the map
    await page.getByTestId('satellite-map').click();
    await expect(page.getByTestId('search-results')).not.toBeVisible();
  });
});
