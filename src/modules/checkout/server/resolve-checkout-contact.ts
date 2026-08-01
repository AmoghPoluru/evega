import type { Payload } from "payload";
import { TRPCError } from "@trpc/server";

import type { User } from "@/payload-types";
import {
  guestEmailSchema,
  guestShippingAddressSchema,
  type GuestShippingAddress,
} from "@/modules/checkout/guest-checkout-schema";

export type ResolvedCheckoutContact = {
  shippingAddress: GuestShippingAddress;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  userId?: string;
  guestEmail?: string;
  isGuest: boolean;
};

type ResolveCheckoutContactInput = {
  guestEmail?: string;
  guestShippingAddress?: GuestShippingAddress;
  customerPhone?: string;
};

export async function resolveCheckoutContact(
  db: Payload,
  user: User | null | undefined,
  input: ResolveCheckoutContactInput
): Promise<ResolvedCheckoutContact> {
  if (user) {
    const fullUser = await db.findByID({
      collection: "users",
      id: user.id,
      depth: 0,
    });

    if (!fullUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const userAddresses = fullUser.shippingAddresses || [];
    const defaultAddress =
      userAddresses.find((addr) => addr.isDefault) || userAddresses[0];

    if (!defaultAddress) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Shipping address is required. Please add a shipping address before placing your order.",
      });
    }

    const phone =
      input.customerPhone?.trim() || defaultAddress.phone || "";

    return {
      shippingAddress: {
        fullName: defaultAddress.fullName,
        phone: phone || defaultAddress.phone || "",
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipcode: defaultAddress.zipcode,
        country: "United States",
      },
      customerEmail: fullUser.email,
      customerName: fullUser.name || fullUser.email || "Customer",
      customerPhone: phone,
      userId: user.id,
      isGuest: false,
    };
  }

  const guestEmailResult = guestEmailSchema.safeParse(input.guestEmail);
  const guestAddressResult = guestShippingAddressSchema.safeParse(
    input.guestShippingAddress
  );

  if (!guestEmailResult.success || !guestAddressResult.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Guest checkout requires email and a complete shipping address.",
    });
  }

  const guestAddress = guestAddressResult.data;

  return {
    shippingAddress: guestAddress,
    customerEmail: guestEmailResult.data,
    customerName: guestAddress.fullName,
    customerPhone: guestAddress.phone,
    guestEmail: guestEmailResult.data,
    isGuest: true,
  };
}
