import { describe, it, expect } from 'vitest';
import {
  isSuperAdmin,
  isAppAdmin,
  isAppStaff,
  isBdo,
  isVendor,
  hasVendor,
  getVendorId,
  belongsToVendor,
  isApprovedVendor,
} from '@/lib/access';
import type { User, Vendor } from '@/payload-types';

describe('Access Control Utilities', () => {
  describe('isAppAdmin / isSuperAdmin', () => {
    it('should return false for null user', () => {
      expect(isAppAdmin(null)).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });

    it('should return true for user with role admin', () => {
      const user: User = {
        id: 'user-123',
        role: 'admin',
      } as User;

      expect(isAppAdmin(user)).toBe(true);
      expect(isSuperAdmin(user)).toBe(true);
    });

    it('should return false for user with role user', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
      } as User;

      expect(isAppAdmin(user)).toBe(false);
    });

    it('should return true for legacy super-admin roles array', () => {
      const user = {
        id: 'user-123',
        role: 'user',
        roles: ['super-admin'],
      } as unknown as User;

      expect(isAppAdmin(user)).toBe(true);
    });
  });

  describe('isAppStaff / isBdo', () => {
    it('should treat BDO as staff but not app-only admin', () => {
      const bdo: User = { id: '1', role: 'bdo' } as User;
      expect(isBdo(bdo)).toBe(true);
      expect(isAppStaff(bdo)).toBe(true);
      expect(isAppAdmin(bdo)).toBe(false);
    });

    it('should treat admin as both staff and app admin', () => {
      const admin: User = { id: '1', role: 'admin' } as User;
      expect(isAppStaff(admin)).toBe(true);
      expect(isAppAdmin(admin)).toBe(true);
    });
  });

  describe('hasVendor', () => {
    it('should return false for null user', () => {
      expect(hasVendor(null)).toBe(false);
      expect(hasVendor(undefined)).toBe(false);
    });

    it('should return true for user with vendor (string ID)', () => {
      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: 'vendor-123',
      } as User;

      expect(hasVendor(user)).toBe(true);
    });

    it('should return true for user with vendor (object)', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: vendor,
      } as User;

      expect(hasVendor(user)).toBe(true);
    });

    it('should return false for user without vendor', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
      } as User;

      expect(hasVendor(user)).toBe(false);
    });
  });

  describe('isVendor', () => {
    it('should return true if user has vendor', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: 'vendor-123',
      } as User;

      expect(isVendor(user)).toBe(true);
    });

    it('should return false if user does not have vendor', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
      } as User;

      expect(isVendor(user)).toBe(false);
    });
  });

  describe('getVendorId', () => {
    it('should return null for null user', () => {
      expect(getVendorId(null)).toBe(null);
      expect(getVendorId(undefined)).toBe(null);
    });

    it('should return vendor ID when vendor is string', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: 'vendor-123',
      } as User;

      expect(getVendorId(user)).toBe('vendor-123');
    });

    it('should return vendor ID when vendor is object', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: vendor,
      } as User;

      expect(getVendorId(user)).toBe('vendor-123');
    });

    it('should return null when user has no vendor', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
      } as User;

      expect(getVendorId(user)).toBe(null);
    });
  });

  describe('belongsToVendor', () => {
    it('should return false for null user', () => {
      expect(belongsToVendor(null, 'vendor-123')).toBe(false);
      expect(belongsToVendor(undefined, 'vendor-123')).toBe(false);
    });

    it('should return true when vendor ID matches (string)', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: 'vendor-123',
      } as User;

      expect(belongsToVendor(user, 'vendor-123')).toBe(true);
    });

    it('should return true when vendor ID matches (object)', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: vendor,
      } as User;

      expect(belongsToVendor(user, 'vendor-123')).toBe(true);
    });

    it('should return false when vendor ID does not match', () => {
      const user: User = {
        id: 'user-123',
        role: 'user',
        vendor: 'vendor-123',
      } as User;

      expect(belongsToVendor(user, 'vendor-456')).toBe(false);
    });
  });

  describe('isApprovedVendor', () => {
    it('should return false for null user', () => {
      expect(isApprovedVendor(null)).toBe(false);
      expect(isApprovedVendor(undefined)).toBe(false);
    });

    it('should return true for approved and active vendor', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        status: 'approved',
        isActive: true,
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: vendor,
      } as User;

      expect(isApprovedVendor(user)).toBe(true);
    });

    it('should return false for pending vendor', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        status: 'pending',
        isActive: true,
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: vendor,
      } as User;

      expect(isApprovedVendor(user)).toBe(false);
    });

    it('should return false for inactive vendor', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        status: 'approved',
        isActive: false,
      } as Vendor;

      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: vendor,
      } as User;

      expect(isApprovedVendor(user)).toBe(false);
    });

    it('should return false when vendor is string ID (cannot check status)', () => {
      const user: User = {
        id: 'user-123',
        role: 'vendor',
        vendor: 'vendor-123',
      } as User;

      expect(isApprovedVendor(user)).toBe(false);
    });
  });
});
