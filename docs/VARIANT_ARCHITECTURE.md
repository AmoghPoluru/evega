# Variant System Architecture

## Overview

The variant system allows categories to define custom variant types (Size, Color, Material, etc.) with specific values, and products to use these variants for inventory management and customer selection.

## Architecture Components

### 1. Variant Types Collection (`variant-types`)
**Purpose**: Defines the types of variants available (e.g., "Size", "Color", "Material", "BlouseSize")

**Structure**:
```typescript
{
  name: "Size",           // Display name
  slug: "size",           // URL-friendly identifier
  type: "select",        // select | number | text
  displayOrder: 0,       // Order in UI
  description: "..."    // Optional description
}
```

**Examples**:
- `{ name: "Size", slug: "size", type: "select" }`
- `{ name: "Color", slug: "color", type: "select" }`
- `{ name: "Material", slug: "material", type: "select" }`
- `{ name: "Blouse Size", slug: "blouseSize", type: "select" }`

### 2. Variant Options Collection (`variant-options`)
**Purpose**: Stores the actual values for each variant type (e.g., "Small", "Red", "Silk")

**Structure**:
```typescript
{
  value: "Small",                    // The actual value
  label: "Small (S)",               // Optional display label
  variantType: "variant-type-id",    // Links to variant-types
  category: "category-id" | null,    // null = global, set = category-specific
  hexCode: "#FF0000",                // For color variants
  image: "media-id",                 // Optional image/swatch
  displayOrder: 0                    // Order in dropdown
}
```

**Examples**:
- Size options: `{ value: "Small", variantType: "size-id", category: null }` (global)
- Color options: `{ value: "Red", variantType: "color-id", hexCode: "#FF0000" }`
- Category-specific: `{ value: "32", variantType: "blouseSize-id", category: "sarees-id" }`

### 3. Categories Collection (`categories`)
**Purpose**: Defines which variant types are required/optional for products in this category

**Structure**:
```typescript
{
  variantConfig: {
    requiredVariants: ["variant-type-id-1", "variant-type-id-2"],  // Must have
    optionalVariants: ["variant-type-id-3"],                       // Can have
    variantOptions: {                                               // JSON fallback (legacy)
      "size": ["XS", "S", "M", "L"],
      "color": ["Red", "Blue"]
    },
    pricingRules: { ... }
  }
}
```

**Example - Lehengas Category**:
```typescript
{
  name: "Lehengas",
  variantConfig: {
    requiredVariants: ["size-id", "color-id"],
    optionalVariants: ["material-id"],
    // System fetches options from variant-options collection
  }
}
```

### 4. Products Collection (`products`)
**Purpose**: Stores product variants with selected values and inventory

**Structure**:
```typescript
{
  variants: [
    {
      variantData: {                    // Dynamic JSON based on category
        "size": "Small",
        "color": "Red",
        "material": "Silk"
      },
      stock: 10,                         // Inventory count
      price: 49.99                       // Optional variant-specific price
    },
    {
      variantData: {
        "size": "Medium",
        "color": "Red",
        "material": "Silk"
      },
      stock: 5,
      price: null                         // Uses product base price
    }
  ]
}
```

## Data Flow

### Setup Phase (Admin)
1. **Create Variant Types**: Admin creates variant types (Size, Color, Material, etc.)
2. **Create Variant Options**: Admin creates values for each type
   - Global options: `category = null` (available to all categories)
   - Category-specific: `category = "category-id"` (only for that category)
3. **Configure Categories**: Admin assigns variant types to categories
   - Set `requiredVariants` and `optionalVariants`
   - System automatically fetches options from `variant-options` collection

### Product Creation Phase (Vendor)
1. **Vendor selects category**: e.g., "Lehengas"
2. **System fetches category config**: Gets required/optional variant types
3. **System fetches variant options**: For each variant type, gets options from `variant-options` collection
   - Filters by: `variantType = X` AND (`category = null` OR `category = selected-category`)
4. **Vendor creates variants**: Selects values from dropdowns
   - Size dropdown: [XS, S, M, L, XL, 2XL, 3XL] ← from variant-options
   - Color dropdown: [Red, Blue, Green, ...] ← from variant-options
5. **System stores**: Saves as `variantData: { size: "M", color: "Red" }`

