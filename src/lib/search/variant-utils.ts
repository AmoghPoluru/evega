/**
 * Variant Search Utilities
 * Functions to extract, normalize, and match variant values from products
 */

/**
 * Extract all variant values from a product as a searchable string
 */
export function extractVariantValues(variants: any[] | null | undefined): string {
  if (!variants || !Array.isArray(variants)) {
    return "";
  }

  const values = new Set<string>();

  for (const variant of variants) {
    if (variant.variantData && typeof variant.variantData === "object") {
      for (const [key, value] of Object.entries(variant.variantData)) {
        if (typeof value === "string" && value.trim()) {
          values.add(value.toLowerCase().trim());
        }
      }
    }
  }

  return Array.from(values).join(" ");
}

/**
 * Normalize variant value for comparison
 * Handles case-insensitive matching and common variations
 */
export function normalizeVariantValue(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Check if a variant value matches a search term (case-insensitive)
 */
export function matchesVariantValue(variantValue: string, searchTerm: string): boolean {
  const normalizedVariant = normalizeVariantValue(variantValue);
  const normalizedSearch = normalizeVariantValue(searchTerm);
  
  return normalizedVariant === normalizedSearch || 
         normalizedVariant.includes(normalizedSearch) ||
         normalizedSearch.includes(normalizedVariant);
}

/**
 * Extract variant values by type from a product
 */
export function extractVariantValuesByType(
  variants: any[] | null | undefined,
  variantType: string
): string[] {
  if (!variants || !Array.isArray(variants)) {
    return [];
  }

  const values = new Set<string>();

  for (const variant of variants) {
    if (variant.variantData && typeof variant.variantData === "object") {
      const value = variant.variantData[variantType];
      if (typeof value === "string" && value.trim()) {
        values.add(value.toLowerCase().trim());
      }
    }
  }

  return Array.from(values);
}

/**
 * Check if product has a variant matching the search criteria
 */
export function hasMatchingVariant(
  variants: any[] | null | undefined,
  variantType: string,
  searchValue: string
): boolean {
  if (!variants || !Array.isArray(variants)) {
    return false;
  }

  const normalizedSearch = normalizeVariantValue(searchValue);

  for (const variant of variants) {
    if (variant.variantData && typeof variant.variantData === "object") {
      const variantValue = variant.variantData[variantType];
      if (variantValue) {
        const variantStr = String(variantValue);
        // Case-insensitive matching
        if (matchesVariantValue(variantStr, normalizedSearch)) {
          return true;
        }
        // Also try capitalized version
        const capitalizedSearch = normalizedSearch.charAt(0).toUpperCase() + normalizedSearch.slice(1);
        if (matchesVariantValue(variantStr, capitalizedSearch)) {
          return true;
        }
        // Try exact match with original case
        if (normalizeVariantValue(variantStr) === normalizedSearch) {
          return true;
        }
      }
    }
  }

  return false;
}
