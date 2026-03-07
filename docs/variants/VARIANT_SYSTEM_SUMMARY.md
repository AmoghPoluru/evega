# Variant System - Quick Reference

## Where Variant Values Are Stored

### 1. **Variant Option Values** (The Dropdown Options)
**Location**: `variant-options` collection

**Structure**:
```
variant-options Collection:
├── { value: "Small", variantType: "size-id", category: null }      ← Global
├── { value: "Medium", variantType: "size-id", category: null }     ← Global
├── { value: "Red", variantType: "color-id", hexCode: "#FF0000" }   ← Global
├── { value: "32", variantType: "blouseSize-id", category: "sarees-id" } ← Category-specific
└── ...
```

**Access**: 
- Admin creates these in Payload admin (`/admin/collections/variant-options`)
- System fetches them via `getCategory` tRPC endpoint
- Filtered by: `variantType` AND (`category = null` OR `category = selected-category`)

### 2. **Category Variant Configuration** (Which Types to Use)
**Location**: `categories.variantConfig`

**Structure**:
```
Category "Lehengas":
  variantConfig:
    requiredVariants: [size-id, color-id]     ← Links to variant-types
    optionalVariants: [material-id]
    variantOptions: {                          ← JSON fallback (optional)
      "size": ["XS", "S", "M", "L"],
      "color": ["Red", "Blue"]
    }
```

**Access**: 
- Admin configures in Categories collection
- System uses this to determine which variant types to show

### 3. **Product Variant Values** (Selected Values)
**Location**: `products.variants[].variantData`

**Structure**:
```
Product:
  variants: [
    {
      variantData: {
        "size": "Small",      ← Selected from variant-options
        "color": "Red"        ← Selected from variant-options
      },
      stock: 10,
      price: 49.99
    }
  ]
```

**Access**: 
- Vendors select these in ProductForm dropdowns
- Customers see these on product page
- Stored as JSON for flexibility

## Complete Example: Dress Category

### Step 1: Admin Creates Variant Types
```
1. Create "Size" variant type:
   - name: "Size"
   - slug: "size"
   - type: "select"

2. Create "Color" variant type:
   - name: "Color"
   - slug: "color"
   - type: "select"

3. Create "Material" variant type:
   - name: "Material"
   - slug: "material"
   - type: "select"
```

### Step 2: Admin Creates Variant Options
```
Size Options (Global):
- { value: "XS", variantType: "size-id", category: null }
- { value: "S", variantType: "size-id", category: null }
- { value: "M", variantType: "size-id", category: null }
- { value: "L", variantType: "size-id", category: null }
- { value: "XL", variantType: "size-id", category: null }

Color Options (Global):
- { value: "Red", variantType: "color-id", hexCode: "#FF0000", category: null }
- { value: "Blue", variantType: "color-id", hexCode: "#0000FF", category: null }
- { value: "Green", variantType: "color-id", hexCode: "#00FF00", category: null }

Material Options (Global):
- { value: "Silk", variantType: "material-id", category: null }
- { value: "Cotton", variantType: "material-id", category: null }
- { value: "Georgette", variantType: "material-id", category: null }
```

### Step 3: Admin Configures Category
```
Category: "Dresses"
  variantConfig:
    requiredVariants: [size-id, color-id]
    optionalVariants: [material-id]
```

### Step 4: Vendor Creates Product
```
1. Select Category: "Dresses"
2. System shows dropdowns:
   - Size: [XS, S, M, L, XL] ← from variant-options
   - Color: [Red, Blue, Green] ← from variant-options
   - Material: [Silk, Cotton, Georgette] ← from variant-options (optional)

3. Vendor creates variants:
   Variant 1:
   - Size: "Small"
   - Color: "Red"
   - Material: "Silk"
   - Stock: 10
   
   Variant 2:
   - Size: "Medium"
   - Color: "Red"
   - Material: "Silk"
   - Stock: 5
```

### Step 5: Product Storage
```json
{
  "name": "Floral Dress",
  "category": "dresses-id",
  "variants": [
    {
      "variantData": {
        "size": "Small",
        "color": "Red",
        "material": "Silk"
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

### Step 6: Customer Shopping
```
1. Customer views product page
2. Sees variant selectors:
   - Size dropdown: [Small, Medium] (only sizes with stock)
   - Color dropdown: [Red] (only colors with stock)
   - Material dropdown: [Silk] (only materials with stock)

3. Customer selects: Size="Small", Color="Red", Material="Silk"
4. System finds matching variant → stock: 10
5. Customer adds to cart
```

## Key Points

✅ **Variant option values** are stored in `variant-options` collection  
✅ **Dropdown options** come from `variant-options` collection (filtered by variant type and category)  
✅ **Selected values** are stored in `products.variants[].variantData`  
✅ **System is dynamic** - works with any variant types (Size, Color, Material, BlouseSize, etc.)  
✅ **Global options** (`category = null`) are shared across categories  
✅ **Category-specific options** (`category = "id"`) are only for that category  

## How to Add New Variant Values

### Option 1: Via Payload Admin (Recommended)
1. Go to `/admin/collections/variant-options`
2. Click "Create New"
3. Fill in:
   - **Value**: "Large" (the actual value)
   - **Label**: "Large (L)" (optional display label)
   - **Variant Type**: Select "Size"
   - **Category**: Leave null for global, or select category for specific
   - **Hex Code**: (for colors only)
   - **Display Order**: 0

### Option 2: Via Seed Data
- Add to `src/seed/seed-category-variant-config.ts`
- Run seed script to populate

## How to Add New Variant Type

1. Go to `/admin/collections/variant-types`
2. Create new variant type (e.g., "Sleeve Length")
3. Create variant options for it
4. Add to category's `requiredVariants` or `optionalVariants`
5. Products in that category will now show this variant type
