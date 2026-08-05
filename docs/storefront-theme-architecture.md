# Storefront Theme Library — Technical Design

Scope: how to ship **5–20 visually distinct storefront designs** on `/vendor/templates` without paying 5–20× maintenance. No code in this document; it is an architecture and rollout proposal grounded in what is already on the `devin/1785894417-modular-storefront-builder` branch.

---

## 1. Terminology: what "theme" actually means

The word is overloaded, and the overloading is exactly what makes multi-template systems expensive. Every mature platform separates these five layers. Right now evega blurs layers 1–4 into one JSON blob.

| Layer | Industry name | What it controls | Where it lives today in evega |
|---|---|---|---|
| 1 | **Design tokens** (Shopify: *theme settings*; Squarespace: *site styles*) | Colors, fonts, spacing, radii, shadows, type scale. No structure. | `templateConfig.colors / fonts / spacing / textStyles / backgroundStyle` → `generateCSSVariables()` → `--template-*` CSS vars |
| 2 | **Section** | One reusable horizontal band of a page (hero, product grid, testimonials) | `src/components/vendor/sections/*`, `StorefrontSection`, `SectionRenderer` |
| 3 | **Section variant / block** | *How* that band renders (hero: full-bleed vs split vs editorial-stacked) | Partially: `components.heroBanner.style`, `components.productCard.style` — but the layout components mostly ignore them |
| 4 | **Layout / skeleton** | Page chrome: header position, container rhythm, footer, global background | `componentMapping.layout` → `layoutRegistry` (`default`, `reloop`, `emporium`, `runway`, `modular`) |
| 5 | **Theme** | A *named, curated bundle* of 1 + 3 + 4 + a default section list, marketed to a niche | Conflated with a row in `vendor-templates` (`seed-templates.ts`) |

**So: a "theme" is not code. A theme is a manifest** — "use skeleton `editorial`, token pack `warm-neutral`, hero variant `split-media`, product card `bordered-portrait`, and this ordered default section list." That single reframing is what makes 20 themes affordable.

Two more terms you will hit in the research below:

- **Preset** — a saved set of setting values. Shopify has three tiers: *section presets* (default config when a merchant inserts a section), *block presets*, and *theme presets* (a whole alternate design from the same codebase; Shopify caps these at 5 per theme and gives each its own Theme Store listing page).
- **Template** — in Shopify's vocabulary this is a *page type* (product, collection, index), not a design. In marketplace vocabulary ("ThemeForest template") it means the whole design. Your UI currently uses the marketplace meaning; keep that for vendors, but do not use it internally or you will confuse page-type templates with designs later.

---

## 2. Research: how the platforms actually do it

**Shopify (Online Store 2.0 → Horizon).** Pages are JSON templates that are just ordered lists of sections; sections declare their own settings/blocks/presets in a `{% schema %}`. Crucially, Shopify's newest flagship, the **Horizon collection, is 10 separately-listed themes sharing one engine** — identical framework, blocks and sections, differing in default fonts, hero sections, product cards and section presets, each tuned to a niche (Atelier = luxury editorial, Pitch = sportswear/high contrast, Dwell = home decor, Savor = food). Separately, `settings_data.json` supports up to **5 theme presets per theme package**, each an alternate palette/typography/layout combination that gets its own storefront listing.
→ Takeaway: even Shopify does not maintain 10 codebases. They maintain one and ship 10 manifests.

**Squarespace.** 7.0 had 110+ named templates, each with its *own* style panel and its own quirks — the classic maintenance trap. 7.1 collapsed all of them into **one universal engine**; every "template" is now a starting point (section layout + style pack) over identical structure and features, with a single consistent Site Styles panel. They also removed template switching precisely because there is nothing to switch.
→ Takeaway: the industry's largest natural experiment ran the "many real templates" model, then abandoned it.

**ThemeForest / Webflow marketplace.** Genuinely independent codebases per template, sold once. That works because **the author's maintenance obligation is weak and per-item** — a buyer who wants updates buys support. You cannot copy this model: you host every vendor storefront, so every template you ship becomes a permanent surface you must keep working through every checkout, payments and product-schema change. This is the "higher maintenance cost" bullet in your brief, and it is the whole reason to reject the literal ThemeForest model while keeping its *shopping experience*.

**Wix.** 900+ "templates" are content+style presets over one editor and one rendering runtime; the perceived variety is in imagery, copy and section arrangement, not engine forks.

