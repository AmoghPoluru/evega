import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { authRouter } from '@/modules/auth/server/procedures';
import { createMockTRPCContext } from '../utils/trpc-test-utils';
import type { User } from '@/payload-types';

/**
 * Unit tests for Auth tRPC procedures
 */

describe('Auth tRPC Router', () => {
  describe('session', () => {
    it('should return session for authenticated user', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockPayload = {
        auth: vi.fn().mockResolvedValue({
          user: mockUser,
        }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      const result = await caller.session();

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(mockPayload.auth).toHaveBeenCalled();
    });

    it('should return null user for unauthenticated session', async () => {
      const mockPayload = {
        auth: vi.fn().mockResolvedValue({
          user: null,
        }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      const result = await caller.session();

      expect(result.user).toBeNull();
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const mockPayload = {
        find: vi.fn()
          .mockResolvedValueOnce({ docs: [] }) // Username check
          .mockResolvedValueOnce({ docs: [] }), // Email check
        create: vi.fn().mockResolvedValue({
          id: 'user-123',
          email: 'newuser@example.com',
          username: 'newuser',
        }),
        login: vi.fn().mockResolvedValue({
          token: 'mock-token',
          user: {
            id: 'user-123',
            email: 'newuser@example.com',
          },
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      await caller.register({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      });

      expect(mockPayload.find).toHaveBeenCalledTimes(2);
      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'users',
        data: expect.objectContaining({
          email: 'newuser@example.com',
          username: 'newuser',
        }),
      });
      expect(mockPayload.login).toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      const mockPayload = {
        find: vi.fn().mockResolvedValue({
          docs: [{ id: 'existing-user', username: 'existinguser' }],
        }),
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      await expect(
        caller.register({
          email: 'newuser@example.com',
          username: 'existinguser',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw error if email already exists', async () => {
      const mockPayload = {
        find: vi.fn()
          .mockResolvedValueOnce({ docs: [] }) // Username check passes
          .mockResolvedValueOnce({
            docs: [{ id: 'existing-user', email: 'existing@example.com' }],
          }), // Email check fails
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      await expect(
        caller.register({
          email: 'existing@example.com',
          username: 'newuser',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockPayload = {
        login: vi.fn().mockResolvedValue({
          token: 'mock-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        }),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      const result = await caller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.token).toBe('mock-token');
      expect(mockPayload.login).toHaveBeenCalledWith({
        collection: 'users',
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
    });

    it('should throw error for invalid credentials', async () => {
      const mockPayload = {
        login: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockPayload = {
        config: {
          cookiePrefix: 'payload-token',
        },
      };

      const ctx = createMockTRPCContext({
        db: mockPayload as any,
      });

      const caller = authRouter.createCaller(ctx as any);

      const result = await caller.logout();

      expect(result).toEqual({ success: true });
    });
  });
});
