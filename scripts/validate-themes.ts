/**
 * Validates every catalog theme spec (inline + modular).
 * Run: npm run validate:themes
 */
import { THEME_CATALOG_SPECS } from "@/lib/templates/manifests/theme-catalog";
import { validateThemeSpecs } from "@/lib/templates/manifests/theme-spec-schema";

function main() {
  const specs = THEME_CATALOG_SPECS;
  validateThemeSpecs(specs);

  const slugs = specs.map((spec) => spec.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate theme slugs: ${[...new Set(duplicates)].join(", ")}`);
  }

  console.log(`✓ ${specs.length} theme specs validated (${specs.filter((s) => s.featured).length} featured)`);
}

main();
