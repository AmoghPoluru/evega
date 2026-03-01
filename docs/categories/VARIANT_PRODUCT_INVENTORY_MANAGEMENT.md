# Variant-Based Product & Inventory Management Guide

> **Purpose**: This document explains how product variants work in product management and inventory management, including how products are created, how inventory is tracked, and how orders affect stock.

## System Overview

**How Variants Work:**
- Each product can have multiple variants (size + color combinations)
- Each variant has its own stock and optional price
- Inventory is tracked per variant, not per product
- Orders decrement stock from the specific variant purchased

---

## Product Structure with Variants

### Current Product Schema

```typescript
Product {
  id: "product-123"
  name: "Floral Summer Dress"
  basePrice: 49.99
  category: "dresses"
  vendor: "vendor-456"
  
  variants: [
    {
      id: "variant-1"
      size: "S"
      color: "Red"
      stock: 10
      price: null  // Uses basePrice (49.99)
    },
    {
      id: "variant-2"
      size: "M"
      color: "Red"
      stock: 8
      price: null  // Uses basePrice (49.99)
    },
    {
      id: "variant-3"
      size: "XL"
      color: "Red"
      stock: 5
      price: 54.99  // Override: basePrice + 5 (XL size override)
    },
    {
      id: "variant-4"
      size: "S"
      color: "Rose Gold"
      stock: 3
      price: 69.99  // Override: basePrice + 20 (premium color)
    },
    {
      id: "variant-5"
      size: "M"
      color: "Blue"
      stock: 12
      price: null  // Uses basePrice (49.99)
    }
  ]
}
```

---

## Product Management Workflow

### 1. Creating a Product with Variants

#### Step 1: Vendor Selects Category
```
Vendor creates product → Selects "Lehengas" category
System shows: Required variants (size, color), Optional variants (material, blouseStyle)
```

#### Step 2: System Shows Variant Options Based on Category
```
Category: "Lehengas"
Required Variants:
- Size: [XS, S, M, L, XL, 2XL, 3XL]  ← From category variantConfig
- Color: [Red, Blue, Green, ...]      ← From category variantConfig

Optional Variants:
- Material: [Silk, Georgette, Chiffon, Net, Velvet]
- Blouse Style: [Sleeveless, Half Sleeve, Full Sleeve, Backless]
```

#### Step 3: Vendor Creates Variant Combinations
```
Vendor can:
1. Generate all combinations automatically
2. Create variants manually one by one
3. Enable/disable specific combinations

Example: Vendor creates:
- S + Red (stock: 10, price: 49.99)
- M + Red (stock: 8, price: 49.99)
- XL + Red (stock: 5, price: 54.99) ← XL override applied
- S + Rose Gold (stock: 3, price: 69.99) ← Premium color override
- M + Blue (stock: 12, price: 49.99)
```

#### Step 4: System Applies Pricing Rules
```
Base Price: 49.99

Pricing Rules Applied:
- XL size: +5 → 54.99
- Rose Gold color: +20 → 69.99
- Other combinations: Use basePrice (49.99)

Vendor can override any price manually if needed.
```

---

## Inventory Management Workflow

### 1. Stock Tracking Per Variant

**Each variant has its own stock:**
```typescript
Product: "Floral Summer Dress"
variants: [
  { size: "S", color: "Red", stock: 10 },    // 10 units available
  { size: "M", color: "Red", stock: 8 },    // 8 units available
  { size: "XL", color: "Red", stock: 5 },    // 5 units available
  { size: "S", color: "Rose Gold", stock: 3 }, // 3 units available
  { size: "M", color: "Blue", stock: 12 }   // 12 units available
]
```

**Total Product Stock = Sum of all variant stocks:**
```
Total Stock = 10 + 8 + 5 + 3 + 12 = 38 units
```

### 2. Stock Display Logic

