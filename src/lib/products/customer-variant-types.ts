const SIZE_VARIANT_KEYS = new Set(["size", "blouseSize"]);

export function isSizeVariantKey(key: string): boolean {
  return SIZE_VARIANT_KEYS.has(key);
}

/** Variant dimensions shoppers choose on the product page (excludes size). */
export function getCustomerFacingVariantTypes(variantTypes: string[]): string[] {
  return variantTypes.filter((key) => !isSizeVariantKey(key));
}

export function getSizeFromSelectedVariants(
  selectedVariants: Record<string, string>,
): string | undefined {
  return selectedVariants.size || selectedVariants.blouseSize || undefined;
}
