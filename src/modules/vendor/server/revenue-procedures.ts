import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import {
  BULK_REVENUE_MAX_ROWS,
  getClosedOrderRevenueSummary,
  listAllClosedOrderRevenue,
  listClosedOrderRevenue,
  listClosedOrderRevenueForBulkEdit,
} from "@/lib/vendor-revenue/closed-order-revenue";
import { manualRevenueCreateInputSchema } from "@/lib/vendor-revenue/manual-revenue-schema";
import { bulkRevenueRowSchema } from "@/lib/vendor-revenue/revenue-row-validation";
import { createManualRevenueOrder } from "@/modules/orders/create-manual-revenue-order";
import {
  createBulkManualRevenueOrder,
  deleteManualRevenueOrder,
  updateManualRevenueOrder,
} from "@/modules/orders/update-manual-revenue-order";

function getSessionVendorId(ctx: { session: { vendor: string | { id: string } } }): string {
  return typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;
}

export const vendorRevenueRouter = createTRPCRouter({
  summary: vendorProcedure.query(async ({ ctx }) => {
    const vendorId = getSessionVendorId(ctx);
    return getClosedOrderRevenueSummary(ctx.db, vendorId);
  }),

  list: vendorProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      return listClosedOrderRevenue(ctx.db, vendorId, {
        page: input.page,
        limit: input.limit,
        search: input.search,
      });
    }),

  listForBulkEdit: vendorProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      return listClosedOrderRevenueForBulkEdit(ctx.db, vendorId, {
        search: input.search,
      });
    }),

  exportAll: vendorProcedure.query(async ({ ctx }) => {
    const vendorId = getSessionVendorId(ctx);
    return listAllClosedOrderRevenue(ctx.db, vendorId);
  }),

  create: vendorProcedure
    .input(manualRevenueCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);

      try {
        return await createManualRevenueOrder(ctx.db, input, {
          expectedVendorId: vendorId,
        });
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        const message = error instanceof Error ? error.message : "Failed to record revenue";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),

  bulkSave: vendorProcedure
    .input(
      z.object({
        updates: z
          .array(
            bulkRevenueRowSchema.extend({
              id: z.string(),
            }),
          )
          .max(BULK_REVENUE_MAX_ROWS)
          .default([]),
        creates: z.array(bulkRevenueRowSchema).max(BULK_REVENUE_MAX_ROWS).default([]),
        deletes: z.array(z.string()).max(BULK_REVENUE_MAX_ROWS).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);

      try {
        for (const id of input.deletes) {
          await deleteManualRevenueOrder(ctx.db, id, { expectedVendorId: vendorId });
        }

        for (const item of input.updates) {
          await updateManualRevenueOrder(ctx.db, item.id, item, { expectedVendorId: vendorId });
        }

        for (const item of input.creates) {
          await createBulkManualRevenueOrder(ctx.db, item, { expectedVendorId: vendorId });
        }

        return {
          updatedCount: input.updates.length,
          createdCount: input.creates.length,
          deletedCount: input.deletes.length,
        };
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        const message = error instanceof Error ? error.message : "Failed to save revenue changes";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),
});
