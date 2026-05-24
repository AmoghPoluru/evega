import { describe, expect, it, vi } from 'vitest';
import { TRPCError } from '@trpc/server';

import {
  decrementStockForOrder,
  findMatchingVariant,
  getTotalVariantStock,
  incrementStockForOrder,
  restoreStockForOrder,
} from '../../../../src/lib/inventory/adjust-product-stock';
import type { ProductInventoryDoc } from '../../../../src/lib/inventory/types';

function createMockDb(product: ProductInventoryDoc) {
  let current = { ...product, variants: product.variants?.map((v) => ({ ...v })) };

  return {
    findByID: vi.fn(async () => current),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      if (data.variants) {
        current = { ...current, variants: data.variants as ProductInventoryDoc['variants'] };
      }
      if (data.stock !== undefined) {
        current = { ...current, stock: data.stock as number };
      }
      if (data.isPrivate !== undefined) {
        current = { ...current, isPrivate: data.isPrivate as boolean };
      }
      return current;
    }),
    getProduct: () => current,
  };
}

describe('findMatchingVariant', () => {
  it('matches variantData.size and color', () => {
    const product: ProductInventoryDoc = {
      id: 'p1',
      variants: [
        { variantData: { size: 'M', color: 'Red' }, stock: 5 },
        { variantData: { size: 'L', color: 'Blue' }, stock: 3 },
      ],
    };
    const match = findMatchingVariant(product, 'M', 'Red');
    expect(match?.stock).toBe(5);
  });
});

describe('decrementStockForOrder', () => {
  it('decrements variant stock', async () => {
    const db = createMockDb({
      id: 'p1',
      isPrivate: false,
      variants: [{ size: 'S', color: 'Red', stock: 10 }],
    });

    const result = await decrementStockForOrder(db as never, {
      productId: 'p1',
      quantity: 2,
      size: 'S',
      color: 'Red',
    });

    expect(result.previousStock).toBe(10);
    expect(result.newStock).toBe(8);
    expect(db.getProduct().variants?.[0]?.stock).toBe(8);
  });

  it('throws when insufficient variant stock', async () => {
    const db = createMockDb({
      id: 'p1',
      variants: [{ size: 'S', stock: 1 }],
    });

    await expect(
      decrementStockForOrder(db as never, {
        productId: 'p1',
        quantity: 2,
        size: 'S',
      }),
    ).rejects.toThrow(TRPCError);
  });

  it('decrements base product stock when no variants', async () => {
    const db = createMockDb({
      id: 'p1',
      stock: 5,
      isPrivate: false,
    });

    const result = await decrementStockForOrder(db as never, {
      productId: 'p1',
      quantity: 2,
    });

    expect(result.newStock).toBe(3);
    expect(db.getProduct().stock).toBe(3);
  });

  it('auto-drafts product when variant stock reaches zero', async () => {
    const db = createMockDb({
      id: 'p1',
      isPrivate: false,
      variants: [{ size: 'S', stock: 2 }],
    });

    await decrementStockForOrder(db as never, {
      productId: 'p1',
      quantity: 2,
      size: 'S',
    });

    expect(db.getProduct().isPrivate).toBe(true);
  });
});

describe('incrementStockForOrder', () => {
  it('restores variant stock after decrement', async () => {
    const db = createMockDb({
      id: 'p1',
      isPrivate: true,
      variants: [{ size: 'S', color: 'Red', stock: 8 }],
    });

    const result = await incrementStockForOrder(db as never, {
      productId: 'p1',
      quantity: 2,
      size: 'S',
      color: 'Red',
    });

    expect(result?.newStock).toBe(10);
    expect(db.getProduct().variants?.[0]?.stock).toBe(10);
    expect(db.getProduct().isPrivate).toBe(false);
  });
});

describe('restoreStockForOrder', () => {
  it('returns false when inventory was not deducted', async () => {
    const db = createMockDb({
      id: 'p1',
      variants: [{ size: 'S', stock: 10 }],
    });

    const restored = await restoreStockForOrder(
      db as never,
      {
        productId: 'p1',
        quantity: 1,
        size: 'S',
        inventoryAdjusted: 'none',
      },
      { orderId: 'o1' },
    );

    expect(restored).toBe(false);
  });

  it('restores when inventoryAdjusted is deducted', async () => {
    const db = createMockDb({
      id: 'p1',
      isPrivate: true,
      variants: [{ size: 'S', stock: 9 }],
    });

    const restored = await restoreStockForOrder(
      db as never,
      {
        productId: 'p1',
        quantity: 1,
        size: 'S',
        inventoryAdjusted: 'deducted',
      },
      { orderId: 'o1' },
    );

    expect(restored).toBe(true);
    expect(db.getProduct().variants?.[0]?.stock).toBe(10);
  });
});

describe('getTotalVariantStock', () => {
  it('sums variant stock', () => {
    const total = getTotalVariantStock({
      id: 'p1',
      variants: [{ stock: 3 }, { stock: 7 }],
    });
    expect(total).toBe(10);
  });
});
