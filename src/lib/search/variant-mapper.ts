/**
 * Variant Type Mapper
 * Maps search terms to variant types (size, color, material)
 */

// Size mappings (abbreviations and full names)
const SIZE_MAPPINGS: Record<string, string> = {
  // Abbreviations
  "xs": "xs",
  "s": "small",
  "m": "medium",
  "l": "large",
  "xl": "xl",
  "2xl": "2xl",
  "3xl": "3xl",
  "xxl": "2xl",
  "xxxl": "3xl",
  // Full names
  "small": "small",
  "medium": "medium",
  "large": "large",
  "extra small": "xs",
  "extra large": "xl",
  "extra-large": "xl",
};

// Color mappings (common color names)
const COLOR_MAPPINGS: Record<string, string> = {
  "red": "red",
  "maroon": "maroon",
  "crimson": "red",
  "burgundy": "maroon",
  "pink": "pink",
  "blue": "blue",
  "navy": "navy",
  "azure": "blue",
  "cobalt": "blue",
  "indigo": "blue",
  "green": "green",
  "emerald": "emerald",
  "jade": "green",
  "mint": "green",
  "yellow": "yellow",
  "orange": "orange",
  "purple": "purple",
  "black": "black",
  "ebony": "black",
  "charcoal": "black",
  "white": "white",
  "ivory": "ivory",
  "cream": "cream",
  "pearl": "white",
  "gold": "gold",
  "golden": "gold",
  "amber": "gold",
  "silver": "silver",
  "platinum": "silver",
  "metallic": "silver",
  "rose gold": "rose gold",
  "champagne": "champagne",
  "midnight blue": "midnight blue",
  "ruby red": "ruby red",
  "sapphire blue": "sapphire blue",
  "beige": "beige",
  "tan": "tan",
  "brown": "brown",
  "bronze": "bronze",
};

// Material mappings
const MATERIAL_MAPPINGS: Record<string, string> = {
  "silk": "silk",
  "cotton": "cotton",
  "georgette": "georgette",
  "chiffon": "chiffon",
  "linen": "linen",
  "net": "net",
  "organza": "organza",
  "tussar": "tussar",
  "raw silk": "raw silk",
  "velvet": "velvet",
  "satin": "satin",
  "polyester": "polyester",
  "rayon": "rayon",
};

/**
 * Normalize search term for matching
 */
function normalizeTerm(term: string): string {
  return term.toLowerCase().trim();
}

/**
 * Map a search term to a variant type
 * Returns the variant type slug if it matches, null otherwise
 */
export function mapToVariantType(term: string): { type: string; value: string } | null {
  const normalized = normalizeTerm(term);

  // Check size
  if (SIZE_MAPPINGS[normalized]) {
    return { type: "size", value: SIZE_MAPPINGS[normalized] };
  }

  // Check color
  if (COLOR_MAPPINGS[normalized]) {
    return { type: "color", value: COLOR_MAPPINGS[normalized] };
  }

  // Check material
  if (MATERIAL_MAPPINGS[normalized]) {
    return { type: "material", value: MATERIAL_MAPPINGS[normalized] };
  }

  return null;
}

/**
 * Check if a term is a size variant
 */
export function isSizeTerm(term: string): boolean {
  const normalized = normalizeTerm(term);
  return normalized in SIZE_MAPPINGS;
}

/**
 * Check if a term is a color variant
 */
export function isColorTerm(term: string): boolean {
  const normalized = normalizeTerm(term);
  return normalized in COLOR_MAPPINGS;
}

/**
 * Check if a term is a material variant
 */
export function isMaterialTerm(term: string): boolean {
  const normalized = normalizeTerm(term);
  return normalized in MATERIAL_MAPPINGS;
}

/**
 * Get all possible variant values for a type
 */
export function getVariantValuesForType(type: string): string[] {
  switch (type) {
    case "size":
      return Object.values(SIZE_MAPPINGS);
    case "color":
      return Object.values(COLOR_MAPPINGS);
    case "material":
      return Object.values(MATERIAL_MAPPINGS);
    default:
      return [];
  }
}

/**
 * Get normalized variant value for a search term
 */
export function getNormalizedVariantValue(term: string, type: string): string | null {
  const normalized = normalizeTerm(term);

  switch (type) {
    case "size":
      return SIZE_MAPPINGS[normalized] || null;
    case "color":
      return COLOR_MAPPINGS[normalized] || null;
    case "material":
      return MATERIAL_MAPPINGS[normalized] || null;
    default:
      return null;
  }
}
