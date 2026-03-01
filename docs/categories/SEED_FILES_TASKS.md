# Seed Files - Comprehensive TODO List

> **Purpose**: This document serves as a comprehensive TODO list for creating, updating, and cleaning up seed files for categories, variant types, variant options, and related data.
>
> **For LLMs**: This file contains detailed task breakdowns for seed file creation, cleanup, and data migration. Each task includes completion status and technical details.

## System Overview

**What are Seed Files?**
- **Database Seeding Scripts** - Scripts that populate the database with initial data
- **Development Data** - Sample data for testing and development
- **Production Data** - Initial data for production setup (categories, variant types, etc.)

**Key Concepts:**
- **Seed Scripts**: Standalone TypeScript files that use Payload API to create data
- **Idempotent**: Seed scripts check for existing data before creating (avoid duplicates)
- **Modular**: Each seed file handles a specific data type (categories, variants, etc.)
- **Cleanup**: Remove old/outdated seed data before seeding new structure

**File Structure:**
- Main seed: `src/seed/seed.ts` (users, categories, products, tags)
- User seed: `src/seed/seed-users.ts`
- Variant seed: `src/seed/seed-variants.ts`
- Color seed: `src/seed/seed-colors.ts`
- Price seed: `src/seed/seed-prices.ts`
- Hero banner seed: `src/seed/seed-hero-banners.ts`

---

## Table of Contents

