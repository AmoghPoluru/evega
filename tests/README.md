# Tests Directory

This directory contains all test-related files for the Evega project, organized by type.

## Structure

```
tests/
├── unit/              # Unit and integration tests (Vitest)
│   ├── collections/   # Collection access control tests
│   ├── components/    # React component tests
│   ├── integration/   # Integration tests
│   ├── lib/          # Library/utility tests
│   ├── trpc/         # tRPC procedure tests
│   ├── utils/        # Test utilities and helpers
│   └── setup.ts      # Vitest setup file
│
├── e2e/              # End-to-end tests (Playwright)
│   ├── checkout-flow.spec.ts
│   ├── search-browse.spec.ts
│   ├── user-journey.spec.ts
│   └── README.md
│
├── scripts/          # Test utility scripts
│   ├── test-search.ts        # Comprehensive search test (50+ phrases)
│   └── test-search-quick.ts  # Quick search test (8 key phrases)
│
├── config/           # Test configuration files
│   ├── vitest.config.ts      # Vitest configuration
│   └── playwright.config.ts  # Playwright configuration
│
└── output/           # Test output directories (git-ignored)
    ├── playwright-report/    # Playwright HTML reports
    └── test-results/         # Playwright test artifacts
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run once (CI mode)
npm run test:run
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Search Test Scripts

```bash
# Comprehensive search test (50+ phrases)
npm run test:search

# Quick search test (8 key phrases)
npm run test:search:quick
```

## Test Types

### Unit Tests
- **Location**: `tests/unit/`
- **Framework**: Vitest
- **Coverage**: Collections, components, tRPC procedures, utilities
- **Config**: `tests/config/vitest.config.ts`

### E2E Tests
- **Location**: `tests/e2e/`
- **Framework**: Playwright
- **Coverage**: User journeys, checkout flow, search and browse
- **Config**: `tests/config/playwright.config.ts`

### Test Scripts
- **Location**: `tests/scripts/`
- **Purpose**: Utility scripts for testing specific functionality
- **Examples**: Search query parsing, database search validation

## Test Utilities

Test utilities are located in `tests/unit/utils/`:
- `payload-test-utils.ts` - Payload CMS mocking utilities
- `trpc-test-utils.ts` - tRPC context mocking utilities
- `index.ts` - Utility exports

## Coverage

Coverage thresholds (configured in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Test Outputs

Test output directories are located in `tests/output/` and are git-ignored:
- `tests/output/playwright-report/` - HTML reports from E2E tests
- `tests/output/test-results/` - Playwright test artifacts (screenshots, traces)
- `coverage/` - Code coverage reports (at project root)

To view Playwright reports:
```bash
# After running E2E tests
open tests/output/playwright-report/index.html
```

## Notes

- All test files use the `@/` alias to import from `src/`
- E2E tests require the dev server to be running (auto-started by Playwright)
- Test scripts require MongoDB connection (via `DATABASE_URL`)
- Test output directories are automatically git-ignored