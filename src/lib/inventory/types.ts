export type InventoryAdjustedStatus = 'none' | 'deducted' | 'restored';

export type ProductVariantRow = {
  stock?: number | null;
  size?: string | null;
  color?: string | null;
  blouseSize?: string | null;
  variantData?: Record<string, unknown> | null;
};

export type ProductInventoryDoc = {
  id: string;
  name?: string | null;
  variants?: ProductVariantRow[] | null;
  stock?: number | null;
  isPrivate?: boolean | null;
};

export type StockAdjustmentInput = {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  orderId?: string;
  overrideAccess?: boolean;
};

export type StockAdjustmentResult = {
  productId: string;
  previousStock: number;
  newStock: number;
  adjustedVariant: boolean;
};