1. [Seed Files Cleanup](#seed-files-cleanup)
2. [Variant Type Seed File](#variant-type-seed-file)
3. [Variant Option Seed File](#variant-option-seed-file)
4. [Category Seed File](#category-seed-file)
5. [Category Variant Config Seed File](#category-variant-config-seed-file)
6. [Update Existing Seed Files](#update-existing-seed-files)
7. [Seed File Utilities](#seed-file-utilities)
8. [Testing & Validation](#testing--validation)

---

## Seed Files Cleanup

### Review Existing Seed Files
- [ ] **Task 1.1**: Review `src/seed/seed.ts` for outdated categories
  - Check existing categories data, identify categories that don't match new structure (Retail, Hotelmart)
- [ ] **Task 1.2**: Review `src/seed/seed.ts` for outdated products
  - Check existing products data, identify products that don't match new category structure
- [ ] **Task 1.3**: Review `src/seed/seed-variants.ts` for variant logic
  - Check variant generation logic, identify what needs updating for category-based variants
- [ ] **Task 1.4**: Review `src/seed/seed-colors.ts` for color options
  - Check color list, verify it matches new color options from variant configuration
- [ ] **Task 1.5**: Review `src/seed/seed-prices.ts` for pricing logic
  - Check pricing calculation logic, verify it matches category pricing rules
- [ ] **Task 1.6**: Review `src/seed/seed-hero-banners.ts` for dependencies
  - Check hero banner seed file, verify it doesn't depend on old categories

### Cleanup Actions
- [ ] **Task 1.7**: Remove outdated categories from `seed.ts`
  - Remove "Retail" and "Hotelmart" categories from categories array
- [ ] **Task 1.8**: Remove outdated products from `seed.ts`
  - Remove all brass statue products that don't match new category structure
- [ ] **Task 1.9**: Archive or remove old category seed data
  - Move old category data to backup file or remove completely
- [ ] **Task 1.10**: Update seed.ts to use new category structure
  - Replace old categories array with new Indian dress categories structure
- [ ] **Task 1.11**: Create backup of existing seed data
  - Export existing seed data to `src/seed/backup/` directory before cleanup

---

## Variant Type Seed File

### Create Variant Type Seed File
- [ ] **Task 2.1**: Create `src/seed/seed-variant-types.ts` file
  - Create new seed file for variant types with proper imports and structure
- [ ] **Task 2.2**: Add seed function for variant types
  - Create async function that seeds all variant types using Payload API
- [ ] **Task 2.3**: Add idempotency check for variant types
  - Check if variant type exists before creating, skip if exists
- [ ] **Task 2.4**: Seed "size" variant type
  - Create VariantType with name "Size", type "select", required false, displayOrder 1
- [ ] **Task 2.5**: Seed "blouseSize" variant type
  - Create VariantType with name "Blouse Size", type "select", required false, displayOrder 2
- [ ] **Task 2.6**: Seed "color" variant type
  - Create VariantType with name "Color", type "select", required false, displayOrder 3
- [ ] **Task 2.7**: Seed "material" variant type
  - Create VariantType with name "Material", type "select", required false, displayOrder 4
- [ ] **Task 2.8**: Seed "ringSize" variant type
  - Create VariantType with name "Ring Size", type "select", required false, displayOrder 5
- [ ] **Task 2.9**: Seed "shoeSize" variant type
  - Create VariantType with name "Shoe Size", type "select", required false, displayOrder 6
- [ ] **Task 2.10**: Seed "length" variant type
  - Create VariantType with name "Length", type "number", unit "inches", required false, displayOrder 7
- [ ] **Task 2.11**: Seed "sleeveType" variant type
  - Create VariantType with name "Sleeve Type", type "select", required false, displayOrder 8
- [ ] **Task 2.12**: Seed "bottomType" variant type
  - Create VariantType with name "Bottom Type", type "select", required false, displayOrder 9
- [ ] **Task 2.13**: Seed "dupattaType" variant type
  - Create VariantType with name "Dupatta Type", type "select", required false, displayOrder 10
- [ ] **Task 2.14**: Seed "borderType" variant type
  - Create VariantType with name "Border Type", type "select", required false, displayOrder 11
- [ ] **Task 2.15**: Seed "blouseStyle" variant type
  - Create VariantType with name "Blouse Style", type "select", required false, displayOrder 12
- [ ] **Task 2.16**: Seed "sareeLength" variant type
  - Create VariantType with name "Saree Length", type "select", required false, displayOrder 13
- [ ] **Task 2.17**: Seed "ageGroup" variant type
  - Create VariantType with name "Age Group", type "select", required false, displayOrder 14
- [ ] **Task 2.18**: Seed "chest" variant type
  - Create VariantType with name "Chest Size", type "select", required false, displayOrder 15
- [ ] **Task 2.19**: Seed "beadCount" variant type
  - Create VariantType with name "Bead Count", type "select", required false, displayOrder 16
- [ ] **Task 2.20**: Seed "fragrance" variant type
  - Create VariantType with name "Fragrance", type "select", required false, displayOrder 17
- [ ] **Task 2.21**: Seed "quantity" variant type
  - Create VariantType with name "Quantity", type "select", required false, displayOrder 18
- [ ] **Task 2.22**: Seed "kitType" variant type
  - Create VariantType with name "Kit Type", type "select", required false, displayOrder 19
- [ ] **Task 2.23**: Seed "language" variant type
  - Create VariantType with name "Language", type "select", required false, displayOrder 20
- [ ] **Task 2.24**: Seed "binding" variant type
  - Create VariantType with name "Binding", type "select", required false, displayOrder 21
- [ ] **Task 2.25**: Seed "format" variant type
  - Create VariantType with name "Format", type "select", required false, displayOrder 22
- [ ] **Task 2.26**: Seed "design" variant type
  - Create VariantType with name "Design", type "select", required false, displayOrder 23
- [ ] **Task 2.27**: Seed "finish" variant type
  - Create VariantType with name "Finish", type "select", required false, displayOrder 24
- [ ] **Task 2.28**: Seed "type" variant type
  - Create VariantType with name "Type", type "select", required false, displayOrder 25
- [ ] **Task 2.29**: Add npm script for variant types seed
  - Add `"db:seed:variant-types": "tsx src/seed/seed-variant-types.ts"` to package.json
- [ ] **Task 2.30**: Add logging and error handling to variant types seed
  - Add console logs for progress, success counts, error handling with try-catch

---

## Variant Option Seed File

### Create Variant Option Seed File
- [ ] **Task 3.1**: Create `src/seed/seed-variant-options.ts` file
  - Create new seed file for variant options with proper imports and structure
- [ ] **Task 3.2**: Add seed function for variant options
  - Create async function that seeds all variant options using Payload API
- [ ] **Task 3.3**: Add idempotency check for variant options
  - Check if variant option exists before creating, skip if exists

### Size Options
- [ ] **Task 3.4**: Seed standard size options (XS, S, M, L, XL, 2XL, 3XL)
  - Create VariantOption entries for standard sizes, variantType "size", global (categoryId null)
- [ ] **Task 3.5**: Seed blouse size options (32, 34, 36, 38, 40, 42, 44)
  - Create VariantOption entries for blouse sizes, variantType "blouseSize", global
- [ ] **Task 3.6**: Seed shoe size options (4, 5, 6, 7, 8, 9, 10)
  - Create VariantOption entries for shoe sizes, variantType "shoeSize", global
- [ ] **Task 3.7**: Seed ring size options (5, 6, 7, 8, 9, 10, 11)
  - Create VariantOption entries for ring sizes, variantType "ringSize", global
- [ ] **Task 3.8**: Seed plus size options (2XL, 3XL, 4XL)
  - Create VariantOption entries for plus sizes, variantType "size", global
- [ ] **Task 3.9**: Seed petite size options (Petite S, Petite M, Petite L)
  - Create VariantOption entries for petite sizes, variantType "size", global
- [ ] **Task 3.10**: Seed tall size options (Tall L, Tall XL)
  - Create VariantOption entries for tall sizes, variantType "size", global
- [ ] **Task 3.11**: Seed chest size options (38, 40, 42, 44, 46, 48)
  - Create VariantOption entries for chest sizes, variantType "chest", global

### Color Options
- [ ] **Task 3.12**: Seed traditional color options (Red, Maroon, Pink, Blue, Green, Yellow, Orange, Purple, Black, White, Navy)
  - Create VariantOption entries with hex codes: Red (#FF0000), Maroon (#800000), Pink (#FFC0CB), Blue (#0000FF), Green (#008000), Yellow (#FFFF00), Orange (#FFA500), Purple (#800080), Black (#000000), White (#FFFFFF), Navy (#000080)
- [ ] **Task 3.13**: Seed premium color options (Rose Gold, Champagne, Midnight Blue, Emerald, Ruby Red, Sapphire Blue)
  - Create VariantOption entries with hex codes: Rose Gold (#E8B4B8), Champagne (#F7E7CE), Midnight Blue (#191970), Emerald (#50C878), Ruby Red (#E0115F), Sapphire Blue (#0F52BA)
- [ ] **Task 3.14**: Seed neutral color options (Ivory, Beige, Tan, Cream, Brown, Gold, Silver, Bronze)
  - Create VariantOption entries with hex codes: Ivory (#FFFFF0), Beige (#F5F5DC), Tan (#D2B48C), Cream (#FFFDD0), Brown (#A52A2A), Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)
- [ ] **Task 3.15**: Add color swatch image references
  - Add image field to color variant options, reference swatch images in media collection

### Material Options
- [ ] **Task 3.16**: Seed fabric material options (Silk, Cotton, Georgette, Chiffon, Linen, Net, Velvet, Organza, Tussar, Raw Silk)
  - Create VariantOption entries for fabric materials, variantType "material", global
- [ ] **Task 3.17**: Seed jewelry material options (Gold, Silver, Rose Gold, Brass, Copper, Plated, Platinum)
  - Create VariantOption entries for jewelry materials, variantType "material", global
- [ ] **Task 3.18**: Seed leather material options (Leather, Synthetic, Canvas, Fabric)
  - Create VariantOption entries for leather/footwear materials, variantType "material", global
- [ ] **Task 3.19**: Seed pooja material options (Brass, Copper, Silver, Steel, Wood, Clay, Marble, Resin, Stone)
  - Create VariantOption entries for pooja item materials, variantType "material", global
- [ ] **Task 3.20**: Seed home decor material options (Wood, Metal, Brass, Copper, Ceramic, Glass, Resin, Fabric)
  - Create VariantOption entries for home decor materials, variantType "material", global

### Other Variant Options
- [ ] **Task 3.21**: Seed sleeve type options (Sleeveless, Half Sleeve, Full Sleeve, 3/4 Sleeve, Backless)
  - Create VariantOption entries for sleeve types, variantType "sleeveType", global
- [ ] **Task 3.22**: Seed bottom type options (Patiala, Palazzo, Straight, Churidar, Dhoti)
  - Create VariantOption entries for bottom types, variantType "bottomType", global
- [ ] **Task 3.23**: Seed dupatta type options (Heavy Embroidered, Light Embroidered, Plain, Printed)
  - Create VariantOption entries for dupatta types, variantType "dupattaType", global
- [ ] **Task 3.24**: Seed border type options (Heavy Border, Light Border, No Border)
  - Create VariantOption entries for border types, variantType "borderType", global
- [ ] **Task 3.25**: Seed blouse style options (Sleeveless, Half Sleeve, Full Sleeve, Backless)
  - Create VariantOption entries for blouse styles, variantType "blouseStyle", global
- [ ] **Task 3.26**: Seed saree length options (5.5 meters, 6 meters, 6.5 meters)
  - Create VariantOption entries for saree lengths, variantType "sareeLength", global
- [ ] **Task 3.27**: Seed age group options (0-6 months, 6-12 months, 1-2 years, 2-3 years, 3-4 years, 4-5 years, 5-6 years, 6-8 years, 8-10 years, 10-12 years)
  - Create VariantOption entries for age groups, variantType "ageGroup", global
- [ ] **Task 3.28**: Seed bead count options (27 beads, 54 beads, 108 beads, 216 beads)
  - Create VariantOption entries for bead counts, variantType "beadCount", global
- [ ] **Task 3.29**: Seed fragrance options (Rose, Sandalwood, Jasmine, Lavender, Nag Champa, Frankincense)
  - Create VariantOption entries for fragrances, variantType "fragrance", global
- [ ] **Task 3.30**: Seed quantity options (10 sticks, 20 sticks, 50 sticks, 100 sticks, 200 sticks)
  - Create VariantOption entries for quantities, variantType "quantity", global
- [ ] **Task 3.31**: Seed kit type options (Daily Pooja, Festival Pooja, Wedding Pooja, Special Occasion)
  - Create VariantOption entries for kit types, variantType "kitType", global
- [ ] **Task 3.32**: Seed language options (Hindi, English, Sanskrit, Tamil, Telugu, Marathi)
  - Create VariantOption entries for languages, variantType "language", global
- [ ] **Task 3.33**: Seed binding options (Hardcover, Paperback, Spiral)
  - Create VariantOption entries for binding types, variantType "binding", global
- [ ] **Task 3.34**: Seed format options (Book, E-book, Audiobook)
  - Create VariantOption entries for formats, variantType "format", global
- [ ] **Task 3.35**: Seed design options (Traditional, Modern, Contemporary, Antique, Engraved)
  - Create VariantOption entries for design styles, variantType "design", global
- [ ] **Task 3.36**: Seed finish options (Polished, Antique, Matte, Glossy, Natural, Energized)
  - Create VariantOption entries for finish types, variantType "finish", global
- [ ] **Task 3.37**: Add npm script for variant options seed
  - Add `"db:seed:variant-options": "tsx src/seed/seed-variant-options.ts"` to package.json
- [ ] **Task 3.38**: Add logging and error handling to variant options seed
  - Add console logs for progress, success counts, error handling with try-catch

---

## Category Seed File

### Create Main Category Seed File
- [ ] **Task 4.1**: Create `src/seed/seed-categories.ts` file
  - Create new seed file for categories with proper imports and structure
- [ ] **Task 4.2**: Add seed function for main categories
  - Create async function that seeds all 15 main categories using Payload API
- [ ] **Task 4.3**: Add seed function for subcategories
  - Create async function that seeds all subcategories with parent references
- [ ] **Task 4.4**: Add idempotency check for categories
  - Check if category exists by slug before creating, skip if exists
- [ ] **Task 4.5**: Add category data structure
  - Create data arrays for all 15 main categories with names, slugs, descriptions

### Seed Main Categories
- [ ] **Task 4.6**: Seed "Sarees" main category
  - Create Category with name "Sarees", slug "sarees", parent null, description, image
- [ ] **Task 4.7**: Seed "Lehengas" main category
  - Create Category with name "Lehengas", slug "lehengas", parent null, description, image
- [ ] **Task 4.8**: Seed "Salwar Kameez / Suits" main category
  - Create Category with name "Salwar Kameez / Suits", slug "salwar-kameez", parent null, description, image
- [ ] **Task 4.9**: Seed "Kurtas & Kurtis" main category
  - Create Category with name "Kurtas & Kurtis", slug "kurtas-kurtis", parent null, description, image
- [ ] **Task 4.10**: Seed "Indo-Western" main category
  - Create Category with name "Indo-Western", slug "indo-western", parent null, description, image
- [ ] **Task 4.11**: Seed "Blouses / Cholis" main category
  - Create Category with name "Blouses / Cholis", slug "blouses-cholis", parent null, description, image
- [ ] **Task 4.12**: Seed "Dupattas / Stoles" main category
  - Create Category with name "Dupattas / Stoles", slug "dupattas-stoles", parent null, description, image
- [ ] **Task 4.13**: Seed "Accessories" main category
  - Create Category with name "Accessories", slug "accessories", parent null, description, image
- [ ] **Task 4.14**: Seed "Men's Ethnic Wear" main category
  - Create Category with name "Men's Ethnic Wear", slug "mens-ethnic-wear", parent null, description, image
- [ ] **Task 4.15**: Seed "Kids' Ethnic Wear" main category
  - Create Category with name "Kids' Ethnic Wear", slug "kids-ethnic-wear", parent null, description, image
- [ ] **Task 4.16**: Seed "Occasion-Based" main category
  - Create Category with name "Occasion-Based", slug "occasion-based", parent null, description, image
- [ ] **Task 4.17**: Seed "Fabric-Based" main category
  - Create Category with name "Fabric-Based", slug "fabric-based", parent null, description, image
- [ ] **Task 4.18**: Seed "Pooja & Religious Items" main category
  - Create Category with name "Pooja & Religious Items", slug "pooja-religious-items", parent null, description, image
- [ ] **Task 4.19**: Seed "Home & Living" main category
  - Create Category with name "Home & Living", slug "home-living", parent null, description, image
- [ ] **Task 4.20**: Seed "Miscellaneous & Other Items" main category
  - Create Category with name "Miscellaneous & Other Items", slug "miscellaneous", parent null, description, image

### Seed Subcategories (Sarees)
- [ ] **Task 4.21**: Seed "Silk Sarees" subcategory under Sarees
  - Create Category with name "Silk Sarees", slug "silk-sarees", parent "sarees"
- [ ] **Task 4.22**: Seed "Kanchipuram Silk" subcategory under Silk Sarees
  - Create Category with name "Kanchipuram Silk", slug "kanchipuram-silk", parent "silk-sarees"
- [ ] **Task 4.23**: Seed "Banarasi Silk" subcategory under Silk Sarees
  - Create Category with name "Banarasi Silk", slug "banarasi-silk", parent "silk-sarees"
- [ ] **Task 4.24**: Seed "Mysore Silk" subcategory under Silk Sarees
  - Create Category with name "Mysore Silk", slug "mysore-silk", parent "silk-sarees"
- [ ] **Task 4.25**: Seed "Tussar Silk" subcategory under Silk Sarees
  - Create Category with name "Tussar Silk", slug "tussar-silk", parent "silk-sarees"
- [ ] **Task 4.26**: Seed "Raw Silk" subcategory under Silk Sarees
  - Create Category with name "Raw Silk", slug "raw-silk", parent "silk-sarees"
- [ ] **Task 4.27**: Seed "Organza Silk" subcategory under Silk Sarees
  - Create Category with name "Organza Silk", slug "organza-silk", parent "silk-sarees"
- [ ] **Task 4.28**: Seed "Cotton Sarees" subcategory under Sarees
  - Create Category with name "Cotton Sarees", slug "cotton-sarees", parent "sarees"
- [ ] **Task 4.29**: Seed "Handloom Cotton" subcategory under Cotton Sarees
  - Create Category with name "Handloom Cotton", slug "handloom-cotton", parent "cotton-sarees"
- [ ] **Task 4.30**: Seed "Printed Cotton" subcategory under Cotton Sarees
  - Create Category with name "Printed Cotton", slug "printed-cotton", parent "cotton-sarees"
- [ ] **Task 4.31**: Seed "Embroidered Cotton" subcategory under Cotton Sarees
  - Create Category with name "Embroidered Cotton", slug "embroidered-cotton", parent "cotton-sarees"
- [ ] **Task 4.32**: Seed "Khadi Cotton" subcategory under Cotton Sarees
  - Create Category with name "Khadi Cotton", slug "khadi-cotton", parent "cotton-sarees"
- [ ] **Task 4.33**: Seed all remaining Sarees subcategories (Georgette, Chiffon, Linen, Net, Party Wear, Bridal, Casual)
  - Create all subcategories and sub-subcategories for Sarees following the same pattern

### Seed Subcategories (Lehengas)
- [ ] **Task 4.34**: Seed "Bridal Lehengas" subcategory under Lehengas
  - Create Category with name "Bridal Lehengas", slug "bridal-lehengas", parent "lehengas"
- [ ] **Task 4.35**: Seed all Bridal Lehengas sub-subcategories
  - Create Heavy Embroidered, Zari Work, Designer Bridal, Red Bridal, Pink Bridal, Maroon Bridal
- [ ] **Task 4.36**: Seed "Party Wear Lehengas" subcategory under Lehengas
  - Create Category with name "Party Wear Lehengas", slug "party-wear-lehengas", parent "lehengas"
- [ ] **Task 4.37**: Seed all Party Wear Lehengas sub-subcategories
  - Create Designer Lehengas, Embroidered Lehengas, Sequined Lehengas, Anarkali Lehengas
- [ ] **Task 4.38**: Seed all remaining Lehengas subcategories (Casual, Designer, Anarkali, Sharara)
  - Create all subcategories and sub-subcategories for Lehengas following the same pattern

### Seed Subcategories (Salwar Kameez)
- [ ] **Task 4.39**: Seed "Anarkali Suits" subcategory under Salwar Kameez
  - Create Category with name "Anarkali Suits", slug "anarkali-suits", parent "salwar-kameez"
- [ ] **Task 4.40**: Seed all Anarkali Suits sub-subcategories
  - Create Floor Length, Knee Length, Embroidered Anarkali, Printed Anarkali
- [ ] **Task 4.41**: Seed all remaining Salwar Kameez subcategories (Palazzo, Straight Cut, Patiala, Churidar, Pant, Kurti Sets, Casual)
  - Create all subcategories and sub-subcategories for Salwar Kameez following the same pattern

### Seed Subcategories (Remaining Categories)
- [ ] **Task 4.42**: Seed all Kurtas & Kurtis subcategories
  - Create Long Kurtas, Short Kurtis, A-Line, Straight, Anarkali, High-Low, Asymmetric with sub-subcategories
- [ ] **Task 4.43**: Seed all Indo-Western subcategories
  - Create Fusion Dresses, Cape Dresses, Crop Top Sets, Dhoti Pants, Draped Dresses, Jacket Sets with sub-subcategories
- [ ] **Task 4.44**: Seed all Blouses / Cholis subcategories
  - Create Designer, Traditional, Backless, Crop Top, Long Blouses with sub-subcategories
- [ ] **Task 4.45**: Seed all Dupattas / Stoles subcategories
  - Create Embroidered, Printed, Plain, Designer Stoles, Shawls with sub-subcategories
- [ ] **Task 4.46**: Seed all Accessories subcategories
  - Create Jewelry (7 sub-subcategories), Handbags (4), Footwear (4), Hair Accessories (4), Belts (3)
- [ ] **Task 4.47**: Seed all Men's Ethnic Wear subcategories
  - Create Kurtas, Sherwanis, Kurta Sets, Nehru Jackets, Dhotis with sub-subcategories
- [ ] **Task 4.48**: Seed all Kids' Ethnic Wear subcategories
  - Create Girls' Dresses, Boys' Wear, Baby Wear with sub-subcategories
- [ ] **Task 4.49**: Seed all Occasion-Based subcategories
  - Create Wedding, Festival (5 sub-subcategories), Party Wear, Office Wear, Casual Wear with sub-subcategories
- [ ] **Task 4.50**: Seed all Fabric-Based subcategories
  - Create Silk, Cotton, Georgette, Chiffon, Linen Collections with sub-subcategories
- [ ] **Task 4.51**: Seed all Pooja & Religious Items subcategories
  - Create Pooja Thali, Diyas, Incense, Idols, Cloths, Rudraksha, Books, Kits, Other with sub-subcategories
- [ ] **Task 4.52**: Seed all Home & Living subcategories
  - Create Home Decor, Home Textiles, Kitchen Items, Other Home Items with sub-subcategories
- [ ] **Task 4.53**: Seed all Miscellaneous subcategories
  - Create Gift Items, Stationery & Books, Other Items with sub-subcategories
- [ ] **Task 4.54**: Add npm script for categories seed
  - Add `"db:seed:categories": "tsx src/seed/seed-categories.ts"` to package.json
- [ ] **Task 4.55**: Add logging and error handling to categories seed
  - Add console logs for progress, success counts, error handling with try-catch

---

## Category Variant Config Seed File

### Create Variant Config Seed File
- [ ] **Task 5.1**: Create `src/seed/seed-category-variant-config.ts` file
  - Create new seed file for category variant configurations with proper imports
- [ ] **Task 5.2**: Add seed function for variant configs
  - Create async function that updates categories with variantConfig using Payload API
- [ ] **Task 5.3**: Add idempotency check for variant configs
  - Check if category already has variantConfig, update if missing or outdated

### Configure Sarees Variant Config
- [ ] **Task 5.4**: Configure Sarees required variants
  - Update Sarees category with requiredVariants: ["blouseSize", "color"]
- [ ] **Task 5.5**: Configure Sarees optional variants
  - Update Sarees category with optionalVariants: ["material", "sareeLength", "borderType"]
- [ ] **Task 5.6**: Configure Sarees variant options
  - Update Sarees category with variantOptions mapping for all variant types
- [ ] **Task 5.7**: Configure Sarees pricing rules
  - Update Sarees category with pricingRules: basePrice true, colorOverrides for premium colors

### Configure Lehengas Variant Config
- [ ] **Task 5.8**: Configure Lehengas required variants
  - Update Lehengas category with requiredVariants: ["size", "color"]
- [ ] **Task 5.9**: Configure Lehengas optional variants
  - Update Lehengas category with optionalVariants: ["material", "blouseStyle", "dupattaType"]
- [ ] **Task 5.10**: Configure Lehengas variant options
  - Update Lehengas category with variantOptions mapping for all variant types
- [ ] **Task 5.11**: Configure Lehengas pricing rules
  - Update Lehengas category with pricingRules: basePrice true, sizeOverrides, colorOverrides

### Configure Remaining Categories Variant Config
- [ ] **Task 5.12**: Configure Salwar Kameez variant config
  - Update Salwar Kameez category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.13**: Configure Kurtas & Kurtis variant config
  - Update Kurtas & Kurtis category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.14**: Configure Indo-Western variant config
  - Update Indo-Western category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.15**: Configure Blouses / Cholis variant config
  - Update Blouses category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.16**: Configure Dupattas / Stoles variant config
  - Update Dupattas category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.17**: Configure Accessories variant config (per subcategory)
  - Update each Accessories subcategory with appropriate variant config (Jewelry, Handbags, Footwear, etc.)
- [ ] **Task 5.18**: Configure Men's Ethnic Wear variant config
  - Update Men's Wear category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.19**: Configure Kids' Ethnic Wear variant config
  - Update Kids' Wear category with requiredVariants, optionalVariants, variantOptions, pricingRules
- [ ] **Task 5.20**: Configure Occasion-Based variant config
  - Update Occasion-Based category to inherit from parent categories, add occasion pricing overrides
- [ ] **Task 5.21**: Configure Fabric-Based variant config
  - Update Fabric-Based category to inherit from parent categories, pre-select material variant
- [ ] **Task 5.22**: Configure Pooja & Religious Items variant config (per subcategory)
  - Update each Pooja subcategory with appropriate variant config (Thali, Diyas, Incense, Idols, etc.)
- [ ] **Task 5.23**: Configure Home & Living variant config (per subcategory)
  - Update each Home & Living subcategory with appropriate variant config (Decor, Textiles, Kitchen, etc.)
- [ ] **Task 5.24**: Configure Miscellaneous variant config
  - Update Miscellaneous category with flexible variant config for various item types
- [ ] **Task 5.25**: Add npm script for variant config seed
  - Add `"db:seed:category-variant-config": "tsx src/seed/seed-category-variant-config.ts"` to package.json
- [ ] **Task 5.26**: Add logging and error handling to variant config seed
  - Add console logs for progress, success counts, error handling with try-catch

---

## Update Existing Seed Files

### Update seed.ts
- [ ] **Task 6.1**: Remove old categories from seed.ts
  - Remove "Retail" and "Hotelmart" categories from categories array
- [ ] **Task 6.2**: Remove old products from seed.ts
  - Remove all brass statue products from products array
- [ ] **Task 6.3**: Update seed.ts to reference new category seed file
  - Import and call seedCategories from seed-categories.ts instead of inline data
- [ ] **Task 6.4**: Update seed.ts to use new category structure
  - Ensure seed.ts works with new category hierarchy
- [ ] **Task 6.5**: Add sample products for new categories
  - Add sample products for Sarees, Lehengas, Salwar Kameez categories (optional, for testing)

### Update seed-variants.ts
- [ ] **Task 6.6**: Update seed-variants.ts to use category-based variant logic
  - Update variant generation to respect category's requiredVariants and optionalVariants
- [ ] **Task 6.7**: Update seed-variants.ts to use category variant options
  - Use variant options from category variantConfig instead of hardcoded sizes
- [ ] **Task 6.8**: Update seed-variants.ts to apply category pricing rules
  - Apply category pricing rules when generating variant prices
- [ ] **Task 6.9**: Update seed-variants.ts to handle different variant types
  - Handle blouseSize for Sarees, shoeSize for Footwear, ringSize for Rings, etc.
- [ ] **Task 6.10**: Update seed-variants.ts to skip products without category
  - Skip products that don't have valid category assigned

### Update seed-colors.ts
- [ ] **Task 6.11**: Update seed-colors.ts to use variant options from database
  - Fetch color options from VariantOption collection instead of hardcoded array
- [ ] **Task 6.12**: Update seed-colors.ts to include all colors from variant config
  - Include traditional, premium, and neutral colors from complete color list
- [ ] **Task 6.13**: Update seed-colors.ts to apply category color pricing rules
  - Apply category-specific color overrides when calculating color variant prices
- [ ] **Task 6.14**: Update seed-colors.ts to handle category-specific colors
  - Only add colors that are in category's variantOptions for that product's category

### Update seed-prices.ts
- [ ] **Task 6.15**: Update seed-prices.ts to use category pricing rules
  - Apply category pricing rules (sizeOverrides, colorOverrides, materialOverrides) instead of hardcoded logic
- [ ] **Task 6.16**: Update seed-prices.ts to fetch category variant config
  - Fetch category variantConfig for each product to apply correct pricing rules
- [ ] **Task 6.17**: Update seed-prices.ts to handle all variant types
  - Handle blouseSize, shoeSize, ringSize, and other variant types with appropriate pricing
- [ ] **Task 6.18**: Update seed-prices.ts to respect category pricing overrides
  - Use category pricingRules to calculate variant prices instead of generic multipliers

### Update seed-hero-banners.ts
- [ ] **Task 6.19**: Update seed-hero-banners.ts to use new categories
  - Ensure hero banners reference new category structure
- [ ] **Task 6.20**: Update seed-hero-banners.ts to handle category changes
  - Update category references if hero banners depend on specific categories

---

## Seed File Utilities

### Create Utility Functions
- [ ] **Task 7.1**: Create `src/seed/utils/seed-helpers.ts` file
  - Create utility file with common helper functions for seed scripts
- [ ] **Task 7.2**: Add getPayload helper function
  - Create helper function that returns Payload instance for use in seed files
- [ ] **Task 7.3**: Add idempotency check helper
  - Create helper function to check if entity exists before creating (by slug, name, etc.)
- [ ] **Task 7.4**: Add logging helper functions
  - Create helper functions for consistent logging (success, error, skip, progress)
- [ ] **Task 7.5**: Add error handling helper
  - Create helper function for consistent error handling across seed files
- [ ] **Task 7.6**: Add progress tracking helper
  - Create helper function to track and display progress (X/Y completed)

### Create Master Seed File
- [ ] **Task 7.7**: Create `src/seed/seed-all.ts` file
  - Create master seed file that runs all seed files in correct order
- [ ] **Task 7.8**: Add seed execution order logic
  - Order: VariantTypes → VariantOptions → Categories → CategoryVariantConfig → Products → Variants → Colors → Prices
- [ ] **Task 7.9**: Add dependency checking
  - Check that prerequisite data exists before seeding dependent data
- [ ] **Task 7.10**: Add npm script for seed-all
  - Add `"db:seed:all": "tsx src/seed/seed-all.ts"` to package.json
- [ ] **Task 7.11**: Add seed-all logging and summary
  - Add comprehensive logging and summary report for seed-all execution

### Create Cleanup Seed File
- [ ] **Task 7.12**: Create `src/seed/seed-cleanup.ts` file
  - Create cleanup script to remove old/outdated data before seeding new structure
- [ ] **Task 7.13**: Add cleanup for old categories
  - Remove categories that don't match new structure (Retail, Hotelmart)
- [ ] **Task 7.14**: Add cleanup for orphaned products
  - Remove or archive products that don't have valid categories
- [ ] **Task 7.15**: Add cleanup for invalid variants
  - Remove products with invalid variant structures
- [ ] **Task 7.16**: Add cleanup confirmation prompt
  - Add confirmation prompt before cleanup to prevent accidental data loss
- [ ] **Task 7.17**: Add npm script for cleanup
  - Add `"db:seed:cleanup": "tsx src/seed/seed-cleanup.ts"` to package.json

---

## Testing & Validation

### Seed File Testing
- [ ] **Task 8.1**: Test variant types seed file
  - Run seed-variant-types.ts, verify all variant types created correctly
- [ ] **Task 8.2**: Test variant options seed file
  - Run seed-variant-options.ts, verify all variant options created correctly
- [ ] **Task 8.3**: Test categories seed file
  - Run seed-categories.ts, verify all categories and subcategories created correctly
- [ ] **Task 8.4**: Test category variant config seed file
  - Run seed-category-variant-config.ts, verify all variant configs applied correctly
- [ ] **Task 8.5**: Test updated seed-variants.ts
  - Run seed-variants.ts, verify variants created using category-based logic
- [ ] **Task 8.6**: Test updated seed-colors.ts
  - Run seed-colors.ts, verify colors added using variant options from database
- [ ] **Task 8.7**: Test updated seed-prices.ts
  - Run seed-prices.ts, verify prices calculated using category pricing rules
- [ ] **Task 8.8**: Test seed-all.ts master file
  - Run seed-all.ts, verify all seed files execute in correct order without errors

### Data Validation Testing
- [ ] **Task 8.9**: Validate variant types after seeding
  - Query all variant types, verify count matches expected (25 variant types)
- [ ] **Task 8.10**: Validate variant options after seeding
  - Query all variant options, verify count matches expected (100+ options)
- [ ] **Task 8.11**: Validate categories after seeding
  - Query all categories, verify 15 main categories and 200+ subcategories exist
- [ ] **Task 8.12**: Validate category variant configs after seeding
  - Query all categories, verify all have valid variantConfig with requiredVariants
- [ ] **Task 8.13**: Validate category hierarchy after seeding
  - Verify all subcategories have valid parent references, no orphaned categories
- [ ] **Task 8.14**: Validate variant options linked to variant types
  - Verify all variant options have valid variantType references
- [ ] **Task 8.15**: Validate pricing rules structure
  - Verify all category pricingRules have valid structure (basePrice, overrides)

### Integration Testing
- [ ] **Task 8.16**: Test product creation with new category structure
  - Create test product in Sarees category, verify variant options appear correctly
- [ ] **Task 8.17**: Test variant creation with category-based logic
  - Create variants for test product, verify variants use category's required variants
- [ ] **Task 8.18**: Test price calculation with category pricing rules
  - Create product with variants, verify prices calculated using category pricing rules
- [ ] **Task 8.19**: Test frontend category navigation
  - Navigate through category tree on frontend, verify all categories display correctly
- [ ] **Task 8.20**: Test product filtering by category and variants
  - Filter products by category and variants, verify correct products appear

---

## Summary

### ✅ Foundation Tasks
1. **Cleanup** - Review and remove outdated seed data
2. **Variant Types** - Create seed file for all variant types
3. **Variant Options** - Create seed file for all variant options
4. **Categories** - Create seed file for all categories and subcategories

### ⏳ Remaining Tasks
1. **Variant Configs** - Seed category variant configurations
2. **Update Existing** - Update existing seed files to use new structure
3. **Utilities** - Create helper functions and master seed file
4. **Testing** - Test all seed files and validate data

---

**Total Tasks**: 200+
**Estimated Completion**: 
- Phase 1 (Cleanup & New Seed Files) - 3-5 days
- Phase 2 (Update Existing Files) - 2-3 days
- Phase 3 (Utilities & Testing) - 2-3 days

**Last Updated**: 2024-01-30
**Status**: Planning Phase
