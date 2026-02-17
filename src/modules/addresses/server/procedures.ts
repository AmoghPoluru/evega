import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  isDefault: z.boolean().optional().default(false),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zipcode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
});

export const addressesRouter = createTRPCRouter({
  getUserAddresses: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.findByID({
      collection: "users",
      id: ctx.session.user.id,
    });

    return {
      shippingAddresses: user.shippingAddresses || [],
    };
  }),

  addAddress: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.findByID({
        collection: "users",
        id: ctx.session.user.id,
      });

      const existingAddresses = user.shippingAddresses || [];

      // If this is set as default, unset all other defaults
      if (input.isDefault) {
        existingAddresses.forEach((addr: any) => {
          addr.isDefault = false;
        });
      }

      // If this is the first address, make it default
      const newAddress = {
        ...input,
        id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isDefault: existingAddresses.length === 0 ? true : input.isDefault,
      };

      await ctx.db.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          shippingAddresses: [...existingAddresses, newAddress],
        },
      });

      return { success: true };
    }),

  updateAddress: protectedProcedure
    .input(
      z.object({
        addressId: z.string(),
        address: addressSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.findByID({
        collection: "users",
        id: ctx.session.user.id,
      });

      const existingAddresses = (user.shippingAddresses || []) as any[];
      const addressIndex = existingAddresses.findIndex(
        (addr) => addr.id === input.addressId
      );

      if (addressIndex === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If this is set as default, unset all other defaults
      if (input.address.isDefault) {
        existingAddresses.forEach((addr: any, index: number) => {
          if (index !== addressIndex) {
            addr.isDefault = false;
          }
        });
      }

      existingAddresses[addressIndex] = {
        ...input.address,
        id: input.addressId,
      };

      await ctx.db.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          shippingAddresses: existingAddresses,
        },
      });

      return { success: true };
    }),

  deleteAddress: protectedProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.findByID({
        collection: "users",
        id: ctx.session.user.id,
      });

      const existingAddresses = (user.shippingAddresses || []) as any[];
      const filteredAddresses = existingAddresses.filter(
        (addr) => addr.id !== input.addressId
      );

      await ctx.db.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          shippingAddresses: filteredAddresses,
        },
      });

      return { success: true };
    }),

  setDefaultAddress: protectedProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.findByID({
        collection: "users",
        id: ctx.session.user.id,
      });

      const existingAddresses = (user.shippingAddresses || []) as any[];
      const updatedAddresses = existingAddresses.map((addr: any) => ({
        ...addr,
        isDefault: addr.id === input.addressId,
      }));

      await ctx.db.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          shippingAddresses: updatedAddresses,
        },
      });

      return { success: true };
    }),
});
