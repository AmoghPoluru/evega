/**
 * Search Query Builder
 * Builds MongoDB queries for enhanced search including variant matching
 */

import type { Where } from "payload";
import { parseQuery, ParsedQuery } from "./query-parser";
import { getNormalizedVariantValue } from "./variant-mapper";

export interface SearchQueryOptions {
  searchTerm: string;
  includeVariants?: boolean;
  includePrice?: boolean;
}

/**
 * Build enhanced search query with variant support
 */
export function buildSearchQuery(options: SearchQueryOptions): {
  where: Where;
  parsedQuery: ParsedQuery;
} {
  const { searchTerm, includeVariants = true, includePrice = true } = options;
  const parsedQuery = parseQuery(searchTerm);

  const where: Where = {};

  // Build OR conditions for general search (name, tags, description)
  const orConditions: any[] = [];

  // Add keyword search conditions
  if (parsedQuery.keywords.length > 0) {
    const keywordSearch = parsedQuery.keywords.join(" ");
    
    orConditions.push(
      {
        name: {
          contains: keywordSearch,
        },
      },
      {
        "tags.name": {
          contains: keywordSearch,
        },
      },
      {
        description: {
          contains: keywordSearch,
        },
      }
    );

    // Also search individual keywords
    for (const keyword of parsedQuery.keywords) {
      if (keyword.length > 2) {
        orConditions.push(
          {
            name: {
              contains: keyword,
            },
          },
          {
            "tags.name": {
              contains: keyword,
            },
          }
        );
      }
    }
  } else {
    // If no keywords, search the entire term
    orConditions.push(
      {
        name: {
          contains: searchTerm,
        },
      },
      {
        "tags.name": {
          contains: searchTerm,
        },
      },
      {
        description: {
          contains: searchTerm,
        },
      }
    );
  }

  // Build variant search conditions (add to OR, not AND)
  if (includeVariants) {
    // Variant search conditions - add to OR conditions so products match if they have the variant OR match keywords
    if (parsedQuery.color) {
      const normalizedColor = getNormalizedVariantValue(parsedQuery.color, "color");
      if (normalizedColor) {
        // Search in variantData.color field - try multiple case variations
        const colorVariations = [
          normalizedColor,
          normalizedColor.charAt(0).toUpperCase() + normalizedColor.slice(1), // "Red"
          normalizedColor.toUpperCase(), // "RED"
        ];
        
        // Remove duplicates
        const uniqueColors = [...new Set(colorVariations)];
        
        // Use 'in' operator for exact matches (more reliable than contains for JSON fields)
        orConditions.push({
          "variants.variantData.color": {
            in: uniqueColors,
          },
        });
        
        // Also try contains as fallback (for partial matches)
        for (const colorVar of uniqueColors) {
          orConditions.push({
            "variants.variantData.color": {
              contains: colorVar,
            },
          });
        }
      }
    }

    if (parsedQuery.size) {
      const normalizedSize = getNormalizedVariantValue(parsedQuery.size, "size");
      if (normalizedSize) {
        // Handle both "Small" and "S" variations
        const sizeVariations = [normalizedSize];
        if (normalizedSize === "small") {
          sizeVariations.push("s", "Small", "S");
        } else if (normalizedSize === "medium") {
          sizeVariations.push("m", "Medium", "M");
        } else if (normalizedSize === "large") {
          sizeVariations.push("l", "Large", "L");
        } else {
          // For other sizes, add capitalized version
          const capitalized = normalizedSize.charAt(0).toUpperCase() + normalizedSize.slice(1);
          sizeVariations.push(capitalized);
        }

        orConditions.push({
          "variants.variantData.size": {
            in: sizeVariations,
          },
        });
      }
    }

    if (parsedQuery.material) {
      const normalizedMaterial = getNormalizedVariantValue(parsedQuery.material, "material");
      if (normalizedMaterial) {
        // Try multiple case variations
        const materialVariations = [
          normalizedMaterial,
          normalizedMaterial.charAt(0).toUpperCase() + normalizedMaterial.slice(1),
          normalizedMaterial.toUpperCase(),
        ];
        
        const uniqueMaterials = [...new Set(materialVariations)];
        
        // Use 'in' operator for exact matches
        orConditions.push({
          "variants.variantData.material": {
            in: uniqueMaterials,
          },
        });
        
        // Also try contains as fallback
        for (const materialVar of uniqueMaterials) {
          orConditions.push({
            "variants.variantData.material": {
              contains: materialVar,
            },
          });
        }
      }
    }
  }

  // Combine conditions - use OR for flexible matching
  if (orConditions.length > 0) {
    where.or = orConditions;
  }

  // Add price filters if parsed from query
  if (includePrice) {
    if (parsedQuery.minPrice || parsedQuery.maxPrice) {
      if (parsedQuery.minPrice && parsedQuery.maxPrice) {
        where.price = {
          greater_than_equal: parsedQuery.minPrice,
          less_than_equal: parsedQuery.maxPrice,
        };
      } else if (parsedQuery.minPrice) {
        where.price = {
          greater_than_equal: parsedQuery.minPrice,
        };
      } else if (parsedQuery.maxPrice) {
        where.price = {
          less_than_equal: parsedQuery.maxPrice,
        };
      }
    }
  }

  // Only use AND if we have existing AND conditions (from other filters like category, price, etc.)
  // Don't add variant conditions to AND - they should be part of OR for flexible matching

  return { where, parsedQuery };
}

/**
 * Build variant-only search query (for filtering by variants)
 */
export function buildVariantQuery(parsedQuery: ParsedQuery): Where {
  const where: Where = {};
  const variantConditions: any[] = [];

  if (parsedQuery.color) {
    const normalizedColor = getNormalizedVariantValue(parsedQuery.color, "color");
    if (normalizedColor) {
      variantConditions.push({
        "variants.variantData.color": {
          contains: normalizedColor,
        },
      });
    }
  }

  if (parsedQuery.size) {
    const normalizedSize = getNormalizedVariantValue(parsedQuery.size, "size");
    if (normalizedSize) {
      const sizeVariations = [normalizedSize];
      if (normalizedSize === "small") {
        sizeVariations.push("s");
      } else if (normalizedSize === "medium") {
        sizeVariations.push("m");
      } else if (normalizedSize === "large") {
        sizeVariations.push("l");
      }

      variantConditions.push({
        "variants.variantData.size": {
          in: sizeVariations,
        },
      });
    }
  }

  if (parsedQuery.material) {
    const normalizedMaterial = getNormalizedVariantValue(parsedQuery.material, "material");
    if (normalizedMaterial) {
      variantConditions.push({
        "variants.variantData.material": {
          contains: normalizedMaterial,
        },
      });
    }
  }

  if (variantConditions.length > 0) {
    where.or = variantConditions;
  }

  return where;
}
