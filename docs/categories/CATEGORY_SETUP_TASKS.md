# Category & Variant Setup - Comprehensive TODO List

> **Purpose**: This document serves as a comprehensive TODO list for setting up categories, subcategories, and variant configurations for an Indian dress e-commerce marketplace.
>
> **For LLMs**: This file contains detailed task breakdowns for data cleanup, category creation, subcategory setup, and variant configuration. Each task includes completion status and technical details.

## System Overview

**What is This Setup?**
- **Category Structure** - Main categories (Sarees, Lehengas, Salwar Kameez, etc.)
- **Subcategory Structure** - Subcategories under each main category
- **Variant Configuration** - Variant types, options, and rules per category
- **Data Migration** - Cleanup of existing data and creation of new structure

**Key Concepts:**
- **Category Hierarchy**: Main categories → Subcategories → Products
- **Variant Types**: Global variant types (size, color, material, etc.)
- **Variant Options**: Category-specific or global options (S, M, L or 32, 34, 36)
- **Variant Configuration**: Required/optional variants per category with pricing rules

---

## Table of Contents

1. [Data Cleanup](#data-cleanup)
2. [Variant Type Setup](#variant-type-setup)
3. [Variant Option Setup](#variant-option-setup)
4. [Main Categories Creation](#main-categories-creation)
5. [Subcategories Creation](#subcategories-creation)
6. [Variant Configuration](#variant-configuration)
7. [Data Validation](#data-validation)
8. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Data Cleanup

### Existing Data Review
- [ ] **Task 1.1**: Review existing categories in database
  - Query all existing categories, check structure, identify duplicates or inconsistencies
- [ ] **Task 1.2**: Review existing products and their category assignments
  - Query all products, check category relationships, identify orphaned products
- [ ] **Task 1.3**: Review existing variant structures
  - Check current variant implementation, identify what needs migration
- [ ] **Task 1.4**: Backup existing category data
  - Export all category data to JSON/CSV for backup before cleanup
- [ ] **Task 1.5**: Backup existing product data
  - Export all product data including variants for backup before migration

### Data Cleanup Actions
- [ ] **Task 1.6**: Remove duplicate categories
  - Identify and remove duplicate category entries, merge if needed
- [ ] **Task 1.7**: Fix category slug conflicts
  - Ensure all category slugs are unique, update conflicting slugs
- [ ] **Task 1.8**: Fix orphaned products (products without valid category)
  - Assign orphaned products to appropriate categories or mark for review
- [ ] **Task 1.9**: Clean up invalid variant data
  - Remove or fix products with invalid variant structures
- [ ] **Task 1.10**: Archive deprecated categories
  - Archive old categories that won't be used in new structure (don't delete)

---

## Variant Type Setup

### Global Variant Types
- [ ] **Task 2.1**: Create "size" variant type
  - Create VariantType with name "Size", type "select", required false, displayOrder 1
- [ ] **Task 2.2**: Create "blouseSize" variant type
  - Create VariantType with name "Blouse Size", type "select", required false, displayOrder 2
- [ ] **Task 2.3**: Create "color" variant type
  - Create VariantType with name "Color", type "select", required false, displayOrder 3
- [ ] **Task 2.4**: Create "material" variant type
  - Create VariantType with name "Material", type "select", required false, displayOrder 4
- [ ] **Task 2.5**: Create "ringSize" variant type
  - Create VariantType with name "Ring Size", type "select", required false, displayOrder 5
- [ ] **Task 2.6**: Create "shoeSize" variant type
  - Create VariantType with name "Shoe Size", type "select", required false, displayOrder 6
- [ ] **Task 2.7**: Create "length" variant type
  - Create VariantType with name "Length", type "number", unit "inches", required false, displayOrder 7
- [ ] **Task 2.8**: Create "sleeveType" variant type
  - Create VariantType with name "Sleeve Type", type "select", required false, displayOrder 8
- [ ] **Task 2.9**: Create "bottomType" variant type
  - Create VariantType with name "Bottom Type", type "select", required false, displayOrder 9
- [ ] **Task 2.10**: Create "dupattaType" variant type
  - Create VariantType with name "Dupatta Type", type "select", required false, displayOrder 10
- [ ] **Task 2.11**: Create "borderType" variant type
  - Create VariantType with name "Border Type", type "select", required false, displayOrder 11
- [ ] **Task 2.12**: Create "blouseStyle" variant type
  - Create VariantType with name "Blouse Style", type "select", required false, displayOrder 12
- [ ] **Task 2.13**: Create "sareeLength" variant type
  - Create VariantType with name "Saree Length", type "select", required false, displayOrder 13
- [ ] **Task 2.14**: Create "ageGroup" variant type
  - Create VariantType with name "Age Group", type "select", required false, displayOrder 14

---

## Variant Option Setup

### Size Options
- [ ] **Task 3.1**: Create standard size options (XS, S, M, L, XL, 2XL, 3XL)
  - Create VariantOption entries for standard clothing sizes, variantType "size", global (categoryId null)
- [ ] **Task 3.2**: Create blouse size options (32, 34, 36, 38, 40, 42, 44)
  - Create VariantOption entries for blouse sizes, variantType "blouseSize", global
- [ ] **Task 3.3**: Create shoe size options (4, 5, 6, 7, 8, 9, 10)
  - Create VariantOption entries for shoe sizes, variantType "shoeSize", global
- [ ] **Task 3.4**: Create ring size options (5, 6, 7, 8, 9, 10, 11)
  - Create VariantOption entries for ring sizes, variantType "ringSize", global
- [ ] **Task 3.5**: Create plus size options (2XL, 3XL, 4XL)
  - Create VariantOption entries for plus sizes, variantType "size", global
- [ ] **Task 3.6**: Create petite size options (Petite S, Petite M, Petite L)
  - Create VariantOption entries for petite sizes, variantType "size", global
- [ ] **Task 3.7**: Create tall size options (Tall L, Tall XL)
  - Create VariantOption entries for tall sizes, variantType "size", global

### Color Options
- [ ] **Task 3.8**: Create traditional color options (Red, Maroon, Pink, Blue, Green, Yellow, Orange, Purple, Black, White)
  - Create VariantOption entries for traditional colors with hex codes, variantType "color", global
- [ ] **Task 3.9**: Create premium color options (Rose Gold, Champagne, Midnight Blue, Emerald, Ruby Red, Sapphire Blue)
  - Create VariantOption entries for premium colors with hex codes, variantType "color", global
- [ ] **Task 3.10**: Create neutral color options (Ivory, Beige, Tan, Cream, Brown, Gold, Silver, Bronze)
  - Create VariantOption entries for neutral colors with hex codes, variantType "color", global
- [ ] **Task 3.11**: Add color swatch images for all colors
  - Upload or link color swatch images for each color option

### Material Options
- [ ] **Task 3.12**: Create fabric material options (Silk, Cotton, Georgette, Chiffon, Linen, Net, Velvet, Organza)
  - Create VariantOption entries for fabric materials, variantType "material", global
- [ ] **Task 3.13**: Create jewelry material options (Gold, Silver, Rose Gold, Brass, Copper, Plated, Platinum)
  - Create VariantOption entries for jewelry materials, variantType "material", global
- [ ] **Task 3.14**: Create leather material options (Leather, Synthetic, Canvas, Fabric)
  - Create VariantOption entries for leather/footwear materials, variantType "material", global

### Other Variant Options
- [ ] **Task 3.15**: Create sleeve type options (Sleeveless, Half Sleeve, Full Sleeve, 3/4 Sleeve, Backless)
  - Create VariantOption entries for sleeve types, variantType "sleeveType", global
- [ ] **Task 3.16**: Create bottom type options (Patiala, Palazzo, Straight, Churidar, Dhoti)
  - Create VariantOption entries for bottom types, variantType "bottomType", global
- [ ] **Task 3.17**: Create dupatta type options (Heavy Embroidered, Light Embroidered, Plain, Printed)
  - Create VariantOption entries for dupatta types, variantType "dupattaType", global
- [ ] **Task 3.18**: Create border type options (Heavy Border, Light Border, No Border)
  - Create VariantOption entries for border types, variantType "borderType", global
- [ ] **Task 3.19**: Create blouse style options (Sleeveless, Half Sleeve, Full Sleeve, Backless)
  - Create VariantOption entries for blouse styles, variantType "blouseStyle", global
- [ ] **Task 3.20**: Create saree length options (5.5 meters, 6 meters, 6.5 meters)
  - Create VariantOption entries for saree lengths, variantType "sareeLength", global
- [ ] **Task 3.21**: Create age group options (0-6 months, 6-12 months, 1-2 years, 2-3 years, 3-4 years, 4-5 years, 5-6 years, 6-8 years, 8-10 years, 10-12 years)
  - Create VariantOption entries for age groups, variantType "ageGroup", global

---

## Main Categories Creation

### Category 1: Sarees
- [ ] **Task 4.1**: Create "Sarees" main category
  - Create Category with name "Sarees", slug "sarees", parent null, variantConfig with requiredVariants ["blouseSize", "color"]
- [ ] **Task 4.2**: Configure Sarees variant options
  - Set variantOptions for Sarees: blouseSize ["32", "34", "36", "38", "40", "42", "44"], color [all colors], material [Silk, Cotton, Georgette, Chiffon, Linen, Net], sareeLength ["5.5 meters", "6 meters", "6.5 meters"]
- [ ] **Task 4.3**: Configure Sarees pricing rules
  - Set pricingRules for Sarees: basePrice true, no size overrides (sarees typically same price), colorOverrides for premium colors

### Category 2: Lehengas
- [ ] **Task 4.4**: Create "Lehengas" main category
  - Create Category with name "Lehengas", slug "lehengas", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.5**: Configure Lehengas variant options
  - Set variantOptions for Lehengas: size [XS, S, M, L, XL, 2XL, 3XL], color [all colors], material [Silk, Georgette, Chiffon, Net, Velvet], blouseStyle [Sleeveless, Half Sleeve, Full Sleeve, Backless], dupattaType [Heavy Embroidered, Light Embroidered, Plain, Printed]
- [ ] **Task 4.6**: Configure Lehengas pricing rules
  - Set pricingRules for Lehengas: basePrice true, sizeOverrides {XL: +5, 2XL: +10, 3XL: +15}, colorOverrides for premium colors

### Category 3: Salwar Kameez / Suits
- [ ] **Task 4.7**: Create "Salwar Kameez / Suits" main category
  - Create Category with name "Salwar Kameez / Suits", slug "salwar-kameez", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.8**: Configure Salwar Kameez variant options
  - Set variantOptions: size [XS, S, M, L, XL, 2XL, 3XL], color [all colors], material [Cotton, Georgette, Chiffon, Silk, Linen], bottomType [Patiala, Palazzo, Straight, Churidar], dupattaType [Embroidered, Plain, Printed]
- [ ] **Task 4.9**: Configure Salwar Kameez pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +5, 2XL: +10, 3XL: +15}

### Category 4: Kurtas & Kurtis
- [ ] **Task 4.10**: Create "Kurtas & Kurtis" main category
  - Create Category with name "Kurtas & Kurtis", slug "kurtas-kurtis", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.11**: Configure Kurtas & Kurtis variant options
  - Set variantOptions: size [XS, S, M, L, XL, 2XL, 3XL], color [all colors], material [Cotton, Georgette, Chiffon, Linen], length [Short, Medium, Long, Knee Length], sleeveType [Sleeveless, Half Sleeve, Full Sleeve, 3/4 Sleeve]
- [ ] **Task 4.12**: Configure Kurtas & Kurtis pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +3, 2XL: +5, 3XL: +8}

### Category 5: Indo-Western
- [ ] **Task 4.13**: Create "Indo-Western" main category
  - Create Category with name "Indo-Western", slug "indo-western", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.14**: Configure Indo-Western variant options
  - Set variantOptions: size [XS, S, M, L, XL, 2XL, 3XL], color [all colors], material [Cotton, Georgette, Chiffon, Linen, Silk]
- [ ] **Task 4.15**: Configure Indo-Western pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +5, 2XL: +10}

### Category 6: Blouses / Cholis
- [ ] **Task 4.16**: Create "Blouses / Cholis" main category
  - Create Category with name "Blouses / Cholis", slug "blouses-cholis", parent null, variantConfig with requiredVariants ["blouseSize", "color"]
- [ ] **Task 4.17**: Configure Blouses variant options
  - Set variantOptions: blouseSize ["32", "34", "36", "38", "40", "42", "44"], color [all colors], material [Silk, Cotton, Georgette, Chiffon], blouseStyle [Sleeveless, Half Sleeve, Full Sleeve, Backless]
- [ ] **Task 4.18**: Configure Blouses pricing rules
  - Set pricingRules: basePrice true, no size overrides

### Category 7: Dupattas / Stoles
- [ ] **Task 4.19**: Create "Dupattas / Stoles" main category
  - Create Category with name "Dupattas / Stoles", slug "dupattas-stoles", parent null, variantConfig with requiredVariants ["color"]
- [ ] **Task 4.20**: Configure Dupattas variant options
  - Set variantOptions: color [all colors], material [Silk, Cotton, Georgette, Chiffon, Pashmina], length ["2.5 meters", "2.75 meters", "3 meters"], width ["1 meter", "1.25 meters", "1.5 meters"]
- [ ] **Task 4.21**: Configure Dupattas pricing rules
  - Set pricingRules: basePrice true, no size overrides

### Category 8: Accessories
- [ ] **Task 4.22**: Create "Accessories" main category
  - Create Category with name "Accessories", slug "accessories", parent null, variantConfig with requiredVariants [] (varies by subcategory)
- [ ] **Task 4.23**: Configure Accessories variant options (varies by subcategory)
  - Set variantOptions based on subcategory (Jewelry: material, color; Handbags: color, material; Footwear: shoeSize, color; etc.)

### Category 9: Men's Ethnic Wear
- [ ] **Task 4.24**: Create "Men's Ethnic Wear" main category
  - Create Category with name "Men's Ethnic Wear", slug "mens-ethnic-wear", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.25**: Configure Men's Wear variant options
  - Set variantOptions: size [S, M, L, XL, 2XL, 3XL] or chest ["38", "40", "42", "44", "46", "48"], color [all colors], material [Cotton, Linen, Silk]
- [ ] **Task 4.26**: Configure Men's Wear pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +5, 2XL: +10, 3XL: +15}

### Category 10: Kids' Ethnic Wear
- [ ] **Task 4.27**: Create "Kids' Ethnic Wear" main category
  - Create Category with name "Kids' Ethnic Wear", slug "kids-ethnic-wear", parent null, variantConfig with requiredVariants ["size", "color"]
- [ ] **Task 4.28**: Configure Kids' Wear variant options
  - Set variantOptions: size [XS, S, M, L, XL] or ageGroup [0-6 months, 6-12 months, 1-2 years, etc.], color [all colors], material [Cotton, Georgette, Chiffon]
- [ ] **Task 4.29**: Configure Kids' Wear pricing rules
  - Set pricingRules: basePrice true, no size overrides (or minimal)

### Category 11: Occasion-Based
- [ ] **Task 4.30**: Create "Occasion-Based" main category
  - Create Category with name "Occasion-Based", slug "occasion-based", parent null, variantConfig inherited from subcategories
- [ ] **Task 4.31**: Configure Occasion-Based variant options
  - Set variantOptions based on occasion type (Wedding: same as Lehengas/Sarees, Festival: same as main categories, etc.)

### Category 12: Fabric-Based
- [ ] **Task 4.32**: Create "Fabric-Based" main category
  - Create Category with name "Fabric-Based", slug "fabric-based", parent null, variantConfig inherited from subcategories
- [ ] **Task 4.33**: Configure Fabric-Based variant options
  - Set variantOptions based on fabric type (Silk: same as Sarees/Lehengas, Cotton: same as Salwar Kameez, etc.)

---

## Subcategories Creation

### Sarees Subcategories
- [ ] **Task 5.1**: Create "Silk Sarees" subcategory under Sarees
  - Create Category with name "Silk Sarees", slug "silk-sarees", parent "sarees"
- [ ] **Task 5.2**: Create "Kanchipuram Silk" subcategory under Silk Sarees
  - Create Category with name "Kanchipuram Silk", slug "kanchipuram-silk", parent "silk-sarees"
- [ ] **Task 5.3**: Create "Banarasi Silk" subcategory under Silk Sarees
  - Create Category with name "Banarasi Silk", slug "banarasi-silk", parent "silk-sarees"
- [ ] **Task 5.4**: Create "Mysore Silk" subcategory under Silk Sarees
  - Create Category with name "Mysore Silk", slug "mysore-silk", parent "silk-sarees"
- [ ] **Task 5.5**: Create "Tussar Silk" subcategory under Silk Sarees
  - Create Category with name "Tussar Silk", slug "tussar-silk", parent "silk-sarees"
- [ ] **Task 5.6**: Create "Raw Silk" subcategory under Silk Sarees
  - Create Category with name "Raw Silk", slug "raw-silk", parent "silk-sarees"
- [ ] **Task 5.7**: Create "Organza Silk" subcategory under Silk Sarees
  - Create Category with name "Organza Silk", slug "organza-silk", parent "silk-sarees"
- [ ] **Task 5.8**: Create "Cotton Sarees" subcategory under Sarees
  - Create Category with name "Cotton Sarees", slug "cotton-sarees", parent "sarees"
- [ ] **Task 5.9**: Create "Handloom Cotton" subcategory under Cotton Sarees
  - Create Category with name "Handloom Cotton", slug "handloom-cotton", parent "cotton-sarees"
- [ ] **Task 5.10**: Create "Printed Cotton" subcategory under Cotton Sarees
  - Create Category with name "Printed Cotton", slug "printed-cotton", parent "cotton-sarees"
- [ ] **Task 5.11**: Create "Embroidered Cotton" subcategory under Cotton Sarees
  - Create Category with name "Embroidered Cotton", slug "embroidered-cotton", parent "cotton-sarees"
- [ ] **Task 5.12**: Create "Khadi Cotton" subcategory under Cotton Sarees
  - Create Category with name "Khadi Cotton", slug "khadi-cotton", parent "cotton-sarees"
- [ ] **Task 5.13**: Create "Georgette Sarees" subcategory under Sarees
  - Create Category with name "Georgette Sarees", slug "georgette-sarees", parent "sarees"
- [ ] **Task 5.14**: Create "Plain Georgette" subcategory under Georgette Sarees
  - Create Category with name "Plain Georgette", slug "plain-georgette", parent "georgette-sarees"
- [ ] **Task 5.15**: Create "Embroidered Georgette" subcategory under Georgette Sarees
  - Create Category with name "Embroidered Georgette", slug "embroidered-georgette", parent "georgette-sarees"
- [ ] **Task 5.16**: Create "Printed Georgette" subcategory under Georgette Sarees
  - Create Category with name "Printed Georgette", slug "printed-georgette", parent "georgette-sarees"
- [ ] **Task 5.17**: Create "Designer Georgette" subcategory under Georgette Sarees
  - Create Category with name "Designer Georgette", slug "designer-georgette", parent "georgette-sarees"
- [ ] **Task 5.18**: Create "Chiffon Sarees" subcategory under Sarees
  - Create Category with name "Chiffon Sarees", slug "chiffon-sarees", parent "sarees"
- [ ] **Task 5.19**: Create "Plain Chiffon" subcategory under Chiffon Sarees
  - Create Category with name "Plain Chiffon", slug "plain-chiffon", parent "chiffon-sarees"
- [ ] **Task 5.20**: Create "Embroidered Chiffon" subcategory under Chiffon Sarees
  - Create Category with name "Embroidered Chiffon", slug "embroidered-chiffon", parent "chiffon-sarees"
- [ ] **Task 5.21**: Create "Printed Chiffon" subcategory under Chiffon Sarees
  - Create Category with name "Printed Chiffon", slug "printed-chiffon", parent "chiffon-sarees"
- [ ] **Task 5.22**: Create "Designer Chiffon" subcategory under Chiffon Sarees
  - Create Category with name "Designer Chiffon", slug "designer-chiffon", parent "chiffon-sarees"
- [ ] **Task 5.23**: Create "Linen Sarees" subcategory under Sarees
  - Create Category with name "Linen Sarees", slug "linen-sarees", parent "sarees"
- [ ] **Task 5.24**: Create "Handloom Linen" subcategory under Linen Sarees
  - Create Category with name "Handloom Linen", slug "handloom-linen", parent "linen-sarees"
- [ ] **Task 5.25**: Create "Printed Linen" subcategory under Linen Sarees
  - Create Category with name "Printed Linen", slug "printed-linen", parent "linen-sarees"
- [ ] **Task 5.26**: Create "Embroidered Linen" subcategory under Linen Sarees
  - Create Category with name "Embroidered Linen", slug "embroidered-linen", parent "linen-sarees"
- [ ] **Task 5.27**: Create "Net Sarees" subcategory under Sarees
  - Create Category with name "Net Sarees", slug "net-sarees", parent "sarees"
- [ ] **Task 5.28**: Create "Embroidered Net" subcategory under Net Sarees
  - Create Category with name "Embroidered Net", slug "embroidered-net", parent "net-sarees"
- [ ] **Task 5.29**: Create "Sequined Net" subcategory under Net Sarees
  - Create Category with name "Sequined Net", slug "sequined-net", parent "net-sarees"
- [ ] **Task 5.30**: Create "Designer Net" subcategory under Net Sarees
  - Create Category with name "Designer Net", slug "designer-net", parent "net-sarees"
- [ ] **Task 5.31**: Create "Party Wear Sarees" subcategory under Sarees
  - Create Category with name "Party Wear Sarees", slug "party-wear-sarees", parent "sarees"
- [ ] **Task 5.32**: Create "Designer Sarees" subcategory under Party Wear Sarees
  - Create Category with name "Designer Sarees", slug "designer-sarees", parent "party-wear-sarees"
- [ ] **Task 5.33**: Create "Embroidered Sarees" subcategory under Party Wear Sarees
  - Create Category with name "Embroidered Sarees", slug "embroidered-sarees", parent "party-wear-sarees"
- [ ] **Task 5.34**: Create "Sequined Sarees" subcategory under Party Wear Sarees
  - Create Category with name "Sequined Sarees", slug "sequined-sarees", parent "party-wear-sarees"
- [ ] **Task 5.35**: Create "Zari Work Sarees" subcategory under Party Wear Sarees
  - Create Category with name "Zari Work Sarees", slug "zari-work-sarees", parent "party-wear-sarees"
- [ ] **Task 5.36**: Create "Bridal Sarees" subcategory under Sarees
  - Create Category with name "Bridal Sarees", slug "bridal-sarees", parent "sarees"
- [ ] **Task 5.37**: Create "Heavy Embroidered" subcategory under Bridal Sarees
  - Create Category with name "Heavy Embroidered", slug "heavy-embroidered", parent "bridal-sarees"
- [ ] **Task 5.38**: Create "Zari Work" subcategory under Bridal Sarees
  - Create Category with name "Zari Work", slug "zari-work", parent "bridal-sarees"
- [ ] **Task 5.39**: Create "Designer Bridal" subcategory under Bridal Sarees
  - Create Category with name "Designer Bridal", slug "designer-bridal", parent "bridal-sarees"
- [ ] **Task 5.40**: Create "Casual Sarees" subcategory under Sarees
  - Create Category with name "Casual Sarees", slug "casual-sarees", parent "sarees"
- [ ] **Task 5.41**: Create "Daily Wear" subcategory under Casual Sarees
  - Create Category with name "Daily Wear", slug "daily-wear", parent "casual-sarees"
- [ ] **Task 5.42**: Create "Office Wear" subcategory under Casual Sarees
  - Create Category with name "Office Wear", slug "office-wear", parent "casual-sarees"
- [ ] **Task 5.43**: Create "Simple Printed" subcategory under Casual Sarees
  - Create Category with name "Simple Printed", slug "simple-printed", parent "casual-sarees"

### Lehengas Subcategories
- [ ] **Task 5.44**: Create "Bridal Lehengas" subcategory under Lehengas
  - Create Category with name "Bridal Lehengas", slug "bridal-lehengas", parent "lehengas"
- [ ] **Task 5.45**: Create "Heavy Embroidered" subcategory under Bridal Lehengas
  - Create Category with name "Heavy Embroidered", slug "heavy-embroidered-lehengas", parent "bridal-lehengas"
- [ ] **Task 5.46**: Create "Zari Work" subcategory under Bridal Lehengas
  - Create Category with name "Zari Work", slug "zari-work-lehengas", parent "bridal-lehengas"
- [ ] **Task 5.47**: Create "Designer Bridal" subcategory under Bridal Lehengas
  - Create Category with name "Designer Bridal", slug "designer-bridal-lehengas", parent "bridal-lehengas"
- [ ] **Task 5.48**: Create "Red Bridal" subcategory under Bridal Lehengas
  - Create Category with name "Red Bridal", slug "red-bridal", parent "bridal-lehengas"
- [ ] **Task 5.49**: Create "Pink Bridal" subcategory under Bridal Lehengas
  - Create Category with name "Pink Bridal", slug "pink-bridal", parent "bridal-lehengas"
- [ ] **Task 5.50**: Create "Maroon Bridal" subcategory under Bridal Lehengas
  - Create Category with name "Maroon Bridal", slug "maroon-bridal", parent "bridal-lehengas"
- [ ] **Task 5.51**: Create "Party Wear Lehengas" subcategory under Lehengas
  - Create Category with name "Party Wear Lehengas", slug "party-wear-lehengas", parent "lehengas"
- [ ] **Task 5.52**: Create "Designer Lehengas" subcategory under Party Wear Lehengas
  - Create Category with name "Designer Lehengas", slug "designer-lehengas", parent "party-wear-lehengas"
- [ ] **Task 5.53**: Create "Embroidered Lehengas" subcategory under Party Wear Lehengas
  - Create Category with name "Embroidered Lehengas", slug "embroidered-lehengas", parent "party-wear-lehengas"
- [ ] **Task 5.54**: Create "Sequined Lehengas" subcategory under Party Wear Lehengas
  - Create Category with name "Sequined Lehengas", slug "sequined-lehengas", parent "party-wear-lehengas"
- [ ] **Task 5.55**: Create "Anarkali Lehengas" subcategory under Party Wear Lehengas
  - Create Category with name "Anarkali Lehengas", slug "anarkali-lehengas", parent "party-wear-lehengas"
- [ ] **Task 5.56**: Create "Casual Lehengas" subcategory under Lehengas
  - Create Category with name "Casual Lehengas", slug "casual-lehengas", parent "lehengas"
- [ ] **Task 5.57**: Create "Printed Lehengas" subcategory under Casual Lehengas
  - Create Category with name "Printed Lehengas", slug "printed-lehengas", parent "casual-lehengas"
- [ ] **Task 5.58**: Create "Simple Embroidered" subcategory under Casual Lehengas
  - Create Category with name "Simple Embroidered", slug "simple-embroidered", parent "casual-lehengas"
- [ ] **Task 5.59**: Create "Daily Wear" subcategory under Casual Lehengas
  - Create Category with name "Daily Wear", slug "daily-wear-lehengas", parent "casual-lehengas"
- [ ] **Task 5.60**: Create "Designer Lehengas" subcategory under Lehengas
  - Create Category with name "Designer Lehengas", slug "designer-lehengas-main", parent "lehengas"
- [ ] **Task 5.61**: Create "High-End Designer" subcategory under Designer Lehengas
  - Create Category with name "High-End Designer", slug "high-end-designer", parent "designer-lehengas-main"
- [ ] **Task 5.62**: Create "Contemporary Designer" subcategory under Designer Lehengas
  - Create Category with name "Contemporary Designer", slug "contemporary-designer", parent "designer-lehengas-main"
- [ ] **Task 5.63**: Create "Traditional Designer" subcategory under Designer Lehengas
  - Create Category with name "Traditional Designer", slug "traditional-designer", parent "designer-lehengas-main"
- [ ] **Task 5.64**: Create "Anarkali Lehengas" subcategory under Lehengas
  - Create Category with name "Anarkali Lehengas", slug "anarkali-lehengas-main", parent "lehengas"
- [ ] **Task 5.65**: Create "Floor Length" subcategory under Anarkali Lehengas
  - Create Category with name "Floor Length", slug "floor-length", parent "anarkali-lehengas-main"
- [ ] **Task 5.66**: Create "Knee Length" subcategory under Anarkali Lehengas
  - Create Category with name "Knee Length", slug "knee-length", parent "anarkali-lehengas-main"
- [ ] **Task 5.67**: Create "Embroidered Anarkali" subcategory under Anarkali Lehengas
  - Create Category with name "Embroidered Anarkali", slug "embroidered-anarkali", parent "anarkali-lehengas-main"
- [ ] **Task 5.68**: Create "Sharara Lehengas" subcategory under Lehengas
  - Create Category with name "Sharara Lehengas", slug "sharara-lehengas", parent "lehengas"
- [ ] **Task 5.69**: Create "Traditional Sharara" subcategory under Sharara Lehengas
  - Create Category with name "Traditional Sharara", slug "traditional-sharara", parent "sharara-lehengas"
- [ ] **Task 5.70**: Create "Modern Sharara" subcategory under Sharara Lehengas
  - Create Category with name "Modern Sharara", slug "modern-sharara", parent "sharara-lehengas"
- [ ] **Task 5.71**: Create "Embroidered Sharara" subcategory under Sharara Lehengas
  - Create Category with name "Embroidered Sharara", slug "embroidered-sharara", parent "sharara-lehengas"

### Salwar Kameez Subcategories
- [ ] **Task 5.72**: Create "Anarkali Suits" subcategory under Salwar Kameez
  - Create Category with name "Anarkali Suits", slug "anarkali-suits", parent "salwar-kameez"
- [ ] **Task 5.73**: Create "Floor Length" subcategory under Anarkali Suits
  - Create Category with name "Floor Length", slug "floor-length-suits", parent "anarkali-suits"
- [ ] **Task 5.74**: Create "Knee Length" subcategory under Anarkali Suits
  - Create Category with name "Knee Length", slug "knee-length-suits", parent "anarkali-suits"
- [ ] **Task 5.75**: Create "Embroidered Anarkali" subcategory under Anarkali Suits
  - Create Category with name "Embroidered Anarkali", slug "embroidered-anarkali-suits", parent "anarkali-suits"
- [ ] **Task 5.76**: Create "Printed Anarkali" subcategory under Anarkali Suits
  - Create Category with name "Printed Anarkali", slug "printed-anarkali", parent "anarkali-suits"
- [ ] **Task 5.77**: Create "Palazzo Suits" subcategory under Salwar Kameez
  - Create Category with name "Palazzo Suits", slug "palazzo-suits", parent "salwar-kameez"
- [ ] **Task 5.78**: Create "Embroidered Palazzo" subcategory under Palazzo Suits
  - Create Category with name "Embroidered Palazzo", slug "embroidered-palazzo", parent "palazzo-suits"
- [ ] **Task 5.79**: Create "Printed Palazzo" subcategory under Palazzo Suits
  - Create Category with name "Printed Palazzo", slug "printed-palazzo", parent "palazzo-suits"
- [ ] **Task 5.80**: Create "Designer Palazzo" subcategory under Palazzo Suits
  - Create Category with name "Designer Palazzo", slug "designer-palazzo", parent "palazzo-suits"
- [ ] **Task 5.81**: Create "Straight Cut Suits" subcategory under Salwar Kameez
  - Create Category with name "Straight Cut Suits", slug "straight-cut-suits", parent "salwar-kameez"
- [ ] **Task 5.82**: Create "Traditional Straight" subcategory under Straight Cut Suits
  - Create Category with name "Traditional Straight", slug "traditional-straight", parent "straight-cut-suits"
- [ ] **Task 5.83**: Create "Modern Straight" subcategory under Straight Cut Suits
  - Create Category with name "Modern Straight", slug "modern-straight", parent "straight-cut-suits"
- [ ] **Task 5.84**: Create "Embroidered Straight" subcategory under Straight Cut Suits
  - Create Category with name "Embroidered Straight", slug "embroidered-straight", parent "straight-cut-suits"
- [ ] **Task 5.85**: Create "Patiala Suits" subcategory under Salwar Kameez
  - Create Category with name "Patiala Suits", slug "patiala-suits", parent "salwar-kameez"
- [ ] **Task 5.86**: Create "Traditional Patiala" subcategory under Patiala Suits
  - Create Category with name "Traditional Patiala", slug "traditional-patiala", parent "patiala-suits"
- [ ] **Task 5.87**: Create "Modern Patiala" subcategory under Patiala Suits
  - Create Category with name "Modern Patiala", slug "modern-patiala", parent "patiala-suits"
- [ ] **Task 5.88**: Create "Embroidered Patiala" subcategory under Patiala Suits
  - Create Category with name "Embroidered Patiala", slug "embroidered-patiala", parent "patiala-suits"
- [ ] **Task 5.89**: Create "Churidar Suits" subcategory under Salwar Kameez
  - Create Category with name "Churidar Suits", slug "churidar-suits", parent "salwar-kameez"
- [ ] **Task 5.90**: Create "Traditional Churidar" subcategory under Churidar Suits
  - Create Category with name "Traditional Churidar", slug "traditional-churidar", parent "churidar-suits"
- [ ] **Task 5.91**: Create "Embroidered Churidar" subcategory under Churidar Suits
  - Create Category with name "Embroidered Churidar", slug "embroidered-churidar", parent "churidar-suits"
- [ ] **Task 5.92**: Create "Designer Churidar" subcategory under Churidar Suits
  - Create Category with name "Designer Churidar", slug "designer-churidar", parent "churidar-suits"
- [ ] **Task 5.93**: Create "Pant Suits" subcategory under Salwar Kameez
  - Create Category with name "Pant Suits", slug "pant-suits", parent "salwar-kameez"
- [ ] **Task 5.94**: Create "Formal Pant Suits" subcategory under Pant Suits
  - Create Category with name "Formal Pant Suits", slug "formal-pant-suits", parent "pant-suits"
- [ ] **Task 5.95**: Create "Casual Pant Suits" subcategory under Pant Suits
  - Create Category with name "Casual Pant Suits", slug "casual-pant-suits", parent "pant-suits"
- [ ] **Task 5.96**: Create "Embroidered Pant Suits" subcategory under Pant Suits
  - Create Category with name "Embroidered Pant Suits", slug "embroidered-pant-suits", parent "pant-suits"
- [ ] **Task 5.97**: Create "Kurti Sets" subcategory under Salwar Kameez
  - Create Category with name "Kurti Sets", slug "kurti-sets", parent "salwar-kameez"
- [ ] **Task 5.98**: Create "Long Kurti Sets" subcategory under Kurti Sets
  - Create Category with name "Long Kurti Sets", slug "long-kurti-sets", parent "kurti-sets"
- [ ] **Task 5.99**: Create "Short Kurti Sets" subcategory under Kurti Sets
  - Create Category with name "Short Kurti Sets", slug "short-kurti-sets", parent "kurti-sets"
- [ ] **Task 5.100**: Create "Embroidered Kurti Sets" subcategory under Kurti Sets
  - Create Category with name "Embroidered Kurti Sets", slug "embroidered-kurti-sets", parent "kurti-sets"
- [ ] **Task 5.101**: Create "Casual Suits" subcategory under Salwar Kameez
  - Create Category with name "Casual Suits", slug "casual-suits", parent "salwar-kameez"
- [ ] **Task 5.102**: Create "Daily Wear" subcategory under Casual Suits
  - Create Category with name "Daily Wear", slug "daily-wear-suits", parent "casual-suits"
- [ ] **Task 5.103**: Create "Office Wear" subcategory under Casual Suits
  - Create Category with name "Office Wear", slug "office-wear-suits", parent "casual-suits"
- [ ] **Task 5.104**: Create "Simple Printed" subcategory under Casual Suits
  - Create Category with name "Simple Printed", slug "simple-printed-suits", parent "casual-suits"

### Continue for remaining categories...
- [ ] **Task 5.105+**: Create all remaining subcategories for Kurtas & Kurtis, Indo-Western, Blouses, Dupattas, Accessories, Men's Wear, Kids' Wear, Occasion-Based, and Fabric-Based categories
  - Follow same pattern: Create subcategory with name, slug, and parent reference

---

## Variant Configuration

### Sarees Variant Configuration
- [ ] **Task 6.1**: Configure Sarees required variants
  - Set requiredVariants: ["blouseSize", "color"] in Sarees category variantConfig
- [ ] **Task 6.2**: Configure Sarees optional variants
  - Set optionalVariants: ["material", "sareeLength", "borderType"] in Sarees category variantConfig
- [ ] **Task 6.3**: Configure Sarees variant options mapping
  - Map variantOptions for Sarees: blouseSize to blouse size options, color to all color options, material to fabric materials, sareeLength to length options, borderType to border options
- [ ] **Task 6.4**: Configure Sarees pricing rules
  - Set pricingRules: basePrice true, colorOverrides for premium colors (Rose Gold +20, Champagne +15, etc.)

### Lehengas Variant Configuration
- [ ] **Task 6.5**: Configure Lehengas required variants
  - Set requiredVariants: ["size", "color"] in Lehengas category variantConfig
- [ ] **Task 6.6**: Configure Lehengas optional variants
  - Set optionalVariants: ["material", "blouseStyle", "dupattaType"] in Lehengas category variantConfig
- [ ] **Task 6.7**: Configure Lehengas variant options mapping
  - Map variantOptions: size to standard sizes, color to all colors, material to fabrics, blouseStyle to blouse styles, dupattaType to dupatta types
- [ ] **Task 6.8**: Configure Lehengas pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +5, 2XL: +10, 3XL: +15}, colorOverrides for premium colors

### Salwar Kameez Variant Configuration
- [ ] **Task 6.9**: Configure Salwar Kameez required variants
  - Set requiredVariants: ["size", "color"] in Salwar Kameez category variantConfig
- [ ] **Task 6.10**: Configure Salwar Kameez optional variants
  - Set optionalVariants: ["material", "bottomType", "dupattaType"] in Salwar Kameez category variantConfig
- [ ] **Task 6.11**: Configure Salwar Kameez variant options mapping
  - Map variantOptions: size to standard sizes, color to all colors, material to fabrics, bottomType to bottom types, dupattaType to dupatta types
- [ ] **Task 6.12**: Configure Salwar Kameez pricing rules
  - Set pricingRules: basePrice true, sizeOverrides {XL: +5, 2XL: +10, 3XL: +15}

### Continue for all categories...
- [ ] **Task 6.13+**: Configure variant configuration for all remaining categories (Kurtas & Kurtis, Indo-Western, Blouses, Dupattas, Accessories, Men's Wear, Kids' Wear, Occasion-Based, Fabric-Based)
  - Follow same pattern: Set requiredVariants, optionalVariants, variantOptions mapping, pricingRules

---

## Data Validation

### Category Structure Validation
- [ ] **Task 7.1**: Validate all main categories created
  - Query all categories with parent null, verify 12 main categories exist
- [ ] **Task 7.2**: Validate all subcategories created
  - Query all categories with parent not null, verify all subcategories exist
- [ ] **Task 7.3**: Validate category slug uniqueness
  - Check all category slugs are unique across entire category tree
- [ ] **Task 7.4**: Validate category hierarchy integrity
  - Verify all subcategories have valid parent references, no orphaned categories
- [ ] **Task 7.5**: Validate category variantConfig structure
  - Verify all categories have valid variantConfig with requiredVariants and variantOptions

### Variant Configuration Validation
- [ ] **Task 7.6**: Validate variant types exist
  - Verify all variant types referenced in category configs exist in VariantType collection
- [ ] **Task 7.7**: Validate variant options exist
  - Verify all variant options referenced in category configs exist in VariantOption collection
- [ ] **Task 7.8**: Validate pricing rules structure
  - Verify all pricingRules have valid structure (basePrice, sizeOverrides, colorOverrides, etc.)
- [ ] **Task 7.9**: Validate required variants are in variantOptions
  - Verify all requiredVariants have corresponding entries in variantOptions
- [ ] **Task 7.10**: Validate optional variants are in variantOptions
  - Verify all optionalVariants have corresponding entries in variantOptions

### Data Integrity Checks
- [ ] **Task 7.11**: Check for circular category references
  - Verify no category references itself or creates circular parent-child relationships
- [ ] **Task 7.12**: Check for missing category images
  - Verify all categories have appropriate images or placeholders
- [ ] **Task 7.13**: Check for duplicate category names
  - Verify no duplicate category names exist (slugs should be unique)
- [ ] **Task 7.14**: Validate category descriptions
  - Verify all categories have descriptions for SEO and display purposes
- [ ] **Task 7.15**: Check category display order
  - Verify categories have displayOrder set for proper sorting in navigation

---

## Testing & Quality Assurance

### Functional Testing
- [ ] **Task 8.1**: Test category creation via admin panel
  - Create test category through admin panel, verify it appears correctly
- [ ] **Task 8.2**: Test subcategory creation via admin panel
  - Create test subcategory through admin panel, verify parent relationship
- [ ] **Task 8.3**: Test variant configuration in category
  - Configure variants for test category, verify configuration saves correctly
- [ ] **Task 8.4**: Test product creation with category variants
  - Create test product in category, verify variant options appear correctly
- [ ] **Task 8.5**: Test variant price calculation
  - Create product with variants, verify price calculation based on pricing rules
- [ ] **Task 8.6**: Test category navigation on frontend
  - Navigate through category tree on frontend, verify all categories display
- [ ] **Task 8.7**: Test product filtering by category
  - Filter products by category, verify correct products appear
- [ ] **Task 8.8**: Test product filtering by variant
  - Filter products by size, color, material variants, verify correct products appear

### Data Migration Testing
- [ ] **Task 8.9**: Test existing product migration to new categories
  - Migrate existing products to new category structure, verify data integrity
- [ ] **Task 8.10**: Test variant data migration
  - Migrate existing product variants to new variant structure, verify all variants preserved
- [ ] **Task 8.11**: Test category slug updates
  - Update category slugs, verify URLs redirect correctly, products still linked
- [ ] **Task 8.12**: Test backup and restore
  - Backup category data, restore from backup, verify data integrity

### Performance Testing
- [ ] **Task 8.13**: Test category tree loading performance
  - Load full category tree, verify load time is acceptable (< 500ms)
- [ ] **Task 8.14**: Test variant option loading performance
  - Load variant options for category, verify load time is acceptable
- [ ] **Task 8.15**: Test product query with category filters
  - Query products with category filters, verify query performance is acceptable

---

## Complete Variant Configuration Reference

This section provides a complete reference for variant configurations for all categories. Use this as a guide when setting up variant configurations.

### Category 1: Sarees

**Required Variants:**
- `blouseSize`: ["32", "34", "36", "38", "40", "42", "44"]
- `color`: ["Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple", "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne", "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory", "Beige", "Tan", "Cream", "Brown", "Bronze"]

**Optional Variants:**
- `material`: ["Silk", "Cotton", "Georgette", "Chiffon", "Linen", "Net", "Organza", "Tussar", "Raw Silk"]
- `sareeLength`: ["5.5 meters", "6 meters", "6.5 meters"]
- `borderType`: ["Heavy Border", "Light Border", "No Border"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: None (sarees typically same price across sizes)
- Color Overrides: { "Rose Gold": +20, "Champagne": +15, "Midnight Blue": +10, "Emerald": +15, "Ruby Red": +12, "Sapphire Blue": +12 }
- Material Overrides: { "Silk": +10-50 (varies by silk type), "Organza": +15 }

---

### Category 2: Lehengas

**Required Variants:**
- `size`: ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Silk", "Georgette", "Chiffon", "Net", "Velvet", "Organza"]
- `blouseStyle`: ["Sleeveless", "Half Sleeve", "Full Sleeve", "Backless"]
- `dupattaType`: ["Heavy Embroidered", "Light Embroidered", "Plain", "Printed"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "XL": +5, "2XL": +10, "3XL": +15 }
- Color Overrides: { "Rose Gold": +20, "Champagne": +15, "Gold": +10 }
- Material Overrides: { "Silk": +20, "Velvet": +15, "Organza": +10 }

---

### Category 3: Salwar Kameez / Suits

**Required Variants:**
- `size`: ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Georgette", "Chiffon", "Silk", "Linen"]
- `bottomType`: ["Patiala", "Palazzo", "Straight", "Churidar", "Dhoti"]
- `dupattaType`: ["Embroidered", "Plain", "Printed"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "XL": +5, "2XL": +10, "3XL": +15 }
- Color Overrides: { "Rose Gold": +15, "Champagne": +10 }
- Material Overrides: { "Silk": +15, "Linen": +5 }

---

### Category 4: Kurtas & Kurtis

**Required Variants:**
- `size`: ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Georgette", "Chiffon", "Linen"]
- `length`: ["Short", "Medium", "Long", "Knee Length"]
- `sleeveType`: ["Sleeveless", "Half Sleeve", "Full Sleeve", "3/4 Sleeve"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "XL": +3, "2XL": +5, "3XL": +8 }
- Color Overrides: { "Rose Gold": +10, "Champagne": +8 }
- Material Overrides: { "Linen": +5 }

---

### Category 5: Indo-Western

**Required Variants:**
- `size`: ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Georgette", "Chiffon", "Linen", "Silk"]
- `style`: ["Fusion", "Contemporary", "Modern"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "XL": +5, "2XL": +10 }
- Color Overrides: { "Rose Gold": +15, "Champagne": +10 }
- Material Overrides: { "Silk": +20 }

---

### Category 6: Blouses / Cholis

**Required Variants:**
- `blouseSize`: ["32", "34", "36", "38", "40", "42", "44"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Silk", "Cotton", "Georgette", "Chiffon"]
- `blouseStyle`: ["Sleeveless", "Half Sleeve", "Full Sleeve", "Backless"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: None (blouses typically same price)
- Color Overrides: { "Rose Gold": +15, "Champagne": +10, "Gold": +8 }
- Material Overrides: { "Silk": +15 }

---

### Category 7: Dupattas / Stoles

**Required Variants:**
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Silk", "Cotton", "Georgette", "Chiffon", "Pashmina"]
- `length`: ["2.5 meters", "2.75 meters", "3 meters"]
- `width`: ["1 meter", "1.25 meters", "1.5 meters"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: None
- Color Overrides: { "Rose Gold": +10, "Champagne": +8 }
- Material Overrides: { "Pashmina": +30, "Silk": +10 }

---

### Category 8: Accessories

#### 8.1 Jewelry Subcategory

**Required Variants:**
- `material`: ["Gold", "Silver", "Rose Gold", "Brass", "Copper", "Plated", "Platinum"]

**Optional Variants:**
- `color`: ["Gold", "Silver", "Rose Gold", "Copper"]
- `size`: ["Small", "Medium", "Large", "One Size"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Gold": +50-200 (varies), "Platinum": +100-300, "Rose Gold": +20, "Silver": +15 }

#### 8.2 Handbags & Clutches Subcategory

**Required Variants:**
- `color`: ["Black", "Brown", "Navy", "Red", "Beige", "Gold", "Silver"]

**Optional Variants:**
- `material`: ["Leather", "Fabric", "Synthetic", "Embroidered"]
- `size`: ["Small", "Medium", "Large"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Leather": +20, "Embroidered": +15 }

#### 8.3 Footwear Subcategory

**Required Variants:**
- `shoeSize`: ["4", "5", "6", "7", "8", "9", "10"]
- `color`: ["Red", "Blue", "Black", "Brown", "Gold", "Silver"]

**Optional Variants:**
- `material`: ["Leather", "Fabric", "Synthetic"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "10": +5 }
- Material Overrides: { "Leather": +15 }

#### 8.4 Hair Accessories Subcategory

**Required Variants:**
- `color`: ["Gold", "Silver", "Rose Gold", "Black", "Brown"]

**Optional Variants:**
- `material`: ["Metal", "Fabric", "Plastic", "Wood"]
- `size`: ["Small", "Medium", "Large", "One Size"]

**Pricing Rules:**
- Base Price: Yes
- No overrides (low price items)

#### 8.5 Belts & Waistbands Subcategory

**Required Variants:**
- `size`: ["S", "M", "L", "XL", "2XL"]
- `color`: ["Black", "Brown", "Gold", "Silver", "Navy"]

**Optional Variants:**
- `material`: ["Leather", "Fabric", "Embroidered"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Leather": +10, "Embroidered": +8 }

---

### Category 9: Men's Ethnic Wear

**Required Variants:**
- `size`: ["S", "M", "L", "XL", "2XL", "3XL"] OR `chest`: ["38", "40", "42", "44", "46", "48"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Linen", "Silk"]
- `length`: ["Short", "Medium", "Long"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "XL": +5, "2XL": +10, "3XL": +15 }
- Color Overrides: { "Gold": +10 }
- Material Overrides: { "Silk": +20, "Linen": +8 }

---

### Category 10: Kids' Ethnic Wear

**Required Variants:**
- `size`: ["XS", "S", "M", "L", "XL"] OR `ageGroup`: ["0-6 months", "6-12 months", "1-2 years", "2-3 years", "3-4 years", "4-5 years", "5-6 years", "6-8 years", "8-10 years", "10-12 years"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Georgette", "Chiffon"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: None (or minimal)
- Color Overrides: None
- Material Overrides: { "Georgette": +3, "Chiffon": +3 }

---

### Category 11: Occasion-Based

**Variant Configuration:**
- Inherits variant configuration from parent category (Sarees, Lehengas, etc.)
- Same required/optional variants as the main category
- May have additional pricing rules for special occasions

**Pricing Rules:**
- Base Price: Yes
- Occasion Overrides: { "Wedding": +20-50 (varies), "Festival": +10-20 }

---

### Category 12: Fabric-Based

**Variant Configuration:**
- Inherits variant configuration from parent category (Sarees, Lehengas, etc.)
- Material variant is pre-selected based on fabric type
- Same required/optional variants as the main category

**Pricing Rules:**
- Base Price: Yes
- Material is already set, no material overrides needed

---

### Category 13: Pooja & Religious Items

#### 13.1 Pooja Thali & Accessories Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large", "Extra Large"]
- `material`: ["Brass", "Copper", "Silver", "Steel", "Wood", "Clay"]

**Optional Variants:**
- `color`: ["Gold", "Silver", "Copper", "Natural"]
- `design`: ["Traditional", "Modern", "Antique", "Engraved"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "Large": +5, "Extra Large": +10 }
- Material Overrides: { "Silver": +50, "Copper": +10, "Brass": +5 }

#### 13.2 Diyas & Lamps Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large"]
- `material`: ["Brass", "Clay", "Copper", "Steel"]

**Optional Variants:**
- `color`: ["Gold", "Silver", "Natural", "Painted"]
- `type`: ["Single Wick", "Multi Wick", "Electric", "Oil Lamp"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Brass": +3, "Copper": +5 }

#### 13.3 Incense & Fragrance Subcategory

**Required Variants:**
- `fragrance`: ["Rose", "Sandalwood", "Jasmine", "Lavender", "Nag Champa", "Frankincense"]
- `quantity`: ["10 sticks", "20 sticks", "50 sticks", "100 sticks", "200 sticks"]

**Optional Variants:**
- `packaging`: ["Box", "Pouch", "Bulk"]

**Pricing Rules:**
- Base Price: Yes
- Quantity Overrides: { "50 sticks": +2, "100 sticks": +4, "200 sticks": +8 }

#### 13.4 Idols & Statues Subcategory

**Required Variants:**
- `size`: ["Small (3-5 inches)", "Medium (6-10 inches)", "Large (11-15 inches)", "Extra Large (16+ inches)"]
- `material`: ["Brass", "Marble", "Resin", "Wood", "Stone", "Silver"]

**Optional Variants:**
- `color`: ["Gold", "Silver", "Natural", "Painted"]
- `finish`: ["Polished", "Antique", "Matte", "Glossy"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "Medium (6-10 inches)": +20, "Large (11-15 inches)": +50, "Extra Large (16+ inches)": +100 }
- Material Overrides: { "Marble": +30, "Silver": +100, "Brass": +10 }

#### 13.5 Pooja Cloths & Fabrics Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large", "Extra Large"]
- `color`: ["Red", "Yellow", "Orange", "White", "Gold", "Maroon"]

**Optional Variants:**
- `material`: ["Silk", "Cotton", "Georgette", "Chiffon"]
- `design`: ["Plain", "Embroidered", "Printed", "Zari Work"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Silk": +15, "Zari Work": +20 }

#### 13.6 Rudraksha & Beads Subcategory

**Required Variants:**
- `beadCount`: ["27 beads", "54 beads", "108 beads", "216 beads"]
- `material`: ["Rudraksha", "Tulsi", "Sandalwood", "Crystal", "Gemstone"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large"]
- `finish`: ["Natural", "Polished", "Energized"]

**Pricing Rules:**
- Base Price: Yes
- Bead Count Overrides: { "108 beads": +20, "216 beads": +40 }
- Material Overrides: { "Gemstone": +30, "Crystal": +15 }

#### 13.7 Pooja Books & Literature Subcategory

**Required Variants:**
- `language`: ["Hindi", "English", "Sanskrit", "Tamil", "Telugu", "Marathi"]

**Optional Variants:**
- `binding`: ["Hardcover", "Paperback", "Spiral"]
- `format`: ["Book", "E-book", "Audiobook"]

**Pricing Rules:**
- Base Price: Yes
- Binding Overrides: { "Hardcover": +5 }
- Format Overrides: { "E-book": -5, "Audiobook": +10 }

#### 13.8 Pooja Kits & Sets Subcategory

**Required Variants:**
- `kitType`: ["Daily Pooja", "Festival Pooja", "Wedding Pooja", "Special Occasion"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large", "Deluxe"]
- `contents`: ["Basic", "Standard", "Premium", "Complete"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "Large": +10, "Deluxe": +20 }
- Contents Overrides: { "Premium": +15, "Complete": +30 }

#### 13.9 Other Religious Items Subcategory

**Required Variants:**
- `material`: ["Brass", "Copper", "Silver", "Wood", "Stone"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large"]
- `type`: ["Yantra", "Gemstone", "Artifact"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Silver": +50, "Copper": +10 }

---

### Category 14: Home & Living

#### 14.1 Home Decor Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large", "Extra Large", "One Size"]
- `material`: ["Wood", "Metal", "Brass", "Copper", "Ceramic", "Glass", "Resin", "Fabric"]

**Optional Variants:**
- `color`: ["Natural", "Gold", "Silver", "Bronze", "Painted", "Various"]
- `design`: ["Traditional", "Modern", "Contemporary", "Antique"]
- `finish`: ["Polished", "Matte", "Glossy", "Antique"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "Large": +5, "Extra Large": +10 }
- Material Overrides: { "Brass": +10, "Copper": +15, "Silver": +50 }

#### 14.2 Home Textiles Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large", "Extra Large", "King Size", "Queen Size"]
- `color`: [All colors from Sarees list]

**Optional Variants:**
- `material`: ["Cotton", "Silk", "Linen", "Polyester", "Blend"]
- `design`: ["Plain", "Printed", "Embroidered", "Jacquard"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "King Size": +15, "Queen Size": +10 }
- Material Overrides: { "Silk": +20, "Linen": +10 }

#### 14.3 Kitchen Items Subcategory

**Required Variants:**
- `size`: ["Small", "Medium", "Large"]
- `material`: ["Stainless Steel", "Brass", "Copper", "Clay", "Wood", "Ceramic"]

**Optional Variants:**
- `color`: ["Silver", "Gold", "Copper", "Natural"]
- `type`: ["Utensil", "Serving", "Storage"]

**Pricing Rules:**
- Base Price: Yes
- Material Overrides: { "Brass": +10, "Copper": +15 }

#### 14.4 Other Home Items Subcategory

**Required Variants:**
- `type`: ["Lighting", "Accessory"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large"]
- `material`: ["Metal", "Glass", "Fabric", "Plastic"]
- `color`: [Various colors]

**Pricing Rules:**
- Base Price: Yes
- No standard overrides (item-specific)

---

### Category 15: Miscellaneous & Other Items

#### 15.1 Gift Items Subcategory

**Required Variants:**
- `type`: ["Gift Set", "Gift Hamper", "Special Occasion Gift"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large", "Deluxe"]
- `contents`: ["Basic", "Standard", "Premium"]

**Pricing Rules:**
- Base Price: Yes
- Size Overrides: { "Large": +10, "Deluxe": +20 }
- Contents Overrides: { "Premium": +15 }

#### 15.2 Stationery & Books Subcategory

**Required Variants:**
- `type`: ["Notebook", "Pen", "Book"]

**Optional Variants:**
- `size`: ["Small", "Medium", "Large"]
- `color`: [Various colors]
- `material`: ["Paper", "Leather", "Fabric", "Plastic"]

**Pricing Rules:**
- Base Price: Yes
- No standard overrides

#### 15.3 Other Items Subcategory

**Required Variants:**
- None (flexible)

**Optional Variants:**
- `size`: ["Small", "Medium", "Large", "One Size"]
- `color`: [Various colors]
- `material`: [Various materials]
- `type`: [Item-specific]

**Pricing Rules:**
- Base Price: Yes
- No standard overrides (item-specific)

---

## Variant Configuration Summary

### All Variant Types Used:

1. **size** - Standard clothing sizes (XS, S, M, L, XL, 2XL, 3XL)
2. **blouseSize** - Blouse sizes (32, 34, 36, 38, 40, 42, 44)
3. **shoeSize** - Shoe sizes (4, 5, 6, 7, 8, 9, 10)
4. **ringSize** - Ring sizes (5, 6, 7, 8, 9, 10, 11)
5. **color** - All colors (Red, Blue, Green, etc. + Premium colors)
6. **material** - Fabric/material types (Silk, Cotton, Brass, etc.)
7. **sleeveType** - Sleeve styles (Sleeveless, Half Sleeve, Full Sleeve, etc.)
8. **bottomType** - Bottom styles (Patiala, Palazzo, Straight, etc.)
9. **dupattaType** - Dupatta styles (Embroidered, Plain, Printed)
10. **borderType** - Border styles (Heavy Border, Light Border, No Border)
11. **blouseStyle** - Blouse styles (Sleeveless, Backless, etc.)
12. **sareeLength** - Saree lengths (5.5 meters, 6 meters, 6.5 meters)
13. **length** - General length (Short, Medium, Long)
14. **ageGroup** - Age groups for kids (0-6 months, 1-2 years, etc.)
15. **chest** - Chest sizes for men (38, 40, 42, 44, 46, 48)
16. **beadCount** - Bead counts for malas (27, 54, 108, 216)
17. **fragrance** - Fragrance types (Rose, Sandalwood, etc.)
18. **quantity** - Quantity/pack size (10 sticks, 20 sticks, etc.)
19. **kitType** - Kit types (Daily Pooja, Festival Pooja, etc.)
20. **language** - Book languages (Hindi, English, Sanskrit, etc.)
21. **binding** - Book binding types (Hardcover, Paperback, etc.)
22. **format** - Book formats (Book, E-book, Audiobook)
23. **design** - Design styles (Traditional, Modern, etc.)
24. **finish** - Finish types (Polished, Antique, Matte, etc.)
25. **type** - Item-specific types (varies by category)

### Common Pricing Override Patterns:

- **Size Overrides**: XL (+3 to +5), 2XL (+5 to +10), 3XL (+8 to +15)
- **Color Overrides**: Rose Gold (+10 to +20), Champagne (+8 to +15), Gold (+8 to +10)
- **Material Overrides**: 
  - Silk (+10 to +50), Silver (+15 to +100), Brass (+5 to +10), Copper (+10 to +15)
  - Leather (+10 to +20), Marble (+30), Platinum (+100 to +300)

---

## Summary

### ✅ Foundation Tasks
1. **Data Cleanup** - Review, backup, and clean existing data
2. **Variant Type Setup** - Create global variant types
3. **Variant Option Setup** - Create variant options (sizes, colors, materials, etc.)
4. **Main Categories** - Create 12 main categories with variant configs

### ⏳ Remaining Tasks
1. **Subcategories** - Create all subcategories (200+ subcategories)
2. **Variant Configuration** - Configure variants for all categories
3. **Data Validation** - Validate structure and integrity
4. **Testing** - Functional, migration, and performance testing

---

**Total Tasks**: 300+
**Estimated Completion**: Phase 1 (Main categories) - 2-3 days, Phase 2 (Subcategories) - 1-2 weeks, Phase 3 (Validation & Testing) - 3-5 days

**Last Updated**: 2024-01-30
**Status**: Planning Phase
