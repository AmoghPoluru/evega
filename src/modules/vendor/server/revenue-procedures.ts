import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import {
  getClosedOrderRevenueSummary,
  listClosedOrderRevenue,
} from "@/lib/vendor-revenue/closed-order-revenue";
import { manualRevenueCreateInputSchema } from "@/lib/vendor-revenue/manual-revenue-schema";
import { createManualRevenueOrder } from "@/modules/orders/create-manual-revenue-order";

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
});
