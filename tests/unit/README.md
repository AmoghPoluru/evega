# Testing Guide - Evega Project

## Overview

This directory contains all tests for the Evega multi-vendor marketplace application. The testing infrastructure uses **Vitest** for unit and integration tests.

## Test Structure

```
src/test/
├── setup.ts                    # Test setup and global mocks
├── utils/                      # Test utilities
│   ├── payload-test-utils.ts  # Payload CMS test helpers
│   ├── trpc-test-utils.ts     # tRPC test helpers
│   └── index.ts               # Utility exports
├── collections/               # Collection unit tests
│   └── products.test.ts       # Products collection tests
├── lib/                       # Utility function tests
│   └── access.test.ts         # Access control tests
├── trpc/                      # tRPC procedure tests
│   └── products.test.ts      # Products tRPC tests
└── integration/               # Integration tests
    └── checkout.test.ts       # Checkout workflow tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests once (CI mode)
```bash
npm run test:run
```

## Test Categories

### Unit Tests
- **Collections**: Test Payload CMS collection access control, hooks, and validation
- **Utilities**: Test helper functions (access control, utilities)
- **tRPC Procedures**: Test individual tRPC procedures in isolation

### Integration Tests
- **Workflows**: Test complete workflows (checkout, order creation, vendor approval)
- **Module Interactions**: Test how different modules work together

### E2E Tests (Future)
- **User Flows**: Test complete user journeys (signup → browse → checkout)
- **Vendor Flows**: Test vendor workflows (registration → product creation → orders)

## Writing Tests

### Test Utilities

#### Payload Test Utils
```typescript
import { createTestUser, createTestVendor, createTestProduct } from '@/test/utils';

const user = await createTestUser(payload);
const vendor = await createTestVendor(payload);
const product = await createTestProduct(payload, vendor.id);
```

#### tRPC Test Utils
```typescript
import { createMockTRPCContext, createVendorContext } from '@/test/utils';

const ctx = createMockTRPCContext();
const vendorCtx = createVendorContext(user, vendor);
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { Products } from '@/collections/Products';

describe('Products Collection', () => {
  describe('Access Control', () => {
    it('should allow public to read published products', () => {
      const req = { user: undefined };
      const result = Products.access?.read?.({ req } as any);
      expect(result).toEqual({
        isArchived: { equals: false },
        isPrivate: { equals: false },
      });
    });
  });
});
```

## Test Coverage Goals

- **Critical Paths**: >90% coverage
- **Business Logic**: >80% coverage
- **UI Components**: >70% coverage
- **Overall Project**: >75% coverage

## Current Test Status

### ✅ Completed
- Test infrastructure setup (Vitest, React Testing Library)
- Test utilities (Payload, tRPC)
- Products collection access control tests
- Access control utility tests
- Products tRPC procedure tests (basic)

### 🚧 In Progress
- Integration tests for checkout workflow
- Order creation tests
- Vendor approval workflow tests

### 📋 TODO
- E2E tests for user flows
- Component tests
- Performance tests
- Security tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after tests
3. **Mocks**: Use mocks for external dependencies (Stripe, email services)
4. **Real Data**: Use real Payload instances for integration tests when possible
5. **Type Safety**: Maintain TypeScript types in all tests
6. **Descriptive Names**: Use descriptive test names that explain what is being tested

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check that `vitest.config.ts` has correct path aliases

### Database connection errors
- Ensure MongoDB is running
- Check `DATABASE_URL` environment variable
- Use test database: `DATABASE_URL=mongodb://localhost:27017/evega-test`

### Mock errors
- Ensure mocks are set up in `setup.ts`
- Check that mocks match actual module exports

## Next Steps

1. Complete integration tests for critical workflows
2. Add E2E tests using Playwright
3. Set up CI/CD to run tests automatically
4. Add performance and load tests
5. Implement security testing
