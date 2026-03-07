# Variant System Data Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VARIANT SYSTEM ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Variant Types│         │Variant Options│         │  Categories  │
│              │         │              │         │              │
│ - Size       │◄────────│ - Small      │         │ - Lehengas   │
│ - Color      │         │ - Medium     │         │ - Sarees     │
│ - Material   │         │ - Red        │         │ - Dresses    │
│ - BlouseSize │         │ - Blue       │         │              │
└──────────────┘         │ - Silk       │         │ variantConfig│
                        │ - Cotton     │         │   ├─ required│
                        │ - 32, 34, 36 │         │   └─ optional│
                        └──────────────┘         └──────────────┘
                              │                         │
                              │                         │
                              └──────────┬──────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │     Products     │
                              │                  │
                              │ variants: [      │
                              │   {              │
                              │     variantData: │
                              │       {          │
                              │         size:    │
                              │         color:   │
                              │       },         │
                              │     stock: 10    │
                              │   }              │
                              │ ]                │
                              └──────────────────┘
```

## Data Storage Locations

### 1. Variant Types (What variants exist)
**Collection**: `variant-types`
**Purpose**: Define variant type definitions

**Example Records**:
```json
{
  "id": "size-type-id",
  "name": "Size",
  "slug": "size",
  "type": "select",
  "displayOrder": 1
}
```

### 2. Variant Options (The dropdown values)
**Collection**: `variant-options`
**Purpose**: Store actual option values (Small, Red, Silk, etc.)

**Example Records**:
```json
// Global Size Options
{
  "value": "Small",
  "label": "Small (S)",
  "variantType": "size-type-id",
  "category": null,  // null = global, available to all categories
  "displayOrder": 1
}

// Category-Specific Blouse Size
{
  "value": "32",
  "variantType": "blouseSize-type-id",
  "category": "sarees-category-id",  // Only for Sarees
  "displayOrder": 1
}

// Color with Hex Code
{
  "value": "Red",
  "label": "Red",
  "variantType": "color-type-id",
  "category": null,
  "hexCode": "#FF0000",
  "displayOrder": 1
}
```

### 3. Category Configuration (Which variants to use)
**Collection**: `categories.variantConfig`
**Purpose**: Link variant types to categories

**Example**:
```json
{
  "name": "Lehengas",
  "variantConfig": {
    "requiredVariants": ["size-type-id", "color-type-id"],
    "optionalVariants": ["material-type-id"],
    "variantOptions": {  // JSON fallback (legacy)
      "size": ["XS", "S", "M", "L"],
      "color": ["Red", "Blue"]
    }
  }
}
```

### 4. Product Variants (Selected values)
**Collection**: `products.variants`
**Purpose**: Store product-specific variant combinations

**Example**:
```json
{
  "name": "Floral Lehenga",
  "category": "lehengas-id",
  "variants": [
    {
      "variantData": {
        "size": "Small",    // ← Value from variant-options
        "color": "Red",     // ← Value from variant-options
        "material": "Silk"  // ← Value from variant-options
      },
      "stock": 10,
      "price": 49.99
    },
    {
      "variantData": {
        "size": "Medium",
        "color": "Red",
        "material": "Silk"
      },
      "stock": 5,
      "price": null  // Uses product base price
    }
  ]
}
```

## Complete Flow: Dress Category Example

### Phase 1: Admin Setup

**Step 1.1**: Create Variant Types
```
Admin → /admin/collections/variant-types
- Create "Size" (slug: "size")
- Create "Color" (slug: "color")
- Create "Material" (slug: "material")
```

**Step 1.2**: Create Variant Options
```
Admin → /admin/collections/variant-options

Size Options (Global):
- Value: "XS", Variant Type: Size, Category: (none/global)
- Value: "S", Variant Type: Size, Category: (none/global)
- Value: "M", Variant Type: Size, Category: (none/global)
- Value: "L", Variant Type: Size, Category: (none/global)
- Value: "XL", Variant Type: Size, Category: (none/global)

Color Options (Global):
- Value: "Red", Variant Type: Color, Hex Code: #FF0000, Category: (none/global)
- Value: "Blue", Variant Type: Color, Hex Code: #0000FF, Category: (none/global)
- Value: "Green", Variant Type: Color, Hex Code: #00FF00, Category: (none/global)

Material Options (Global):
- Value: "Silk", Variant Type: Material, Category: (none/global)
- Value: "Cotton", Variant Type: Material, Category: (none/global)
- Value: "Georgette", Variant Type: Material, Category: (none/global)
```

**Step 1.3**: Configure Category
```
Admin → /admin/collections/categories → Edit "Dresses"

