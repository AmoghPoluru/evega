# Maison Boutique theme (Magnolia-inspired)

Selectable storefront theme for **all vendors**. Inspired by elegant US boutiques like [Magnolia Boutique](https://magnoliaboutique.com/) — clean white layout, serif wordmark, promo strip, trending product grid. Does **not** copy Magnolia logos, photos, or branding.

## What was added

| Piece | Location |
|-------|----------|
| Layout `maison` | `src/components/vendor/layouts/MaisonLayout.tsx` |
| Theme seed `maison-boutique` | `src/lib/templates/seed-templates.ts` |
| Layout picker entry | `src/lib/templates/storefront-layouts.ts` |
| Safe upsert script | `npm run db:seed:maison-boutique` |

## Recommendation (layout)

Use the built-in **4-column boutique product grid** (Maison layout) — closest fit to a polished women's boutique catalog without a mega-menu rewrite.

## How to apply (vendor)

1. Seed the theme once (admin/dev):
   ```bash
   npm run db:seed:maison-boutique
   ```
2. Sign in as vendor → **Store appearance**
3. **Template** tab → select **Maison Boutique**
4. **Layout** tab → **Maison Boutique** (or leave theme default)
5. **Banner** tab → pick a Happy Banner promo strip (optional)
6. **Logo** tab → leave empty for now: the layout shows a **text wordmark** from the vendor name. Upload a logo later if desired.
7. Open public shop: `/vendors/<your-slug>`

## Notes

- Full-bleed fashion hero is **not** part of this v1 (you chose promo banner only).
- Mega-nav like Magnolia is **not** included (shared marketplace navbar remains).