### Customer Shopping Phase
1. **Customer views product**: System loads product with variants
2. **System extracts variant types**: From product's `variantData` keys
3. **Customer selects variants**: Chooses Size="M", Color="Red"
4. **System finds matching variant**: Matches `variantData` to find stock/price
5. **Add to cart**: Stores selected values for checkout

## Key Design Decisions

### 1. Two-Tier Storage for Options
- **Primary**: `variant-options` collection (structured, queryable, supports metadata)
- **Fallback**: `categories.variantConfig.variantOptions` JSON (legacy, for quick setup)

**Rationale**: 
- Collection-based allows better management, filtering, and metadata (hexCode, images)
- JSON fallback allows quick seed data setup
- System merges both sources

### 2. Global vs Category-Specific Options
- **Global options** (`category = null`): Available to all categories (e.g., standard sizes: XS, S, M, L)
- **Category-specific** (`category = "id"`): Only for that category (e.g., BlouseSize: 32, 34, 36 for Sarees)

**Rationale**: Reduces duplication while allowing category-specific customization

### 3. Dynamic Variant Data Storage
- Products store variants as `variantData: { [variantTypeSlug]: value }`
- Not hardcoded fields (size, color) but flexible JSON

**Rationale**: Supports any variant type without schema changes

### 4. Variant Matching Logic
- Exact match: All selected variant values must match `variantData`
- Example: Customer selects Size="M", Color="Red" → matches `{ size: "M", color: "Red" }`

## API Endpoints

### Get Category with Variant Config
```
GET /api/trpc/getCategory?input={"id":"category-id"}
```
Returns:
- Category data
- Variant types (required/optional)
- Variant options map (from variant-options collection)

### Get Variant Options
```
GET /api/variant-options?where[variantType][equals]=variant-type-id&where[or][0][category][equals]=null&where[or][1][category][equals]=category-id
```
Returns: Array of option values for a variant type

## Example: Complete Flow

### 1. Admin Setup
```
1. Create Variant Type: { name: "Size", slug: "size" }
2. Create Variant Options:
   - { value: "XS", variantType: "size-id", category: null }
   - { value: "S", variantType: "size-id", category: null }
   - { value: "M", variantType: "size-id", category: null }
   - ...

3. Create Variant Type: { name: "Color", slug: "color" }
4. Create Variant Options:
   - { value: "Red", variantType: "color-id", hexCode: "#FF0000" }
   - { value: "Blue", variantType: "color-id", hexCode: "#0000FF" }
   - ...

5. Configure Category "Lehengas":
   - requiredVariants: [size-id, color-id]
   - optionalVariants: [material-id]
```

### 2. Vendor Creates Product
```
1. Select Category: "Lehengas"
2. System shows:
   - Size dropdown: [XS, S, M, L, XL, 2XL, 3XL]
   - Color dropdown: [Red, Blue, Green, ...]
   - Material dropdown: [Silk, Georgette, ...] (optional)

3. Vendor creates variants:
   Variant 1:
   - Size: "M"
   - Color: "Red"
   - Stock: 10
   
   Variant 2:
   - Size: "L"
   - Color: "Red"
   - Stock: 5
```

### 3. Product Storage
```json
{
  "name": "Floral Lehenga",
  "category": "lehengas-id",
  "variants": [
    {
      "variantData": {
        "size": "M",
        "color": "Red"
      },
      "stock": 10,
      "price": null
    },
    {
      "variantData": {
        "size": "L",
        "color": "Red"
      },
      "stock": 5,
      "price": null
    }
  ]
}
```

### 4. Customer Shopping
```
1. Customer views product
2. Sees variant selectors:
   - Size: [M, L] (only sizes with stock)
   - Color: [Red] (only colors with stock)
3. Selects: Size="M", Color="Red"
4. System finds: variantData: { size: "M", color: "Red" } → stock: 10
5. Adds to cart with selected values
```

## Benefits of This Architecture

1. **Flexibility**: Any category can have any variant types
2. **Scalability**: Add new variant types without code changes
3. **Reusability**: Global options shared across categories
4. **Maintainability**: Centralized option management
5. **User Experience**: Dynamic dropdowns based on category
6. **Inventory Management**: Stock tracked per variant combination

## Migration Notes

- Legacy products may have `variants[].size` and `variants[].color` (hardcoded)
- System converts these to `variantData: { size: "...", color: "..." }` on read
- New products use `variantData` structure exclusively
