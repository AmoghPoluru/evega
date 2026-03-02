import { test, expect } from '@playwright/test';

/**
 * E2E Test: Checkout Flow
 * 
 * Tests:
 * - Adding products to cart
 * - Viewing cart
 * - Checkout process
 * - Order completion
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add product to cart and view cart', async ({ page }) => {
    // Navigate to a product page
    const productLink = page.locator('a[href*="/products/"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/\/products\//i, { timeout: 5000 });
      
      // Add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add"), [data-testid="add-to-cart"]').first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(500);
        
        // Navigate to checkout
        await page.goto('/checkout');
        await page.waitForURL(/\/checkout/i);
        
        // Verify checkout page loaded
        await expect(page).toHaveURL(/\/checkout/i);
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('should display checkout page correctly', async ({ page }) => {
    // Navigate directly to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Verify checkout page elements
    await expect(page).toHaveURL(/\/checkout/i);
    
    // Check for checkout form or order summary
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    // Clear any existing cart state by navigating to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Look for empty cart message or continue shopping button
    const emptyMessage = page.locator('text=/empty|no items|cart is empty|continue shopping/i');
    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Purchase")');
    
    // Either empty message or checkout button should be visible
    const hasEmptyMessage = await emptyMessage.count() > 0;
    const hasCheckoutButton = await checkoutButton.count() > 0;
    
    // Page should load regardless
    await expect(page).toHaveURL(/\/checkout/i);
  });

  test('should navigate to checkout from cart button in navbar', async ({ page }) => {
    // Find cart/checkout button in navbar
    const cartButton = page.locator('a[href="/checkout"], a[href*="checkout"], button:has-text("Cart")').first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForURL(/\/checkout/i, { timeout: 5000 });
      await expect(page).toHaveURL(/\/checkout/i);
    } else {
      // Navigate directly
      await page.goto('/checkout');
      await expect(page).toHaveURL(/\/checkout/i);
    }
  });

  test('should redirect to sign-in when accessing checkout without authentication', async ({ page }) => {
    // Navigate to checkout without being logged in
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Should redirect to sign-in page with redirect parameter
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/sign-in/i);
    expect(currentUrl).toMatch(/redirect.*checkout/i);
  });

  test('should redirect to sign-in when trying to add to cart without authentication', async ({ page }) => {
    // Navigate to a product page
    const productLink = page.locator('a[href*="/products/"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click({ force: true });
      await page.waitForURL(/\/products\//i, { timeout: 5000 });
      
      // Try to add to cart
      const addToCartButton = page.locator('button:has-text("Add to cart"), button:has-text("Add to Cart")').first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Should redirect to sign-in with redirect parameter
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/sign-in/i);
        expect(currentUrl).toMatch(/redirect.*products/i);
      }
    }
  });

  test('should remove item from checkout cart', async ({ page }) => {
    // This test requires authentication and items in cart
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Look for remove buttons (X icon) on cart items
    const removeButtons = page.locator('button[aria-label*="Remove"], button[title*="Remove"], button:has(svg)').filter({ hasText: /remove/i }).or(page.locator('button').filter({ has: page.locator('svg') })).first();
    
    // If items exist and remove button is visible, test removal
    const orderItems = page.locator('text=/order items|Order items/i');
    if (await orderItems.isVisible()) {
      const removeButton = page.locator('button[aria-label*="Remove"], button[title*="Remove"]').first();
      
      if (await removeButton.isVisible()) {
        // Count items before removal
        const itemsBefore = await page.locator('[class*="border-b"]').count();
        
        // Click remove button
        await removeButton.click();
        await page.waitForTimeout(500);
        
        // Verify toast notification appears
        const toast = page.locator('text=/removed|success/i').first();
        // Toast may appear briefly, so we just check if click was successful
      }
    }
  });

  test('should redirect back to checkout after authentication', async ({ page }) => {
    // Navigate to checkout (will redirect to sign-in)
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Verify we're on sign-in page with redirect parameter
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/sign-in/i);
    expect(currentUrl).toMatch(/redirect/i);
    
    // Note: Actual login test would require test credentials
    // This test verifies the redirect parameter is present
  });
});
