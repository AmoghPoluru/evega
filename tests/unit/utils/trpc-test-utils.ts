import type { TRPCContext } from '@/trpc/init';
import type { Payload } from 'payload';
import { createMockPayload } from './payload-test-utils';
import { vi } from 'vitest';

/**
 * Test utilities for tRPC
 * Provides helpers for creating test contexts and calling procedures
 */

/**
 * Create a mock tRPC context for testing
 */
export function createMockTRPCContext(
  overrides?: Partial<TRPCContext>
): TRPCContext {
  const mockPayload = createMockPayload() as Payload;
  const mockHeaders = new Headers();

  return {
    db: mockPayload,
    headers: mockHeaders,
    session: undefined,
    ...overrides,
  } as TRPCContext;
}

/**
 * Create a mock tRPC context with authenticated user
 */
export function createAuthenticatedContext(
  user: { id: string; email: string; role?: string; vendor?: string | { id: string } },
  overrides?: Partial<TRPCContext>
): TRPCContext {
  const mockPayload = createMockPayload() as Payload;
  const mockHeaders = new Headers();

  return {
    db: mockPayload,
    headers: mockHeaders,
    session: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'customer',
        vendor: user.vendor,
      } as any,
      token: 'mock-token',
      exp: Date.now() + 3600000,
    },
    ...overrides,
  } as TRPCContext;
}

/**
 * Create a mock tRPC context with authenticated user (for protectedProcedure)
 */
export function createProtectedContext(
  user: { id: string; email: string; [key: string]: any },
  payload?: Payload | Partial<Payload>,
  overrides?: Partial<TRPCContext>
): TRPCContext {
  const mockPayload = (payload || createMockPayload()) as Payload;
  const mockHeaders = new Headers();

  // Ensure auth method exists and returns session
  if (mockPayload && typeof mockPayload === 'object' && 'auth' in mockPayload) {
    if (typeof mockPayload.auth !== 'function') {
      (mockPayload as any).auth = vi.fn().mockResolvedValue({
        user: user as any,
        token: 'mock-token',
        exp: Date.now() + 3600000,
      });
    }
  }

  return {
    db: mockPayload,
    headers: mockHeaders,
    session: {
      user: user as any,
      token: 'mock-token',
      exp: Date.now() + 3600000,
    },
    ...overrides,
  } as TRPCContext;
}

/**
 * Create a mock tRPC context with vendor user
 */
export function createVendorContext(
  user: { id: string; email: string; vendorId: string },
  vendor: { id: string; status: string; isActive: boolean },
  overrides?: Partial<TRPCContext>
): TRPCContext {
  const mockPayload = createMockPayload() as Payload;
  const mockHeaders = new Headers();

  return {
    db: mockPayload,
    headers: mockHeaders,
    session: {
      user: {
        id: user.id,
        email: user.email,
        role: 'vendor',
        vendor: user.vendorId,
      } as any,
      token: 'mock-token',
      exp: Date.now() + 3600000,
      vendor: vendor as any,
    },
    ...overrides,
  } as TRPCContext;
}

/**
 * Helper to call a tRPC procedure in tests
 */
export async function callProcedure<T>(
  procedure: any,
  input: unknown,
  context?: TRPCContext
): Promise<T> {
  const ctx = context || createMockTRPCContext();
  return procedure.query({ ctx, input });
}