Variant Config:
- Required Variants: [Size, Color]
- Optional Variants: [Material]
```

### Phase 2: Vendor Creates Product

**Step 2.1**: Vendor selects category
```
Vendor → /vendor/products/new
- Selects Category: "Dresses"
```

**Step 2.2**: System fetches variant configuration
```
Frontend calls: trpc.getCategory.useQuery({ id: "dresses-id" })

Backend:
1. Fetches category with variantConfig
2. Gets variant types: [size-id, color-id, material-id]
3. For each variant type, fetches options from variant-options:
   - WHERE variantType = size-id AND (category = null OR category = dresses-id)
   - Returns: [XS, S, M, L, XL]
   - WHERE variantType = color-id AND (category = null OR category = dresses-id)
   - Returns: [Red, Blue, Green]
   - WHERE variantType = material-id AND (category = null OR category = dresses-id)
   - Returns: [Silk, Cotton, Georgette]
```

**Step 2.3**: Vendor sees dynamic dropdowns
```
Product Form shows:
┌─────────────────────────────────────┐
│ Variant 1                          │
├─────────────────────────────────────┤
│ Size *        [Dropdown: XS|S|M|L] │
│ Color *       [Dropdown: Red|Blue]  │
│ Material      [Dropdown: Silk|...]  │
│ Stock:        [10]                  │
│ Price:        [optional]            │
└─────────────────────────────────────┘
```

**Step 2.4**: Vendor creates variants
```
Vendor clicks "Add Variant" and fills:
Variant 1:
- Size: "Small" (selected from dropdown)
- Color: "Red" (selected from dropdown)
- Material: "Silk" (selected from dropdown)
- Stock: 10

Variant 2:
- Size: "Medium"
- Color: "Red"
- Material: "Silk"
- Stock: 5
```

**Step 2.5**: System saves product
```
Product saved with:
{
  "variants": [
    {
      "variantData": {
        "size": "Small",    // ← Stored as string value
        "color": "Red",     // ← Stored as string value
        "material": "Silk"  // ← Stored as string value
      },
      "stock": 10,
      "price": null
    },
    {
      "variantData": {
        "size": "Medium",
        "color": "Red",
        "material": "Silk"
      },
      "stock": 5,
      "price": null
    }
  ]
}
```

### Phase 3: Customer Shopping

**Step 3.1**: Customer views product
```
Customer → /products/[product-id]

System:
1. Loads product with variants
2. Extracts variant types from variantData keys: ["size", "color", "material"]
3. Gets available options from product variants
```

**Step 3.2**: Customer sees variant selectors
```
Product Page shows:
┌─────────────────────────────────────┐
│ Select Size:                        │
│ [Small] [Medium] [Large]            │
│                                      │
│ Select Color:                        │
│ [Red] [Blue]                         │
│                                      │
│ Select Material:                     │
│ [Silk] [Cotton]                      │
└─────────────────────────────────────┘
```

**Step 3.3**: Customer selects variants
```
Customer selects:
- Size: "Small"
- Color: "Red"
- Material: "Silk"
```

**Step 3.4**: System finds matching variant
```
System searches product.variants:
- Finds: variantData: { size: "Small", color: "Red", material: "Silk" }
- Stock: 10
- Price: null (uses product base price)
```

**Step 3.5**: Customer adds to cart
```
Cart stores:
{
  "productId": "product-id",
  "size": "Small",      // For backward compatibility
  "color": "Red",       // For backward compatibility
  "quantity": 1
}
```

## Key Architecture Decisions

### ✅ Centralized Option Management
- All variant option values stored in `variant-options` collection
- Single source of truth for dropdown values
- Easy to update values across all products

### ✅ Global + Category-Specific Options
- **Global options** (`category = null`): Shared across all categories
  - Example: Standard sizes (XS, S, M, L, XL) used by all clothing categories
- **Category-specific** (`category = "id"`): Only for that category
  - Example: BlouseSize (32, 34, 36) only for Sarees category

### ✅ Dynamic Variant Types
- Categories can have any combination of variant types
- No hardcoding - system adapts to category configuration
- Easy to add new variant types without code changes

### ✅ Flexible Storage
- Products store variants as JSON (`variantData`)
- Supports any variant type combination
- No schema changes needed for new variant types

## Summary

**Variant Option Values** (dropdown options) are stored in:
- **Primary**: `variant-options` collection (structured, queryable)
- **Fallback**: `categories.variantConfig.variantOptions` JSON (legacy)

**Selected Values** (what vendor/customer chooses) are stored in:
- `products.variants[].variantData` as JSON object

**The system automatically**:
1. Fetches options from `variant-options` collection
2. Filters by variant type and category
3. Shows dropdowns in ProductForm
4. Stores selected values in product variants
5. Displays selectors on product page
6. Matches selections to inventory
