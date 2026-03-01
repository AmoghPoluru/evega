import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { productsRouter } from '@/modules/products/server/procedures';
import { createMockTRPCContext, createVendorContext } from '../utils/trpc-test-utils';
import type { Product, Vendor, User } from '@/payload-types';

/**
 * Unit tests for Products tRPC procedures
 */

describe('Products tRPC Router', () => {
  describe('getOne', () => {
    it('should return product by ID', async () => {
      const mockProduct: Product = {
        id: 'product-123',
        name: 'Test Product',
        price: 9999,
        isArchived: false,
        isPrivate: false,
      } as Product;

      const mockPayload = {
        findByID: vi.fn().mockResolvedValue(mockProduct),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = productsRouter.createCaller(ctx as any);

      const result = await caller.getOne({ id: 'product-123' });

      expect(result).toBeDefined();
      expect(result.id).toBe('product-123');
      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'products',
        id: 'product-123',
        depth: 2,
        select: {
          content: false,
        },
      });
    });

    it('should throw NOT_FOUND for archived products', async () => {
      const mockProduct: Product = {
        id: 'product-123',
        name: 'Test Product',
        isArchived: true,
      } as Product;

      const mockPayload = {
        findByID: vi.fn().mockResolvedValue(mockProduct),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = productsRouter.createCaller(ctx as any);

      await expect(caller.getOne({ id: 'product-123' })).rejects.toThrow(TRPCError);
      await expect(caller.getOne({ id: 'product-123' })).rejects.toThrow('Product not found');
    });

    it('should return isPurchased as false when orders not implemented', async () => {
      const mockProduct: Product = {
        id: 'product-123',
        name: 'Test Product',
        price: 9999,
        isArchived: false,
        isPrivate: false,
      } as Product;

      const mockPayload = {
        findByID: vi.fn().mockResolvedValue(mockProduct),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = productsRouter.createCaller(ctx as any);

      const result = await caller.getOne({ id: 'product-123' });

      expect(result.isPurchased).toBe(false);
    });
  });

  describe('getMany', () => {
    it('should return paginated products list', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          price: 9999,
          isArchived: false,
        },
        {
          id: 'product-2',
          name: 'Product 2',
          price: 19999,
          isArchived: false,
        },
      ];

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: mockProducts,
          totalDocs: 2,
          limit: 20,
          page: 1,
          totalPages: 1,
        }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = productsRouter.createCaller(ctx as any);

      const result = await caller.getMany({
        cursor: 1,
        limit: 20,
      });

      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(2);
      expect(result.totalDocs).toBe(2);
      expect(mockPayload.find).toHaveBeenCalled();
    });

    it('should filter products by category', async () => {
      const mockCategory = {
        id: 'category-123',
        slug: 'test-category',
        subcategories: { docs: [] },
      };

      const mockPayload = {
        find: vi.fn()
          .mockResolvedValueOnce({
            docs: [mockCategory],
            totalDocs: 1,
          })
          .mockResolvedValueOnce({
            docs: [],
            totalDocs: 0,
            limit: 20,
            page: 1,
            totalPages: 0,
          }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = productsRouter.createCaller(ctx as any);

      await caller.getMany({
        cursor: 1,
        limit: 20,
        category: 'test-category',
      });

      expect(mockPayload.find).toHaveBeenCalled();
    });
  });
});