**Frontend Display:**
```typescript
// Product page shows:
- Size S + Red: ✅ In Stock (10 available)
- Size M + Red: ✅ In Stock (8 available)
- Size XL + Red: ✅ In Stock (5 available)
- Size S + Rose Gold: ⚠️ Low Stock (3 available)
- Size M + Blue: ✅ In Stock (12 available)
- Size L + Red: ❌ Out of Stock (variant doesn't exist or stock = 0)
```

### 3. Stock Validation Before Purchase

**Checkout Process:**
```typescript
User adds to cart: Size M + Red, Quantity: 2

System checks:
1. Find variant: size="M", color="Red"
2. Check stock: variant.stock = 8
3. Check quantity: 2 <= 8 ✅ (sufficient stock)
4. Allow checkout

If quantity > stock:
❌ Error: "Not enough stock. Only 8 units available."
```

### 4. Stock Update on Order Creation

**When Order is Created (Stripe Webhook):**
```typescript
Order Created:
- Product: "Floral Summer Dress"
- Variant: Size M + Red
- Quantity: 2

Stock Update Process:
1. Find product and variant
2. Current stock: 8
3. New stock: 8 - 2 = 6
4. Update variant stock: 6

Result:
variants: [
  { size: "M", color: "Red", stock: 6 }  // Updated from 8
]
```

**Code Example (from webhook):**
```typescript
// Find matching variant
const variant = product.variants?.find((v: any) => {
  const sizeMatch = !cartItem.size || v.size === cartItem.size;
  const colorMatch = !cartItem.color || v.color === cartItem.color;
  return sizeMatch && colorMatch;
});

// Update stock
if (variant) {
  const newStock = Math.max(0, variant.stock - cartItem.quantity);
  
  // Update variant in product
  const updatedVariants = product.variants.map((v: any) => {
    if (v.id === variant.id) {
      return { ...v, stock: newStock };
    }
    return v;
  });
  
  // Save updated product
  await payload.update({
    collection: "products",
    id: productId,
    data: { variants: updatedVariants }
  });
}
```

---

## Inventory Management Scenarios

### Scenario 1: Adding New Stock

**Vendor adds stock to existing variant:**
```typescript
Current: { size: "M", color: "Red", stock: 6 }
Vendor adds: +10 units
Result: { size: "M", color: "Red", stock: 16 }
```

**Vendor adds new variant:**
```typescript
Current variants: [S+Red, M+Red, XL+Red]
Vendor adds: L + Red, stock: 15
New variants: [S+Red, M+Red, L+Red, XL+Red]
```

### Scenario 2: Low Stock Alerts

**System monitors stock levels:**
```typescript
Low Stock Threshold: 5 units

Variants below threshold:
- S + Rose Gold: 3 units ⚠️ Alert vendor
- XL + Red: 5 units ⚠️ Alert vendor

Alert: "Low stock alert: Floral Summer Dress - S + Rose Gold (3 units remaining)"
```

### Scenario 3: Out of Stock Handling

**When variant stock reaches 0:**
```typescript
Variant: { size: "S", color: "Rose Gold", stock: 0 }

Options:
1. Hide variant from selection (recommended)
2. Show "Out of Stock" badge
3. Allow "Notify Me" option
4. Auto-hide product if all variants out of stock
```

### Scenario 4: Stock Restoration on Cancellation

**When order is canceled:**
```typescript
Order Canceled:
- Product: "Floral Summer Dress"
- Variant: Size M + Red
- Quantity: 2

Stock Restoration:
1. Find variant: Size M + Red
2. Current stock: 6
3. Restore: 6 + 2 = 8
4. Update variant stock: 8
```

---

## Product Management Features

### 1. Variant Generation

**Auto-Generate All Combinations:**
```typescript
Category: "Lehengas"
Required: Size + Color

Sizes: [S, M, L, XL]
Colors: [Red, Blue, Green]

Auto-generate:
- S + Red
- S + Blue
- S + Green
- M + Red
- M + Blue
- M + Green
- L + Red
- L + Blue
- L + Green
- XL + Red
- XL + Blue
- XL + Green

Total: 12 variants generated
Vendor can then:
- Set stock for each
- Set prices (or use base price)
- Disable unwanted combinations
```

