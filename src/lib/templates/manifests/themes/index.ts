/**
 * Modular catalog themes — one file per theme.
 *
 * To add a theme:
 * 1. Copy `_scaffold.theme.ts` → `your-theme.theme.ts`
 * 2. Fill in the spec (use a chrome preset from `chrome-presets.ts`)
 * 3. Export via `defineTheme(...)` and add to `modularThemeSpecs` below
 * 4. Run `npm run validate:themes`
 */

import { kiranaTheme } from "./kirana.theme";

export const modularThemeSpecs = [kiranaTheme] as import("@/lib/templates/manifests/theme-catalog").ThemeSpec[];

export const modularFeaturedSlugs = modularThemeSpecs
  .filter((spec) => spec.featured)
  .map((spec) => spec.slug);

export { kiranaTheme };
