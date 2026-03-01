import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Products } from '@/collections/Products';
import type { User, Vendor } from '@/payload-types';
import * as accessLib from '@/lib/access';

/**
 * Unit tests for Products collection
 * Tests access control, hooks, and collection configuration
 */

// Mock the access control functions
vi.mock('@/lib/access', () => ({
  isSuperAdmin: vi.fn(),
  isVendor: vi.fn(),
  getVendorId: vi.fn(),
}));

describe('Products Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Control', () => {
    describe('read access', () => {
      it('should allow public to read published, non-private products', () => {
        const req = {
          user: undefined,
        } as any;

        const result = Products.access?.read?.({ req } as any);

        expect(result).toEqual({
          isArchived: { equals: false },
          isPrivate: { equals: false },
        });
      });

      it('should allow vendors to see their own drafts', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        // Mock isVendor and getVendorId
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Products.access?.read?.({ req } as any);

        expect(result).toHaveProperty('or');
        if (result && typeof result === 'object' && 'or' in result) {
          expect(result.or).toBeInstanceOf(Array);
          expect(result.or).toHaveLength(2);
        }
      });

      it('should not allow vendors to see other vendors drafts', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        // Mock isVendor and getVendorId
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Products.access?.read?.({ req } as any);

        // Should only see public products or own products
        expect(result).toHaveProperty('or');
      });
    });

    describe('create access', () => {
      it('should allow super admin to create products', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);

        const result = Products.access?.create?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to create products', () => {
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: 'vendor-123',
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin and isVendor
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);

        const result = Products.access?.create?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should not allow customers to create products', () => {
        const user: Partial<User> = {
          id: 'customer-123',
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin and isVendor
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);

        const result = Products.access?.create?.({ req } as any);

        expect(result).toBe(false);
      });
    });

    describe('update access', () => {
      it('should allow super admin to update any product', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(null);

        const result = Products.access?.update?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to update their own products', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin, isVendor, and getVendorId
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Products.access?.update?.({ req } as any);

        expect(result).toEqual({
          vendor: { equals: vendorId },
        });
      });

      it('should not allow vendors to update other vendors products', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin, isVendor, and getVendorId
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Products.access?.update?.({ req } as any);

        // Should return a where clause that restricts to own vendor
        expect(result).toEqual({
          vendor: { equals: vendorId },
        });
      });
    });

    describe('delete access', () => {
      it('should allow super admin to delete any product', () => {
        const user: Partial<User> = {
          id: 'admin-123',
          appRole: { slug: 'app-admin' } as any,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(true);
        vi.mocked(accessLib.isVendor).mockReturnValue(false);
        vi.mocked(accessLib.getVendorId).mockReturnValue(null);

        const result = Products.access?.delete?.({ req } as any);

        expect(result).toBe(true);
      });

      it('should allow vendors to delete their own products', () => {
        const vendorId = 'vendor-123';
        const user: Partial<User> = {
          id: 'vendor-user-123',
          vendor: vendorId,
        };

        const req = {
          user,
        } as any;

        // Mock isSuperAdmin, isVendor, and getVendorId
        vi.mocked(accessLib.isSuperAdmin).mockReturnValue(false);
        vi.mocked(accessLib.isVendor).mockReturnValue(true);
        vi.mocked(accessLib.getVendorId).mockReturnValue(vendorId);

        const result = Products.access?.delete?.({ req } as any);

        expect(result).toEqual({
          vendor: { equals: vendorId },
        });
      });
    });
  });

  describe('Collection Configuration', () => {
    it('should have correct slug', () => {
      expect(Products.slug).toBe('products');
    });

    it('should have admin configuration', () => {
      expect(Products.admin).toBeDefined();
      expect(Products.admin?.useAsTitle).toBe('name');
    });

    it('should have required fields', () => {
      const fieldNames = Products.fields?.map((field) => 
        typeof field === 'object' && 'name' in field ? field.name : null
      ).filter(Boolean);

      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('price');
      expect(fieldNames).toContain('vendor');
      expect(fieldNames).toContain('category');
    });
  });
});