**Convergent conclusion:** vendors must *feel* like they are choosing among 20 bespoke websites; engineering must be maintaining **one engine, ~4 skeletons, ~12 section variants, and 20 data manifests**.

---

## 3. Where evega stands (honest assessment)

Good foundations already on the branch:

- `SectionRenderer` + `getSection()` — a real section engine exists.
- `--template-*` CSS variables from `generateCSSVariables()` — a real token layer exists, and `generateSiteRootCSSVariables()` even bridges tokens into shadcn.
- `mergeTemplateWithCustomization()` — a clean two-level cascade (template → vendor customization).
- `template-fonts.ts`, live preview, `category-presets.ts` — the authoring surface has begun.

Four structural problems block a 20-theme catalog:

1. **Layouts are hand-written pages, not skeletons.** `DefaultLayout` is 402 lines that hard-code hero + info + grid; `Emporium`/`Reloop`/`Runway` are parallel forks. Adding themes this way is exactly the ThemeForest cost curve — theme #12 costs the same as theme #4, forever.
2. **The token vocabulary is too small to make themes look different.** Eight colors, two fonts, three spacing values and two radii cannot express "brutalist streetwear" vs "quiet luxury". The difference between those two is *rhythm, contrast, borders, shadow, case, ratio* — none of which are tokens today.
3. **`components.*.style` is declared but not honoured.** `heroBanner.style: "split"` and `productCard.style: "compact"` exist in the schema and in all seven seeds, but the layouts largely ignore them. That is the single highest-leverage gap: variants are the cheapest source of visual distinctness.
4. **Themes are 130-line hand-written JSON blobs** (`seed-templates.ts` is 961 lines for 7 themes). At 20 themes that file is ~3k lines of untyped-at-runtime duplication with no versioning, no diffing and no migration story.

---

## 4. Proposed architecture: one engine, many manifests

```
Theme manifest (data, ~40 lines)
    ├── skeleton:      "classic" | "editorial" | "showcase" | "dense"   (4 layout shells)
    ├── tokenPack:     extends a base scale → colors, type scale, rhythm, shape, motion
    ├── variants:      { hero: "split-media", productCard: "bordered-portrait", nav: "sticky-minimal", ... }
    ├── sections:      ordered default StorefrontSection[] with per-section settings
    └── meta:          name, niche, category, tags, previewImage, version, minEngineVersion

           ↓ resolved at request time (unchanged pipeline)

resolveVendorTemplate() → mergeTemplateWithCustomization() → generateCSSVariables()
           ↓
ModularLayout (the ONLY layout) → skeleton chrome → SectionRenderer → section[variant]
```

### 4.1 Collapse skeletons from N to 4

Retire per-theme layout components. Keep exactly four skeletons, chosen because they differ *structurally* (not stylistically):

| Skeleton | Structural signature | Serves |
|---|---|---|
| `classic` | Sticky top nav, full-width hero, contained grid | General retail, the current `default` |
| `editorial` | Oversized type, asymmetric bands, generous whitespace, media-led | Luxury, fashion, artisan |
| `showcase` | Sidebar/left-rail nav, filter-forward, large imagery | Catalog-heavy, furniture, décor |
| `dense` | Compact nav, tight grid, 4–5 columns, minimal chrome | Grocery, wholesale, long catalogs |

Everything else that distinguishes `Reloop` from `Emporium` from `Runway` today is tokens + variants, and should be expressed as such. Existing themes keep working by mapping their old `componentMapping.layout` value to a skeleton + token pack + variant set (see §7 migration).

### 4.2 Expand tokens from ~15 to ~45

This is what buys distinctness without new components. Add, as first-class tokens with CSS variables:

- **Type scale**: base size + ratio (1.125 quiet / 1.333 editorial), heading case, tracking per level, optional display font as a *third* family.
- **Rhythm**: section padding scale (compact/normal/airy), grid gap, container width, vertical divider style between sections.
- **Shape**: radius scale (sharp 0 / soft 8 / pill 999), border width, border style, elevation/shadow scale.
- **Surface**: card treatment (flat / bordered / elevated / glass), image aspect ratio (1:1 / 4:5 / 3:2), image hover behaviour.
- **Contrast intent**: light / dark / high-contrast — drives derived foreground colors rather than 8 hand-picked hexes.
- **Motion**: none / subtle / expressive.

