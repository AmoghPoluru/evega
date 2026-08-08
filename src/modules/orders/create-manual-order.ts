import { TRPCError } from '@trpc/server';
import type { BasePayload } from 'payload';

import { decrementStockForOrder } from '@/lib/inventory/adjust-product-stock';
import {
  refreshCustomerStats,
  upsertVendorCustomer,
} from '@/lib/customers/upsert-vendor-customer';

import type { ManualOrderCreateInput } from './manual-order-schema';

type ProductDoc = {
  id: string;
  name: string;
  vendor?: string | { id?: string } | null;
};

function getVendorIdFromProduct(product: ProductDoc): string | null {
  if (!product.vendor) return null;
  if (typeof product.vendor === 'string') return product.vendor;
  return product.vendor.id ?? null;
}

export async function createManualOrder(
  db: BasePayload,
  input: ManualOrderCreateInput,
  options: { expectedVendorId?: string; overrideAccess?: boolean } = {},
): Promise<{ id: string; orderNumber?: string | null }> {
  const overrideAccess = options.overrideAccess ?? false;

  const product = (await db.findByID({
    collection: 'products',
    id: input.productId,
    depth: 0,
    overrideAccess,
  })) as ProductDoc;

  const productVendorId = getVendorIdFromProduct(product);
  if (!productVendorId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Product has no vendor assigned' });
  }

  if (options.expectedVendorId && productVendorId !== options.expectedVendorId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Product does not belong to the selected vendor',
    });
  }

  await decrementStockForOrder(db, {
    productId: input.productId,
    quantity: input.quantity,
    size: input.size,
    color: input.color,
    overrideAccess,
  });

  const existingUsers = await db.find({
    collection: 'users',
    where: { email: { equals: input.customerEmail.toLowerCase() } },
    limit: 1,
    overrideAccess,
  });

  const loggedInUserId = existingUsers.docs[0]?.id;

  const total = input.price * input.quantity;
  const orderName =
    input.size || input.color
      ? `Order for ${product.name}${input.size ? ` (${input.size})` : ''}${input.color ? ` - ${input.color}` : ''}`
      : `Order for ${product.name}`;

  const order = await db.create({
    collection: 'orders',
    data: {
      name: orderName,
      user: loggedInUserId,
      vendor: productVendorId,
      product: input.productId,
      quantity: input.quantity,
      size: input.size || undefined,
      color: input.color || undefined,
      total,
      status: input.status,
      paymentMethod: input.paymentMethod,
      orderSource: 'manual',
      inventoryAdjusted: 'deducted',
      shippingAddress: {
        fullName: input.shippingAddress.fullName,
        street: input.shippingAddress.street,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        zipcode: input.shippingAddress.zipcode,
        country: input.shippingAddress.country || 'United States',
        phone: input.shippingAddress.phone || undefined,
      },
    },
    overrideAccess,
  } as never);

  const { customerId } = await upsertVendorCustomer(
    db,
    {
      vendorId: productVendorId,
      name: input.customerName || input.customerEmail.split('@')[0],
      email: input.customerEmail,
      phone: input.shippingAddress.phone,
    },
    { overrideAccess },
  );

  await refreshCustomerStats(db, customerId, { overrideAccess });

  return {
    id: order.id,
    orderNumber: (order as { orderNumber?: string | null }).orderNumber ?? null,
  };
}
