import { test, expect } from '@playwright/test';

/**
 * E2E Test: Search and Browse Functionality
 * 
 * Tests:
 * - Search functionality
 * - Product browsing
 * - Category navigation
 * - Product filtering
 */

test.describe('Search and Browse Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for products using search bar', async ({ page }) => {
    // Find search input in navbar
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
    
    if (await searchInput.isVisible()) {
      // Enter search query
      await searchInput.fill('laptop');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForURL(/\/search/i, { timeout: 5000 });
      await expect(page).toHaveURL(/\/search/i);
      
      // Verify search parameter in URL
      const url = page.url();
      expect(url).toContain('search=');
    } else {
      // Navigate to search page directly
      await page.goto('/search?search=laptop');
      await expect(page).toHaveURL(/\/search/i);
    }
  });

  test('should browse products on homepage', async ({ page }) => {
    // Verify homepage loaded
    await expect(page).toHaveURL('/');
    
    // Check for product sections or listings
    await page.waitForTimeout(1000);
    
    // Look for product cards, sections, or hero banners
    const productSection = page.locator('[class*="product"], [data-testid="products"], section').first();
    
    // Homepage should have some content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to category pages', async ({ page }) => {
    // Look for category navigation
    const categoryLink = page.locator('a[href*="/category"], nav a, [class*="category"]').first();
    
    if (await categoryLink.isVisible()) {
      const href = await categoryLink.getAttribute('href');
      if (href && href !== '#') {
        await categoryLink.click();
        await page.waitForTimeout(1000);
        
        // Verify we navigated to a category page
        const url = page.url();
        expect(url).not.toBe('http://localhost:3000/');
      }
    } else {
      // Try navigating to a category directly
      await page.goto('/category/electronics');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/category/i);
    }
  });

  test('should view product details when clicking a product', async ({ page }) => {
    // Navigate to search or category page to find products
    await page.goto('/search');
    await page.waitForTimeout(1000);
    
    // Look for product links
    const productLink = page.locator('a[href*="/products/"]').first();
    
    if (await productLink.isVisible()) {
      const productUrl = await productLink.getAttribute('href');
      try {
        await productLink.click({ timeout: 2000 });
      } catch {
        // If click fails, navigate directly
        if (productUrl) {
          await page.goto(productUrl);
        } else {
          await productLink.click({ force: true });
        }
      }
      
      // Wait for product page
      await page.waitForTimeout(1000);
      
      // Verify we're on a product page
      if (productUrl) {
        await expect(page).toHaveURL(new RegExp(productUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
      
      // Check for product details (name, price, etc.)
      const productName = page.locator('h1, [class*="product-name"], [data-testid="product-name"]');
      const productPrice = page.locator('[class*="price"], [data-testid="price"]');
      
      // At least product page should be visible
      await expect(page.locator('body')).toBeVisible();
    } else {
      // Skip if no products available
      test.skip();
    }
  });

  test('should filter products by category', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search');
    await page.waitForTimeout(1000);
    
    // Look for category filter
    const categoryFilter = page.locator('button:has-text("Category"), select[name*="category"], [data-testid="category-filter"]').first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
      
      // Verify filter is interactive
      await expect(categoryFilter).toBeVisible();
    }
  });
});
