import { validateThemeSpec, type ThemeSpecInput } from "@/lib/templates/manifests/theme-spec-schema";

/**
 * Define a catalog theme spec with runtime validation.
 * Use in `src/lib/templates/manifests/themes/*.theme.ts` files.
 */
export function defineTheme(spec: ThemeSpecInput): ThemeSpecInput {
  validateThemeSpec(spec);
  return spec;
}
