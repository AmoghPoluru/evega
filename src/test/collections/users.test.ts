import { describe, it, expect } from 'vitest';
import { Users } from '@/collections/Users';

/**
 * Unit tests for Users collection
 * Tests collection configuration
 * 
 * Note: Users collection uses Payload's default auth access control,
 * so we primarily test configuration rather than custom access rules.
 */

describe('Users Collection', () => {
  describe('Collection Configuration', () => {
    it('should have correct slug', () => {
      expect(Users.slug).toBe('users');
    });

    it('should have admin configuration', () => {
      expect(Users.admin).toBeDefined();
      expect(Users.admin?.useAsTitle).toBe('email');
    });

    it('should have auth enabled', () => {
      expect(Users.auth).toBe(true);
    });

    it('should have hooks defined', () => {
      expect(Users.hooks).toBeDefined();
      expect(Users.hooks?.beforeValidate).toBeDefined();
      expect(Users.hooks?.beforeChange).toBeDefined();
    });
  });

  describe('Fields', () => {
    it('should have required user fields', () => {
      const fieldNames = Users.fields?.map((field) => 
        typeof field === 'object' && 'name' in field ? field.name : null
      ).filter(Boolean);

      // Check for key fields
      expect(fieldNames).toContain('username');
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('vendor');
      expect(fieldNames).toContain('vendorRole');
      expect(fieldNames).toContain('appRole');
    });
  });
});
