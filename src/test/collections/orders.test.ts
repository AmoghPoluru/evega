import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orders } from '@/collections/Orders';
import type { User } from '@/payload-types';
import * as accessLib from '@/lib/access';

/**
 * Unit tests for Orders collection
 * Tests access control, hooks, and collection configuration
 */

// Mock the access control functions
vi.mock('@/lib/access', () => ({
  isSuperAdmin: vi.fn(),
  isVendor: vi.fn(),
  getVendorId: vi.fn(),
}));

describe('Orders Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Control', () => {
    describe('read access', () => {
      it('should allow super admin to read all orders', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);

        const result = Orders.access?.read?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to read their own vendor orders', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Orders.access?.read?.({ req } as any);

        expect(result).toEqual({
          vendor: { equals: vendorId },
        });
      });

      it('should allow users to read their own orders', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);

        const result = Orders.access?.read?.({ req } as any);

        expect(result).toEqual({
          user: { equals: user.id },
        });
      });

      it('should not allow unauthenticated users to read orders', () => {
        const req = {
          user: undefined,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);

        const result = Orders.access?.read?.({ req } as any);

        expect(result).toBe(false);
      });
    });

    describe('create access', () => {
      it('should allow creation (for webhooks)', () => {
        const req = {
          user: undefined,
        } as any;

        const result = Orders.access?.create?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow creation with user context', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        const result = Orders.access?.create?.({ req } as any);

        expect(result).toBe(true);
      });
    });

    describe('update access', () => {
      it('should allow super admin to update any order', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);

        const result = Orders.access?.update?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to update their own vendor orders', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Orders.access?.update?.({ req } as any);

        expect(result).toEqual({
          vendor: { equals: vendorId },
        });
      });

      it('should not allow regular users to update orders', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);

        const result = Orders.access?.update?.({ req } as any);

        expect(result).toBe(false);
      });
    });

    describe('delete access', () => {
      it('should allow super admin to delete orders', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);

        const result = Orders.access?.delete?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should not allow vendors to delete orders', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);

        const result = Orders.access?.delete?.({ req } as any);

        expect(result).toBe(false);
      });

      it('should not allow regular users to delete orders', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);

        const result = Orders.access?.delete?.({ req } as any);

        expect(result).toBe(false);
      });
    });
  });

  describe('Collection Configuration', () => {
    it('should have correct slug', () => {
      expect(Orders.slug).toBe('orders');
    });

    it('should have admin configuration', () => {
      expect(Orders.admin).toBeDefined();
      expect(Orders.admin?.useAsTitle).toBe('orderNumber');
    });
  });
});
