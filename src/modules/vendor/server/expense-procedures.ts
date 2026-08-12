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

const BULK_EDIT_MAX_ROWS = 500;

async function listVendorExpenses(
  db: Payload,
  vendorId: string,
  input: {
    category?: "all" | (typeof VENDOR_EXPENSE_CATEGORIES)[number]["id"];
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  const andClauses: Where[] = [{ vendor: { equals: vendorId } }];
  const category = input.category ?? "all";

  if (category !== "all") {
    andClauses.push({ category: { equals: category } });
  }

  if (input.search?.trim()) {
    andClauses.push({ description: { contains: input.search.trim() } });
  }

  const where: Where = andClauses.length === 1 ? andClauses[0]! : { and: andClauses };

  const result = await db.find({
    collection: "vendor-expenses",
    where,
    page: input.page ?? 1,
    limit: input.limit ?? 20,
    sort: "-expenseDate",
    depth: 0,
  });

  return {
    docs: result.docs.map((doc: VendorExpense) => formatExpense(doc)),
    totalDocs: result.totalDocs,
    page: result.page ?? input.page ?? 1,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

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
      return listVendorExpenses(ctx.db, vendorId, input);
    }),

  listForBulkEdit: vendorProcedure
    .input(
      z.object({
        category: vendorExpenseCategorySchema.or(z.literal("all")).optional().default("all"),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);
      const result = await listVendorExpenses(ctx.db, vendorId, {
        ...input,
        page: 1,
        limit: BULK_EDIT_MAX_ROWS,
      });

      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        truncated: result.totalDocs > BULK_EDIT_MAX_ROWS,
        maxRows: BULK_EDIT_MAX_ROWS,
      };
    }),

  exportAll: vendorProcedure.query(async ({ ctx }) => {
    const vendorId = getSessionVendorId(ctx);
    const result = await ctx.db.find({
      collection: "vendor-expenses",
      where: { vendor: { equals: vendorId } },
      limit: 5000,
      sort: "-expenseDate",
      depth: 0,
    });

    return result.docs.map((doc: VendorExpense) => formatExpense(doc));
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

  bulkSave: vendorProcedure
    .input(
      z.object({
        updates: z
          .array(
            expenseInputSchema.extend({
              id: z.string(),
            }),
          )
          .max(BULK_EDIT_MAX_ROWS)
          .default([]),
        creates: z.array(expenseInputSchema).max(BULK_EDIT_MAX_ROWS).default([]),
        deletes: z.array(z.string()).max(BULK_EDIT_MAX_ROWS).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendorId = getSessionVendorId(ctx);

      for (const id of input.deletes) {
        await assertVendorOwnsExpense(ctx.db, id, vendorId);
      }

      for (const item of input.updates) {
        await assertVendorOwnsExpense(ctx.db, item.id, vendorId);
      }

      for (const id of input.deletes) {
        await ctx.db.delete({
          collection: "vendor-expenses",
          id,
        });
      }

      const updated = [];
      for (const item of input.updates) {
        const doc = await ctx.db.update({
          collection: "vendor-expenses",
          id: item.id,
          data: {
            category: item.category,
            expenseDate: item.expenseDate,
            amount: item.amount,
            description: item.description,
          },
        });
        updated.push(formatExpense(doc as VendorExpense));
      }

      const created = [];
      for (const item of input.creates) {
        const doc = await ctx.db.create({
          collection: "vendor-expenses",
          data: {
            vendor: vendorId,
            category: item.category,
            expenseDate: item.expenseDate,
            amount: item.amount,
            description: item.description,
          },
        });
        created.push(formatExpense(doc as VendorExpense));
      }

      return {
        updatedCount: updated.length,
        createdCount: created.length,
        deletedCount: input.deletes.length,
      };
    }),
});
