import { TRPCError } from '@trpc/server';
import type { BasePayload } from 'payload';
import type { ManualOrderCreateInput } from './manual-order-schema';

type ProductVariant = {
  stock?: number | null;
  size?: string | null;
  color?: string | null;
  blouseSize?: string | null;
  variantData?: Record<string, unknown> | null;
};

type ProductDoc = {
  id: string;
  name: string;
  vendor?: string | { id?: string } | null;
  variants?: ProductVariant[] | null;
  stock?: number | null;
  isPrivate?: boolean | null;
};

function getVendorIdFromProduct(product: ProductDoc): string | null {
  if (!product.vendor) return null;
  if (typeof product.vendor === 'string') return product.vendor;
  return product.vendor.id ?? null;
}

function findMatchingVariant(
  product: ProductDoc,
  size?: string,
  color?: string,
): ProductVariant | null {
  if (!product.variants?.length) return null;

  return (
    product.variants.find((v) => {
      const variantData = v.variantData || {};
      const sizeMatch =
        !size ||
        variantData.size === size ||
        variantData.blouseSize === size ||
        v.size === size ||
        v.blouseSize === size;
      const colorMatch = !color || variantData.color === color || v.color === color;
      return sizeMatch && colorMatch;
    }) ?? null
  );
}

async function decrementProductStock(
  db: BasePayload,
  product: ProductDoc,
  input: Pick<ManualOrderCreateInput, 'productId' | 'quantity' | 'size' | 'color'>,
  overrideAccess: boolean,
): Promise<void> {
  const variant = findMatchingVariant(product, input.size, input.color);

  if (variant) {
    if ((variant.stock ?? 0) < input.quantity) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Insufficient stock. Only ${variant.stock} units available for this variant.`,
      });
    }

    const newStock = Math.max(0, (variant.stock ?? 0) - input.quantity);
    const updatedVariants = (product.variants ?? []).map((v) => {
      const variantData = v.variantData || {};
      const sizeMatch =
        !input.size ||
        variantData.size === input.size ||
        variantData.blouseSize === input.size ||
        v.size === input.size ||
        v.blouseSize === input.size;
      const colorMatch =
        !input.color || variantData.color === input.color || v.color === input.color;

      if (sizeMatch && colorMatch) {
        return { ...v, stock: newStock };
      }
      return v;
    });

    await db.update({
      collection: 'products',
      id: input.productId,
      data: { variants: updatedVariants },
      overrideAccess,
    } as never);

    const updatedProduct = (await db.findByID({
      collection: 'products',
      id: input.productId,
      depth: 0,
      overrideAccess,
    })) as ProductDoc;

    let totalStock = 0;
    if (updatedProduct.variants?.length) {
      totalStock = updatedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }

    if (totalStock === 0 && updatedProduct.isPrivate === false) {
      await db.update({
        collection: 'products',
        id: input.productId,
        data: { isPrivate: true },
        overrideAccess,
      } as never);
    }
    return;
  }

  if (product.variants?.length) {
    console.warn(
      `[Manual Order] Variant not found for ${product.name}${input.size ? ` (${input.size})` : ''}${input.color ? ` - ${input.color}` : ''}, skipping stock update`,
    );
    return;
  }

  if (product.stock === undefined || product.stock === null) return;

  if (product.stock < input.quantity) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Insufficient stock. Only ${product.stock} units available.`,
    });
  }

  const newStock = Math.max(0, product.stock - input.quantity);
  await db.update({
    collection: 'products',
    id: input.productId,
    data: { stock: newStock },
    overrideAccess,
  } as never);

  if (newStock === 0 && product.isPrivate === false) {
    await db.update({
      collection: 'products',
      id: input.productId,
      data: { isPrivate: true },
      overrideAccess,
    } as never);
  }
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

  await decrementProductStock(db, product, input, overrideAccess);

  const existingUsers = await db.find({
    collection: 'users',
    where: { email: { equals: input.customerEmail } },
    limit: 1,
    overrideAccess,
  });

  let user: { id: string } | undefined = existingUsers.docs[0];
  if (!user) {
    const randomPassword =
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-12) +
      'A1!';
    user = await db.create({
      collection: 'users',
      data: {
        email: input.customerEmail,
        name: input.customerName || input.customerEmail.split('@')[0],
        password: randomPassword,
      },
      overrideAccess,
    } as never);
  }

  if (!user) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to resolve customer user' });
  }

  const total = input.price * input.quantity;
  const orderName =
    input.size || input.color
      ? `Order for ${product.name}${input.size ? ` (${input.size})` : ''}${input.color ? ` - ${input.color}` : ''}`
      : `Order for ${product.name}`;

  const order = await db.create({
    collection: 'orders',
    data: {
      name: orderName,
      user: user.id,
      vendor: productVendorId,
      product: input.productId,
      quantity: input.quantity,
      size: input.size || undefined,
      color: input.color || undefined,
      total,
      status: input.status,
      paymentMethod: input.paymentMethod,
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

  return {
    id: order.id,
    orderNumber: (order as { orderNumber?: string | null }).orderNumber ?? null,
  };
}
