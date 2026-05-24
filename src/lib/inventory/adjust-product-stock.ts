import { TRPCError } from '@trpc/server';
import type { BasePayload } from 'payload';

import type {
  ProductInventoryDoc,
  ProductVariantRow,
  StockAdjustmentInput,
  StockAdjustmentResult,
} from './types';

export function findMatchingVariant(
  product: ProductInventoryDoc,
  size?: string | null,
  color?: string | null,
): ProductVariantRow | null {
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

export function variantMatchesSelection(
  v: ProductVariantRow,
  size?: string | null,
  color?: string | null,
): boolean {
  const variantData = v.variantData || {};
  const sizeMatch =
    !size ||
    variantData.size === size ||
    variantData.blouseSize === size ||
    v.size === size ||
    v.blouseSize === size;
  const colorMatch = !color || variantData.color === color || v.color === color;
  return sizeMatch && colorMatch;
}

export function getTotalVariantStock(product: ProductInventoryDoc): number {
  if (!product.variants?.length) return 0;
  return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

async function loadProduct(
  db: BasePayload,
  productId: string,
  overrideAccess: boolean,
): Promise<ProductInventoryDoc> {
  return (await db.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    overrideAccess,
  })) as ProductInventoryDoc;
}

async function applyProductVisibility(
  db: BasePayload,
  productId: string,
  product: ProductInventoryDoc,
  overrideAccess: boolean,
): Promise<void> {
  const totalStock = product.variants?.length
    ? getTotalVariantStock(product)
    : (product.stock ?? 0);

  if (totalStock === 0 && product.isPrivate === false) {
    await db.update({
      collection: 'products',
      id: productId,
      data: { isPrivate: true },
      overrideAccess,
    } as never);
    return;
  }

  if (totalStock > 0 && product.isPrivate === true) {
    await db.update({
      collection: 'products',
      id: productId,
      data: { isPrivate: false },
      overrideAccess,
    } as never);
  }
}

async function updateVariantStock(
  db: BasePayload,
  product: ProductInventoryDoc,
  input: StockAdjustmentInput,
  delta: number,
): Promise<StockAdjustmentResult> {
  const variant = findMatchingVariant(product, input.size, input.color);
  if (!variant) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `No matching variant found for this product${input.size ? ` (size: ${input.size})` : ''}${input.color ? ` (color: ${input.color})` : ''}.`,
    });
  }

  const previousStock = variant.stock ?? 0;
  const newStock = previousStock + delta;

  if (delta < 0 && previousStock < input.quantity) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Insufficient stock. Only ${previousStock} units available for this variant.`,
    });
  }

  if (newStock < 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stock cannot be negative.',
    });
  }

  const updatedVariants = (product.variants ?? []).map((v) => {
    if (variantMatchesSelection(v, input.size, input.color)) {
      return { ...v, stock: newStock };
    }
    return v;
  });

  const overrideAccess = resolveOverrideAccess(input);

  await db.update({
    collection: 'products',
    id: input.productId,
    data: { variants: updatedVariants },
    overrideAccess,
  } as never);

  const updatedProduct = await loadProduct(db, input.productId, overrideAccess);
  await applyProductVisibility(db, input.productId, updatedProduct, overrideAccess);

  return {
    productId: input.productId,
    previousStock,
    newStock,
    adjustedVariant: true,
  };
}

async function updateBaseStock(
  db: BasePayload,
  product: ProductInventoryDoc,
  input: StockAdjustmentInput,
  delta: number,
): Promise<StockAdjustmentResult> {
  if (product.stock === undefined || product.stock === null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Product has no stock field configured.',
    });
  }

  const previousStock = product.stock;
  const newStock = previousStock + delta;

  if (delta < 0 && previousStock < input.quantity) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Insufficient stock. Only ${previousStock} units available.`,
    });
  }

  if (newStock < 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stock cannot be negative.',
    });
  }

  const overrideAccess = resolveOverrideAccess(input);

  await db.update({
    collection: 'products',
    id: input.productId,
    data: { stock: newStock },
    overrideAccess,
  } as never);

  const updatedProduct = await loadProduct(db, input.productId, overrideAccess);
  await applyProductVisibility(db, input.productId, updatedProduct, overrideAccess);

  return {
    productId: input.productId,
    previousStock,
    newStock,
    adjustedVariant: false,
  };
}

/**
 * Decrements product or variant stock when an order is placed.
 */
function resolveOverrideAccess(input: StockAdjustmentInput): boolean {
  // Inventory updates run from trusted server code (checkout, manual orders, hooks).
  // Customers cannot update products via collection access rules.
  return input.overrideAccess ?? true;
}

export async function decrementStockForOrder(
  db: BasePayload,
  input: StockAdjustmentInput,
): Promise<StockAdjustmentResult> {
  const overrideAccess = resolveOverrideAccess(input);
  const product = await loadProduct(db, input.productId, overrideAccess);
  const quantity = input.quantity;

  if (quantity < 1) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Quantity must be at least 1.' });
  }

  const inputWithAccess = { ...input, overrideAccess };

  if (product.variants?.length) {
    return updateVariantStock(db, product, inputWithAccess, -quantity);
  }

  return updateBaseStock(db, product, inputWithAccess, -quantity);
}

/**
 * Restores product or variant stock when an order is canceled or refunded.
 */
export async function incrementStockForOrder(
  db: BasePayload,
  input: StockAdjustmentInput,
): Promise<StockAdjustmentResult | null> {
  const overrideAccess = resolveOverrideAccess(input);
  const inputWithAccess = { ...input, overrideAccess };
  const product = await loadProduct(db, input.productId, overrideAccess);
  const quantity = input.quantity;

  if (quantity < 1) {
    return null;
  }

  try {
    if (product.variants?.length) {
      const variant = findMatchingVariant(product, input.size, input.color);
      if (!variant) {
        console.error(
          `[inventory] Restore skipped: variant not found for product ${input.productId}`,
          { orderId: input.orderId, size: input.size, color: input.color },
        );
        return null;
      }
      return updateVariantStock(db, product, inputWithAccess, quantity);
    }

    return updateBaseStock(db, product, inputWithAccess, quantity);
  } catch (error) {
    console.error('[inventory] Failed to restore stock:', error, {
      orderId: input.orderId,
      productId: input.productId,
    });
    return null;
  }
}

export type OrderStockSnapshot = {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  inventoryAdjusted?: string | null;
};

/**
 * Restores stock for a canceled/refunded order when inventory was previously deducted.
 */
export async function restoreStockForOrder(
  db: BasePayload,
  order: OrderStockSnapshot,
  options: { orderId: string; overrideAccess?: boolean },
): Promise<boolean> {
  if (order.inventoryAdjusted !== 'deducted') {
    return false;
  }

  const result = await incrementStockForOrder(db, {
    productId: order.productId,
    quantity: order.quantity,
    size: order.size,
    color: order.color,
    orderId: options.orderId,
    overrideAccess: options.overrideAccess ?? true,
  });

  return result !== null;
}
