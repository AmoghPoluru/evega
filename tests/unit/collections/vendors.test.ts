import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vendors } from '@/collections/Vendors';
import type { User } from '@/payload-types';
import * as accessLib from '@/lib/access';

/**
 * Unit tests for Vendors collection
 * Tests access control, hooks, and collection configuration
 */

// Mock the access control functions
vi.mock('@/lib/access', () => ({
  isSuperAdmin: vi.fn(),
  getVendorId: vi.fn(),
}));

describe('Vendors Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Control', () => {
    describe('read access', () => {
      it('should allow public to read vendors', () => {
        const req = {
          user: undefined,
        } as any;

        const result = Vendors.access?.read?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow authenticated users to read vendors', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        const result = Vendors.access?.read?.({ req } as any);

        expect(result).toBe(true);
      });
    });

    describe('create access', () => {
      it('should allow authenticated users to create vendors', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
        } as any;

        const result = Vendors.access?.create?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should not allow unauthenticated users to create vendors', () => {
        const req = {
          user: undefined,
        } as any;

        const result = Vendors.access?.create?.({ req } as any);

        expect(result).toBe(false);
      });
    });

    describe('update access', () => {
      it('should allow super admin to update any vendor', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
          data: {},
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);

        const result = Vendors.access?.update?.({ req, data: {} } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to update their own vendor (except status/isActive)', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
          data: {
            name: 'Updated Name',
          },
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Vendors.access?.update?.({ req, data: req.data } as any);

        expect(result).toEqual({
          id: { equals: vendorId },
        });
      });

      it('should not allow vendors to update status', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
          data: {
            status: 'approved',
          },
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Vendors.access?.update?.({ req, data: req.data } as any);

        expect(result).toBe(false);
      });

      it('should not allow vendors to update isActive', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
          data: {
            isActive: false,
          },
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Vendors.access?.update?.({ req, data: req.data } as any);

        expect(result).toBe(false);
      });

      it('should not allow users without vendor to update vendors', () => {
        const user: Partial<User> = {
          id: 'user-123',
        };

        const req = {
          user,
          data: {},
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(null);

        const result = Vendors.access?.update?.({ req, data: req.data } as any);

        expect(result).toBe(false);
      });
    });

    describe('delete access', () => {
      it('should allow super admin to delete vendors', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);

        const result = Vendors.access?.delete?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should not allow vendors to delete their own vendor', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);

        const result = Vendors.access?.delete?.({ req } as any);

        expect(result).toBe(false);
      });
    });
  });

  describe('Collection Configuration', () => {
    it('should have correct slug', () => {
      expect(Vendors.slug).toBe('vendors');
    });

    it('should have admin configuration', () => {
      expect(Vendors.admin).toBeDefined();
      expect(Vendors.admin?.useAsTitle).toBe('name');
    });
  });
});
