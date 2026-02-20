import { initTRPC, TRPCError } from '@trpc/server';
import { getPayload } from 'payload';
import config from "@payload-config";
import superjson from "superjson";
// @ts-expect-error - Next.js headers module works at runtime with NodeNext resolution
import { headers as getHeaders } from 'next/headers';

import { cache } from 'react';
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   * Creates the base context for tRPC calls
   * The procedures will extend this context with db, session, etc.
   */
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  
  return {
    db: payload,
    headers,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Use db from context if available, otherwise create new instance
  const db = ctx.db || await getPayload({ config });

  return next({ ctx: { ...ctx, db } });
});

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // Use headers from context if available, otherwise get them
  const headers = ctx.headers || await getHeaders();
  const session = await ctx.db.auth({ headers });

  if (!session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...session,
        user: session.user,
      },
    },
  });
});

/**
 * Vendor procedure - requires user to be authenticated AND have an approved, active vendor
 * Use this for vendor admin operations (managing products, orders, dashboard, etc.)
 */
export const vendorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = ctx.session.user;
  
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  // Check if user has a vendor
  if (!user.vendor) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Vendor account required. Please register as a vendor first.",
    });
  }

  // Fetch vendor to check status and isActive
  const vendorId = typeof user.vendor === "string" ? user.vendor : user.vendor.id;
  const vendor = await ctx.db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });

  // Check if vendor is approved and active
  if (vendor.status !== "approved" || !vendor.isActive) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: vendor.status === "pending"
        ? "Your vendor application is pending approval. Please wait for admin approval."
        : vendor.status === "rejected"
        ? "Your vendor application was rejected. Please contact support."
        : vendor.status === "suspended"
        ? "Your vendor account has been suspended. Please contact support."
        : "Vendor account is not active. Please contact support.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        vendor: vendor,
      },
    },
  });
});
