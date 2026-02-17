# Seed Scripts

This folder contains all database seeding scripts for the project.

## Available Scripts

### Main Seed Script
```bash
npm run db:seed
```
**File**: `seed.ts`
- Seeds admin user
- Seeds categories and subcategories
- Seeds products
- Seeds tags

### User Seed Script
```bash
npm run db:refresh:users
```
**File**: `seed-users.ts`
- Deletes all existing users
- Creates admin user (admin@example.com / admin123)

### Hero Banners Seed Script
```bash
npm run db:seed:hero-banners
```
**File**: `seed-hero-banners.ts`
- Seeds hero banners with product associations

### Variants Seed Script
```bash
npm run db:seed:variants
```
**File**: `seed-variants.ts`
- Randomly adds size variants (XS, S, M, L, XL, XXL) to existing products
- 70% of products will get variants
- Each variant gets random stock (5-50 units)
- Skips products that already have variants

### Prices Seed Script
```bash
npm run db:seed:prices
```
**File**: `seed-prices.ts`
- Updates base prices for all products (adjusts within ±20% or sets new price $20-$500)
- Updates variant prices for all products with variants
- Applies size-based pricing (XS: -15%, S: -10%, M: base, L: +10%, XL: +20%, XXL: +30%)
- Applies color-based pricing (premium colors like Gold: +15%, Red/Pink: +5%)
- Calculates final variant price = base price × (1 + size multiplier) × (1 + color multiplier)

### Color Variants Seed Script
```bash
npm run db:seed:colors
```
**File**: `seed-colors.ts`
- Adds color variants to all products that don't have color variants yet
- Randomly selects 3-6 colors per product from: Black, White, Red, Blue, Green, Pink, Navy, Brown, Gray, Beige, Gold, Silver
- Sets prices for each color based on color pricing multipliers
- Adds stock (5-50 units) for each color variant
- Preserves existing size variants if present

## Usage

Run any seed script individually:
```bash
npm run db:seed              # Main seed (users, categories, products, tags)
npm run db:seed:variants     # Add variants to products
npm run db:seed:hero-banners # Seed hero banners
npm run db:refresh:users     # Refresh users collection
```

## Notes

- All seed scripts are **idempotent** - safe to run multiple times
- Scripts skip existing data (won't create duplicates)
- Variants script randomly selects which products get variants
- Make sure your database is running before seeding