Two design rules that matter more than the list:
- **Derive, don't enumerate.** Give a theme 3 seed colors and compute the rest (foregrounds, muted, borders, hover states) with an OKLCH-based palette function. Hand-picking 8 hexes per theme is how you get 20 themes with accidental WCAG failures. Derivation also makes vendor recoloring safe — the current `ColorPicker` lets a vendor pick a background that kills their own text contrast.
- **Everything renders from `--template-*`.** No component may read `templateConfig` for styling; if a section needs a value it must exist as a token. This is the invariant that keeps theme count decoupled from component count.

### 4.3 Make section variants real

Each section type gets a small, closed set of variants (this is Shopify's *section preset* concept). Target ~12 variants total across 5 section types:

- hero: `full-bleed`, `split-media`, `carousel`, `minimal-type`
- product-grid: `standard`, `masonry`, `editorial-rows`, `dense-compact`
- product card: `minimal`, `bordered-portrait`, `overlay-caption`
- vendor-info: `banner-bar`, `sidebar-profile`
- plus `testimonials`, `rich-text` variants as needed

A variant is a rendering branch inside the existing section component, selected from `settings.variant`, styled entirely by tokens. Combinatorially, 4 skeletons × 4 hero × 4 grid × 3 card ≈ 200 coherent designs — you only need to *curate* 20 of them.

### 4.4 Themes become authored data, not code

Move the catalog out of `seed-templates.ts` into a typed manifest set (still versioned in git — themes are product surface, not user content) that is validated by Zod at build time and seeded into `vendor-templates`. Each manifest carries:

- `version` (semver) and `minEngineVersion` — so a theme can declare it needs the new grid variant;
- `niche` and `tags` — the vendor-facing filter axis that makes 20 feel curated instead of overwhelming;
- `previewImage` — generated, never hand-drawn (§6);
- `status`/`deprecatedBy` — how you retire a theme without breaking the vendors already on it.

Keep the `owner`/`status` approval flow already added: a vendor-built modular template is simply a manifest with an `owner`, and admin approval promotes it to a global one. That path already exists on the branch and is the right long-term "20 themes without us writing them" answer.

### 4.5 The three-level cascade

```
theme manifest defaults  →  vendor customization (colors/fonts/sections)  →  per-section settings
```

`mergeTemplateWithCustomization()` already implements the middle level. Two additions are needed:

- **Bounded customization.** A vendor should override *semantic* tokens (brand primary, accent, heading font, radius scale) and never structural ones. Unbounded overrides are how vendors make a theme look broken and then blame the theme.
- **Rebase on theme switch.** Today, switching template silently reapplies old color overrides onto a new design. Vendors should be asked: keep my brand colors, or adopt the theme's? Squarespace's decision to forbid switching entirely is the alternative; explicit rebase is friendlier.

---

## 5. The catalog: 20 themes as niche × mood

Distinctness that vendors perceive comes from *niche fit*, not from CSS novelty — this is exactly what Horizon's 10 siblings encode. Suggested grid (all four skeletons reused across niches):

| # | Theme | Niche | Skeleton | Signature tokens |
|---|---|---|---|---|
| 1 | Atelier | Luxury fashion | editorial | serif display, airy rhythm, sharp corners, mono-neutral |
| 2 | Saree | Ethnic/handloom (core evega) | showcase | rich jewel palette, 4:5 imagery, gold accents |
| 3 | Zen | Minimal | classic | high whitespace, single sans, hairline borders |
| 4 | Pitch | Streetwear/sport | classic | uppercase display, high contrast, zero radius |
| 5 | Bazaar | Grocery/FMCG | dense | 5-col grid, compact cards, badge-heavy |
| 6 | Dwell | Home décor / furniture | showcase | warm neutrals, 3:2 imagery, elevated cards |
| 7 | Ritual | Beauty / wellness | editorial | pastel, pill radius, soft shadow, slow motion |
| 8 | Savor | Food & beverage | classic | warm, rounded, appetite-forward accents |
| 9 | Craft | Handmade / artisan | editorial | textured background, hand-set type scale |
| 10 | Vault | Jewellery | showcase | dark surface, spotlight cards, gold-on-black |
| 11 | Studio | Art / prints | editorial | gallery grid, generous margins, caption-led |
| 12 | Bloom | Florals / gifting | classic | soft gradient, script display, pastel |
| 13 | Tech | Gadgets / accessories | dense | cool neutral, bento cards, spec-forward |
| 14 | Kiddo | Kids & toys | classic | playful palette, pill radius, expressive motion |
| 15 | Heritage | Legacy / traditional | editorial | asymmetric bands, ink palette, serif |
| 16 | Fabric | Apparel & textiles | showcase | edge-to-edge photo grid, minimal chrome |
| 17 | Fit | Fitness / nutrition | dense | high-contrast, bold numerals, dark option |
| 18 | Petals | Ayurveda / organics | classic | earthy greens, natural texture |
| 19 | Marquee | Events / rentals | editorial | large hero, testimonial-led, CTA-forward |
| 20 | Kirana | Neighbourhood store | dense | ultra-compact, WhatsApp-forward, low-bandwidth |

Ship **8–10 first** (§8), then extend — a manifest costs a day, not a sprint, once the engine is right.

---

## 6. Operational concerns that decide whether this survives

**Preview images.** 20 themes × 3 viewports × every future engine change = never hand-maintain screenshots. Render previews with a Playwright job in CI against a demo vendor fixture, keyed by theme version; regenerate when the manifest or engine version changes. Same job produces the vendor-facing thumbnail and the modal preview on `/vendor/templates`.

**Visual regression is the real maintenance cost.** With one engine, a section change can silently break 20 themes. The CI matrix should be *skeletons × variants × contrast modes* (≈40 snapshots), not one per theme — that keeps the suite fixed-size as the catalog grows. Add automated WCAG AA contrast assertions over derived palettes; that is where multi-theme systems actually fail in production.

**Performance.** Theme fonts are currently injected per storefront (`TemplateFontLinks`). With 20 themes you need a bounded font whitelist (≤2 families per theme, subset + `display: swap`, preconnect), or storefront LCP degrades unevenly and unpredictably per vendor.

**Governance.** Define a deprecation policy before theme #8, not after #20: `active` / `hidden` (existing vendors keep it, new ones can't pick it) / `retired` (auto-migrate to a named successor). Without it every theme is immortal.

**Vendor-facing merchandising.** 20 items in a flat grid is worse UX than 7. Filter by niche and mood, add "recommended for your category" based on the vendor's product categories, and let vendors preview a theme *with their own products* (`build-preview-template.ts` already points this direction).

---

## 7. Migration from today's 7 templates

1. Freeze `seed-templates.ts` as v1 data; do not extend it.
2. Introduce the manifest schema + `themeVersion` on `vendor-templates`; write the 7 existing seeds as manifests (`default`→`classic`, `runway`→`editorial`, `emporium`→`showcase`, `reloop`→`classic` + expressive tokens).
3. Port `DefaultLayout`'s markup into skeleton `classic` + section variants; the other three layout files become thin manifests and are deleted once snapshot-diffed to parity.
4. Keep `layoutRegistry` as a compatibility shim mapping legacy `componentMapping.layout` values to skeletons, so unmigrated vendor documents keep rendering. Remove the shim one release later.
5. Backfill vendors: no vendor row changes — they point at a template ID whose manifest now resolves through the new engine.

Risk to name explicitly: step 3 is a pixel-parity refactor of live vendor storefronts. It needs the visual-regression harness (§6) *before* it starts, not after.

---

## 8. Phasing

| Phase | Deliverable | Outcome |
|---|---|---|
| 0 | Token expansion + derived palettes + contrast tests | Themes can differ meaningfully; vendor recoloring stops breaking contrast |
| 1 | Manifest schema, theme registry, seeding, versioning | Themes become data |
| 2 | 4 skeletons + honour `components.*.style` as real variants | Structural distinctness, `Default/Reloop/Emporium/Runway` collapse into the engine |
| 3 | Preview-generation job + visual regression matrix | Catalog growth stops being manual work |
| 4 | Ship 8–10 curated themes with niche filtering on `/vendor/templates` | Vendor-visible payoff |
| 5 | Extend to 20; open the builder's approval flow so vendors/partners contribute manifests | Catalog scales without your team |

Phases 0–3 are the investment; after them the marginal cost of a theme is roughly a day of design + a manifest, and — the point of the whole exercise — **the marginal cost of maintaining it is near zero**, because there is nothing theme-specific left to maintain.

---

## 9. Direct answer to the ThemeForest question

Adopt the ThemeForest **experience** (a browsable library of 20 niche-named, professionally-previewed designs; vendors feel they picked a custom site) and reject the ThemeForest **implementation** (20 independent codebases). Shopify's Horizon collection and Squarespace 7.1 both converged on this after running the alternative at scale. Your "cons" bullet is real but it is a property of the implementation, not of the catalog size: with one engine and 20 manifests, the maintenance cost scales with *sections and variants*, not with the number of themes on the shelf.