### 2. Bulk Stock Update

**Update stock for multiple variants:**
```typescript
Vendor selects:
- All Red variants
- Add 10 units to each

System updates:
- S + Red: +10
- M + Red: +10
- L + Red: +10
- XL + Red: +10
```

### 3. Bulk Price Update

**Update prices for multiple variants:**
```typescript
Vendor selects:
- All XL variants
- Apply +5 price override

System updates:
- XL + Red: 49.99 → 54.99
- XL + Blue: 49.99 → 54.99
- XL + Green: 49.99 → 54.99
```

### 4. Variant-Specific Images

**Different images per color:**
```typescript
Product: "Floral Summer Dress"
variants: [
  { size: "S", color: "Red", stock: 10, image: "/images/dress-red.jpg" },
  { size: "S", color: "Blue", stock: 8, image: "/images/dress-blue.jpg" },
  { size: "S", color: "Green", stock: 5, image: "/images/dress-green.jpg" }
]

Frontend shows:
- Color selector with swatch images
- Main product image changes based on selected color
```

---

## Inventory Reports & Analytics

### 1. Stock Summary Report

**Per Product:**
```
Product: "Floral Summer Dress"
Total Variants: 5
Total Stock: 38 units
Low Stock Variants: 1 (S + Rose Gold: 3 units)
Out of Stock Variants: 0
```

**Per Category:**
```
Category: "Lehengas"
Total Products: 50
Total Variants: 500
Total Stock: 2,500 units
Low Stock Products: 5
Out of Stock Products: 2
```

### 2. Stock Movement Report

**Track stock changes:**
```
Variant: Size M + Red
Date        | Action    | Quantity | Stock Before | Stock After
2024-01-15  | Order     | -2       | 10           | 8
2024-01-16  | Order     | -1       | 8            | 7
2024-01-17  | Restock   | +20      | 7            | 27
2024-01-18  | Order     | -3       | 27           | 24
```

### 3. Best Selling Variants

**Top variants by sales:**
```
1. Size M + Red: 150 units sold
2. Size L + Blue: 120 units sold
3. Size S + Red: 100 units sold
4. Size M + Green: 80 units sold
```

**Insights:**
- Size M is most popular
- Red and Blue are best-selling colors
- Consider increasing stock for popular combinations

---

## Category-Based Variant Management

### How Category Affects Variants

**Example: Sarees Category**
```typescript
Category: "Sarees"
Required Variants: ["blouseSize", "color"]
Optional Variants: ["material", "sareeLength", "borderType"]

When vendor creates product in "Sarees":
1. System shows blouseSize selector: [32, 34, 36, 38, 40, 42, 44]
2. System shows color selector: [All colors]
3. System shows optional: material, sareeLength, borderType
4. Vendor creates variants: blouseSize + color combinations
5. Each variant has: blouseSize, color, stock, price
```

**Example: Pooja Items Category**
```typescript
Category: "Pooja Thali & Accessories"
Required Variants: ["size", "material"]
Optional Variants: ["color", "design"]

When vendor creates product in "Pooja Thali":
1. System shows size selector: [Small, Medium, Large, Extra Large]
2. System shows material selector: [Brass, Copper, Silver, Steel, Wood, Clay]
3. Vendor creates variants: size + material combinations
4. Each variant has: size, material, stock, price
5. Pricing rules: Silver +50, Copper +10, Large +5
```

---

## Order Processing with Variants

### 1. Cart Item Structure

```typescript
CartItem {
  productId: "product-123"
  size: "M"
  color: "Red"
  quantity: 2
  variantPrice: 49.99  // Price at time of adding to cart
}
```

### 2. Checkout Validation

```typescript
Checkout Process:
1. For each cart item:
   a. Find product
   b. Find matching variant (size + color)
   c. Check stock >= quantity
   d. If insufficient: Error "Not enough stock"
   e. If sufficient: Proceed

2. Create Stripe checkout session
3. Include variant info in metadata
```

