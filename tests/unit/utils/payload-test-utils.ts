import type { Payload } from 'payload';
import type { User, Vendor, Product, Order } from '@/payload-types';
import { getPayload } from 'payload';
import config from '@payload-config';
import { vi } from 'vitest';

/**
 * Test utilities for Payload CMS
 * Provides helpers for creating test data and mocking Payload instances
 */

let testPayload: Payload | null = null;

/**
 * Get or create a test Payload instance
 * Use this in tests to interact with the database
 */
export async function getTestPayload(): Promise<Payload> {
  if (!testPayload) {
    testPayload = await getPayload({ config });
  }
  return testPayload;
}

/**
 * Create a test user
 */
export async function createTestUser(
  payload: Payload,
  overrides?: Partial<User>
): Promise<User> {
  const user = await payload.create({
    collection: 'users',
    data: {
      email: overrides?.email || `test-${Date.now()}@example.com`,
      password: overrides?.password || 'test-password-123',
      name: overrides?.name || 'Test User',
      role: overrides?.role || 'customer',
      ...overrides,
    },
  });

  return user;
}

/**
 * Create a test vendor
 */
export async function createTestVendor(
  payload: Payload,
  overrides?: Partial<Vendor>
): Promise<Vendor> {
  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      name: overrides?.name || `Test Vendor ${Date.now()}`,
      slug: overrides?.slug || `test-vendor-${Date.now()}`,
      status: overrides?.status || 'approved',
      isActive: overrides?.isActive ?? true,
      ...overrides,
    },
  });

  return vendor;
}

/**
 * Create a test product
 */
export async function createTestProduct(
  payload: Payload,
  vendorId: string,
  overrides?: Partial<Product>
): Promise<Product> {
  const product = await payload.create({
    collection: 'products',
    data: {
      name: overrides?.name || `Test Product ${Date.now()}`,
      slug: overrides?.slug || `test-product-${Date.now()}`,
      price: overrides?.price || 9999,
      vendor: vendorId,
      category: overrides?.category || undefined,
      isArchived: overrides?.isArchived ?? false,
      isPrivate: overrides?.isPrivate ?? false,
      ...overrides,
    },
  });

  return product;
}

/**
 * Create a test order
 */
export async function createTestOrder(
  payload: Payload,
  customerId: string,
  items: Array<{ product: string; quantity: number; price: number }>,
  overrides?: Partial<Order>
): Promise<Order> {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await payload.create({
    collection: 'orders',
    data: {
      customer: customerId,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      status: overrides?.status || 'pending',
      ...overrides,
    },
  });

  return order;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(payload: Payload | null): Promise<void> {
  if (!payload) return;
  
  try {
    // Delete test orders
    const orders = await payload.find({
      collection: 'orders',
      where: {
        customer: {
          email: {
            contains: 'test-',
          },
        },
      },
      limit: 1000,
    });
    for (const order of orders.docs) {
      await payload.delete({
        collection: 'orders',
        id: order.id,
      });
    }
  } catch (error) {
    // Ignore errors during cleanup
    console.warn('Error during test cleanup:', error);
  }

  // Delete test products
  const products = await payload.find({
    collection: 'products',
    where: {
      name: {
        contains: 'Test Product',
      },
    },
    limit: 1000,
  });
  for (const product of products.docs) {
    await payload.delete({
      collection: 'products',
      id: product.id,
    });
  }

  // Delete test vendors
  const vendors = await payload.find({
    collection: 'vendors',
    where: {
      name: {
        contains: 'Test Vendor',
      },
    },
    limit: 1000,
  });
  for (const vendor of vendors.docs) {
    await payload.delete({
      collection: 'vendors',
      id: vendor.id,
    });
  }

  // Delete test users
  const users = await payload.find({
    collection: 'users',
    where: {
      email: {
        contains: 'test-',
      },
    },
    limit: 1000,
  });
  for (const user of users.docs) {
    await payload.delete({
      collection: 'users',
      id: user.id,
    });
  }
}

/**
 * Mock Payload instance for unit tests
 */
export function createMockPayload(overrides?: Partial<Payload>): Partial<Payload> {
  return {
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    auth: vi.fn().mockResolvedValue({ user: null }),
    login: vi.fn(),
    config: {
      cookiePrefix: 'payload-token',
    },
    ...overrides,
  } as any;
}

