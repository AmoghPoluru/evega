import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { checkoutRouter } from '@/modules/checkout/server/procedures';
import { createProtectedContext } from '../utils/trpc-test-utils';
import type { User, Product, Vendor } from '@/payload-types';

/**
 * Unit tests for Checkout tRPC procedures
 */

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

describe('Checkout tRPC Router', () => {
  describe('purchase', () => {
    it('should create checkout session for valid cart items', async () => {
      const mockVendor: Partial<Vendor> = {
        id: 'vendor-123',
        name: 'Test Vendor',
      };

      const mockProduct: Partial<Product> = {
        id: 'product-123',
        name: 'Test Product',
        price: 9999,
        vendor: mockVendor.id,
        isArchived: false,
        variants: [],
      };

      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [mockProduct],
          totalDocs: 1,
        }),
        auth: vi.fn().mockResolvedValue({
          user: mockUser,
          token: 'mock-token',
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const { stripe } = await import('@/lib/stripe');
      const mockStripeSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockStripeSession as any);

      const ctx = createProtectedContext(mockUser as User, mockPayload as any);

      const caller = checkoutRouter.createCaller(ctx as any);

      const result = await caller.purchase({
        cartItems: [
          {
            productId: 'product-123',
            quantity: 1,
          },
        ],
      });

      expect(result).toBeDefined();
      // The procedure returns { url: checkout.url }
      expect(result).toHaveProperty('url');
      expect(result.url).toBe('https://checkout.stripe.com/test');
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
      expect(mockPayload.find).toHaveBeenCalled();
    });

    it('should throw error if product not found', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [],
          totalDocs: 0,
        }),
        auth: vi.fn().mockResolvedValue({
          user: mockUser,
          token: 'mock-token',
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createProtectedContext(mockUser as User, mockPayload as any);

      const caller = checkoutRouter.createCaller(ctx as any);

      await expect(
        caller.purchase({
          cartItems: [
            {
              productId: 'non-existent',
              quantity: 1,
            },
          ],
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw error if products from different vendors', async () => {
      const mockVendor1: Partial<Vendor> = {
        id: 'vendor-1',
      };

      const mockVendor2: Partial<Vendor> = {
        id: 'vendor-2',
      };

      const mockProducts: Partial<Product>[] = [
        {
          id: 'product-1',
          vendor: mockVendor1.id,
          isArchived: false,
        },
        {
          id: 'product-2',
          vendor: mockVendor2.id,
          isArchived: false,
        },
      ];

      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: mockProducts,
          totalDocs: 2,
        }),
        auth: vi.fn().mockResolvedValue({
          user: mockUser,
          token: 'mock-token',
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createProtectedContext(mockUser as User, mockPayload as any);

      const caller = checkoutRouter.createCaller(ctx as any);

      await expect(
        caller.purchase({
          cartItems: [
            {
              productId: 'product-1',
              quantity: 1,
            },
            {
              productId: 'product-2',
              quantity: 1,
            },
          ],
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw error if product is archived', async () => {
      const mockVendor: Partial<Vendor> = {
        id: 'vendor-123',
      };

      const mockProduct: Partial<Product> = {
        id: 'product-123',
        vendor: mockVendor.id,
        isArchived: true,
      };

      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [],
          totalDocs: 0,
        }),
        auth: vi.fn().mockResolvedValue({
          user: mockUser,
          token: 'mock-token',
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createProtectedContext(mockUser as User, mockPayload as any);

      const caller = checkoutRouter.createCaller(ctx as any);

      await expect(
        caller.purchase({
          cartItems: [
            {
              productId: 'product-123',
              quantity: 1,
            },
          ],
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