### 3. Order Creation

```typescript
Order Created:
{
  orderNumber: "ORD-2024-0001"
  product: "product-123"
  variant: {
    size: "M",
    color: "Red"
  }
  quantity: 2
  price: 49.99
  total: 99.98
  status: "payment_done"
}
```

### 4. Stock Update

```typescript
After Order Created:
1. Find variant: Size M + Red
2. Decrement stock: 8 - 2 = 6
3. Update product variants array
4. Save product
```

---

## Best Practices

### 1. Stock Management

✅ **Do:**
- Set realistic stock levels for each variant
- Monitor low stock alerts regularly
- Restock popular variants frequently
- Use bulk update for efficiency

❌ **Don't:**
- Set stock to 0 for variants you plan to restock (use "out of stock" flag instead)
- Forget to update stock after receiving inventory
- Ignore low stock alerts

### 2. Variant Creation

✅ **Do:**
- Create all size + color combinations you plan to sell
- Set prices based on category pricing rules
- Use variant-specific images for different colors
- Enable/disable variants based on availability

❌ **Don't:**
- Create variants you don't have in stock
- Forget to set stock for new variants
- Use inconsistent variant naming

### 3. Pricing

✅ **Do:**
- Use base price + category pricing rules
- Override prices only when necessary
- Keep pricing consistent across similar products
- Document price override reasons

❌ **Don't:**
- Set prices manually for every variant (use rules)
- Forget to update prices when base price changes
- Use inconsistent pricing logic

---

## Technical Implementation

### Product Creation with Variants

```typescript
// Vendor creates product
const product = await payload.create({
  collection: "products",
  data: {
    name: "Floral Summer Dress",
    basePrice: 49.99,
    category: "lehengas",
    vendor: vendorId,
    variants: [
      {
        size: "S",
        color: "Red",
        stock: 10,
        price: null  // Uses basePrice
      },
      {
        size: "M",
        color: "Red",
        stock: 8,
        price: null
      },
      {
        size: "XL",
        color: "Red",
        stock: 5,
        price: 54.99  // Override: basePrice + 5
      }
    ]
  }
});
```

### Stock Update on Order

```typescript
// In webhook after order creation
const variant = product.variants.find(v => 
  v.size === order.size && v.color === order.color
);

if (variant) {
  const newStock = variant.stock - order.quantity;
  
  await payload.update({
    collection: "products",
    id: productId,
    data: {
      variants: product.variants.map(v => 
        v.id === variant.id 
          ? { ...v, stock: newStock }
          : v
      )
    }
  });
}
```

### Stock Validation Before Checkout

```typescript
// In checkout procedure
for (const cartItem of cartItems) {
  const product = await getProduct(cartItem.productId);
  const variant = product.variants.find(v =>
    v.size === cartItem.size && v.color === cartItem.color
  );
  
  if (!variant) {
    throw new Error("Variant not found");
  }
  
  if (variant.stock < cartItem.quantity) {
    throw new Error(`Not enough stock. Only ${variant.stock} available.`);
  }
}
```

---

## Summary

### Key Points:

1. **Variants are stored in product.variants array**
   - Each variant has: size, color, stock, price (optional)

2. **Inventory is tracked per variant**
   - Each variant has its own stock count
   - Stock is decremented when orders are created

3. **Category determines variant requirements**
   - Required variants come from category variantConfig
   - Optional variants can be added

4. **Pricing can be per variant or use base price**
   - Base price + category pricing rules
   - Variant-specific price overrides

5. **Stock updates happen automatically**
   - On order creation (decrement)
   - On order cancellation (restore)
   - On manual stock updates (vendor/admin)

6. **Validation ensures stock availability**
   - Check stock before checkout
   - Prevent overselling
   - Show accurate stock status

---

**Last Updated**: 2024-01-30
**Status**: Implementation Guide
