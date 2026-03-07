import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { ordersRouter } from '@/modules/orders/server/procedures';
import { createMockTRPCContext, createProtectedContext } from '../utils/trpc-test-utils';
import type { Order, Product, User } from '@/payload-types';

/**
 * Unit tests for Orders tRPC procedures
 */

describe('Orders tRPC Router', () => {
  describe('getMany', () => {
    it('should return paginated orders list', async () => {
      const mockOrders: Partial<Order>[] = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'pending',
          total: 9999,
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          status: 'complete',
          total: 19999,
        },
      ];

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: mockOrders,
          totalDocs: 2,
          totalPages: 1,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      const result = await caller.getMany({
        limit: 20,
        cursor: 1,
      });

      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(2);
      expect(result.totalDocs).toBe(2);
      expect(mockPayload.find).toHaveBeenCalled();
    });

    it('should filter orders by status', async () => {
      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      await caller.getMany({
        status: 'pending',
      });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { equals: 'pending' },
          }),
        })
      );
    });

    it('should filter orders by userId', async () => {
      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      await caller.getMany({
        userId: 'user-123',
      });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: { equals: 'user-123' },
          }),
        })
      );
    });
  });

  describe('getOne', () => {
    it('should return order by ID', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        status: 'pending',
        total: 9999,
      };

      const mockPayload = {
        findByID: vi.fn().mockResolvedValue(mockOrder),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      const result = await caller.getOne({ id: 'order-123' });

      expect(result).toBeDefined();
      expect(result.id).toBe('order-123');
      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'orders',
        id: 'order-123',
        depth: 2,
      });
    });

    it('should throw NOT_FOUND for non-existent order', async () => {
      const mockPayload = {
        findByID: vi.fn().mockResolvedValue(null),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      await expect(caller.getOne({ id: 'non-existent' })).rejects.toThrow(TRPCError);
    });
  });

  describe('getByUser', () => {
    it('should return orders for authenticated user', async () => {
      const mockOrders: Partial<Order>[] = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'pending',
        },
      ];

      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: mockOrders,
          totalDocs: 1,
          totalPages: 1,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
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

      const caller = ordersRouter.createCaller(ctx as any);

      const result = await caller.getByUser();

      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(1);
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: { equals: 'user-123' },
          }),
        })
      );
    });

    it('should filter user orders by status', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
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

      const caller = ordersRouter.createCaller(ctx as any);

      await caller.getByUser({
        status: 'complete',
      });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: { equals: 'user-123' },
            status: { equals: 'complete' },
          }),
        })
      );
    });
  });

  describe('getByOrderNumber', () => {
    it('should return order by order number', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        status: 'pending',
      };

      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [mockOrder],
        }),
        auth: vi.fn().mockResolvedValue({ user: null }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = ordersRouter.createCaller(ctx as any);

      const result = await caller.getByOrderNumber({ orderNumber: 'ORD-001' });

      expect(result).toBeDefined();
      expect(result.orderNumber).toBe('ORD-001');
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderNumber: { equals: 'ORD-001' },
          }),
        })
      );
    });
  });
});
