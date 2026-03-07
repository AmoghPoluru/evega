# E2E Tests - Evega Project

## Overview

End-to-end tests for the Evega multi-vendor marketplace using Playwright. These tests verify the complete user journey from browsing to checkout.

## Test Coverage

### User Journey Tests (`user-journey.spec.ts`)
- ✅ Complete user flow: Homepage → Search → Browse → Product Details → Add to Cart → Checkout
- ✅ Search functionality
- ✅ Product browsing
- ✅ Category navigation
- ✅ Cart management

### Search & Browse Tests (`search-browse.spec.ts`)
- ✅ Search for products
- ✅ Browse products on homepage
- ✅ Navigate category pages
- ✅ View product details
- ✅ Filter products by category

### Checkout Flow Tests (`checkout-flow.spec.ts`)
- ✅ Add product to cart
- ✅ View cart/checkout page
- ✅ Empty cart handling
- ✅ Navigation to checkout

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test e2e/user-journey.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Prerequisites

1. **Development server running**: Tests automatically start the dev server, but you can run it manually:
   ```bash
   npm run dev
   ```

2. **Database seeded**: For best results, ensure test data exists:
   ```bash
   npm run db:seed
   ```

## Test Structure

```
e2e/
├── user-journey.spec.ts    # Complete user journey tests
├── search-browse.spec.ts   # Search and browse tests
├── checkout-flow.spec.ts   # Checkout process tests
└── README.md               # This file
```

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Auto-starts dev server if not running
- Screenshots on failure
- HTML report generated

## Notes

- Tests are designed to be resilient - they skip steps if data doesn't exist
- Some tests may skip if products aren't available in the database
- Tests wait for navigation and element visibility automatically
- Screenshots are captured on test failures

## CI/CD Integration

To run in CI:
```bash
npx playwright install --with-deps
npm run test:e2e
```

## Debugging

1. **Run in headed mode**: See what's happening
   ```bash
   npm run test:e2e:headed
   ```

2. **Use Playwright Inspector**: Step through tests
   ```bash
   npx playwright test --debug
   ```

3. **View HTML report**: After test run
   ```bash
   npx playwright show-report
   ```
