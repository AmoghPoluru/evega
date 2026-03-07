import { describe, it, expect } from 'vitest';
import {
  isSuperAdmin,
  isVendor,
  hasVendor,
  getVendorId,
  belongsToVendor,
  isApprovedVendor,
} from '@/lib/access';
import type { User, Role, Vendor } from '@/payload-types';

/**
 * Unit tests for access control utility functions
 */

describe('Access Control Utilities', () => {
  describe('isSuperAdmin', () => {
    it('should return false for null user', () => {
      expect(isSuperAdmin(null)).toBe(false);
      expect(isSuperAdmin(undefined)).toBe(false);
    });

    it('should return true for user with app-admin role', () => {
      const role: Role = {
        id: 'role-123',
        slug: 'app-admin',
        name: 'App Admin',
      } as Role;

      const user: User = {
        id: 'user-123',
        appRole: role,
      } as User;

      expect(isSuperAdmin(user)).toBe(true);
    });

    it('should return false for user without app-admin role', () => {
      const role: Role = {
        id: 'role-123',
        slug: 'customer',
        name: 'Customer',
      } as Role;

      const user: User = {
        id: 'user-123',
        appRole: role,
      } as User;

      expect(isSuperAdmin(user)).toBe(false);
    });

    it('should return true for user with legacy super-admin role', () => {
      const user: User = {
        id: 'user-123',
        roles: ['super-admin'],
      } as User;

      expect(isSuperAdmin(user)).toBe(true);
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
        vendor: vendor,
      } as User;

      expect(hasVendor(user)).toBe(true);
    });

    it('should return false for user without vendor', () => {
      const user: User = {
        id: 'user-123',
      } as User;

      expect(hasVendor(user)).toBe(false);
    });
  });

  describe('isVendor', () => {
    it('should return true if user has vendor', () => {
      const user: User = {
        id: 'user-123',
        vendor: 'vendor-123',
      } as User;

      expect(isVendor(user)).toBe(true);
    });

    it('should return false if user does not have vendor', () => {
      const user: User = {
        id: 'user-123',
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
        vendor: vendor,
      } as User;

      expect(getVendorId(user)).toBe('vendor-123');
    });

    it('should return null when user has no vendor', () => {
      const user: User = {
        id: 'user-123',
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
        vendor: vendor,
      } as User;

      expect(belongsToVendor(user, 'vendor-123')).toBe(true);
    });

    it('should return false when vendor ID does not match', () => {
      const user: User = {
        id: 'user-123',
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
        vendor: vendor,
      } as User;

      expect(isApprovedVendor(user)).toBe(false);
    });

    it('should return false when vendor is string ID (cannot check status)', () => {
      const user: User = {
        id: 'user-123',
        vendor: 'vendor-123',
      } as User;

      // When vendor is just an ID, we can't check status
      expect(isApprovedVendor(user)).toBe(false);
    });
  });
});
