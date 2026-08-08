import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Payload, Where } from "payload";
import { createTRPCRouter, vendorProcedure } from "@/trpc/init";
import {
  getVendorExpenseCategoryLabel,
  vendorExpenseCategorySchema,
  VENDOR_EXPENSE_CATEGORIES,
} from "@/lib/vendor-expenses/categories";
import type { VendorExpense } from "@/payload-types";

function getSessionVendorId(ctx: { session: { vendor: string | { id: string } } }): string {
  return typeof ctx.session.vendor === "string" ? ctx.session.vendor : ctx.session.vendor.id;
}

const expenseInputSchema = z.object({
  category: vendorExpenseCategorySchema,
  expenseDate: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().trim().min(1, "Description is required").max(500),
});

function formatExpense(doc: VendorExpense) {
  return {
    id: doc.id,
    category: doc.category,
    categoryLabel: getVendorExpenseCategoryLabel(doc.category),
    expenseDate: doc.expenseDate,
    amount: doc.amount,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function assertVendorOwnsExpense(
  db: Payload,
  expenseId: string,
  vendorId: string,
): Promise<VendorExpense> {
  const doc = await db
    .findByID({
      collection: "vendor-expenses",
      id: expenseId,
      depth: 0,
    })
    .catch(() => null);

  if (!doc) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
  }

  const expenseVendorId =
    typeof doc.vendor === "string" ? doc.vendor : doc.vendor?.id ?? null;

  if (expenseVendorId !== vendorId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Expense not found" });
  }

  return doc as VendorExpense;
}

export const vendorExpenseRouter = createTRPCRouter({
  categories: vendorProcedure.query(() => VENDOR_EXPENSE_CATEGORIES),

  list: vendorProcedure
    .input(
      z.object({
        category: vendorExpenseCategorySchema.or(z.literal("all")).optional().default("all"),
        search: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      const andClauses: Where[] = [{ vendor: { equals: vendorId } }];

      if (input.category !== "all") {
        andClauses.push({ category: { equals: input.category } });
      }

      if (input.search?.trim()) {
        andClauses.push({ description: { contains: input.search.trim() } });
      }

      const where: Where = andClauses.length === 1 ? andClauses[0]! : { and: andClauses };

      const result = await ctx.db.find({
        collection: "vendor-expenses",
        where,
        page: input.page,
        limit: input.limit,
        sort: "-expenseDate",
        depth: 0,
      });

      return {
        docs: result.docs.map((doc: VendorExpense) => formatExpense(doc)),
        totalDocs: result.totalDocs,
        page: result.page ?? input.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    }),

  summary: vendorProcedure
    .input(
      z
        .object({
          category: vendorExpenseCategorySchema.or(z.literal("all")).optional().default("all"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      const category = input?.category ?? "all";

      const where: Where =
        category === "all"
          ? { vendor: { equals: vendorId } }
          : {
              and: [{ vendor: { equals: vendorId } }, { category: { equals: category } }],
            };

      const result = await ctx.db.find({
        collection: "vendor-expenses",
        where,
        limit: 5000,
        depth: 0,
      });

      const docs = result.docs as VendorExpense[];
      const totalAmount = docs.reduce((sum, doc) => sum + (doc.amount ?? 0), 0);

      const byCategory = VENDOR_EXPENSE_CATEGORIES.map((item) => {
        const categoryDocs = docs.filter((doc) => doc.category === item.id);
        const categoryTotal = categoryDocs.reduce((sum, doc) => sum + (doc.amount ?? 0), 0);
        return {
          category: item.id,
          label: item.label,
          total: categoryTotal,
          count: categoryDocs.length,
        };
      }).filter((item) => item.count > 0);

      return {
        totalAmount,
        count: docs.length,
        byCategory,
      };
    }),

  create: vendorProcedure.input(expenseInputSchema).mutation(async ({ ctx, input }) => {
    const vendorId = getSessionVendorId(ctx);

    const created = await ctx.db.create({
      collection: "vendor-expenses",
      data: {
        vendor: vendorId,
        category: input.category,
        expenseDate: input.expenseDate,
        amount: input.amount,
        description: input.description,
      },
    });

    return formatExpense(created as VendorExpense);
  }),

  update: vendorProcedure
    .input(
      expenseInputSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      await assertVendorOwnsExpense(ctx.db, input.id, vendorId);

      const updated = await ctx.db.update({
        collection: "vendor-expenses",
        id: input.id,
        data: {
          category: input.category,
          expenseDate: input.expenseDate,
          amount: input.amount,
          description: input.description,
        },
      });

      return formatExpense(updated as VendorExpense);
    }),

  delete: vendorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      await assertVendorOwnsExpense(ctx.db, input.id, vendorId);

      await ctx.db.delete({
        collection: "vendor-expenses",
        id: input.id,
      });

      return { success: true };
    }),
});
