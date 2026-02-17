import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Generates a random price between min and max (in USD)
 */
const getRandomPrice = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

/**
 * Price adjustment multipliers for different sizes
 * Based on typical boutique pricing where larger sizes cost more
 */
const SIZE_PRICE_MULTIPLIERS: Record<string, number> = {
  XS: -0.15, // 15% cheaper
  S: -0.10,  // 10% cheaper
  M: 0,      // Base price (no adjustment)
  L: 0.10,   // 10% more expensive
  XL: 0.20,  // 20% more expensive
  XXL: 0.30, // 30% more expensive
};

/**
 * Color price adjustments (some colors are premium)
 */
const COLOR_PRICE_ADJUSTMENTS: Record<string, number> = {
  "Red": 0.05,      // 5% premium
  "Black": 0,       // Base
  "White": 0,       // Base
  "Blue": 0.03,     // 3% premium
  "Green": 0.02,    // 2% premium
  "Pink": 0.05,     // 5% premium
  "Gold": 0.15,     // 15% premium (premium color)
  "Silver": 0.10,   // 10% premium
  "Navy": 0.03,     // 3% premium
  "Beige": -0.02,   // 2% discount
  "Brown": 0,       // Base
  "Gray": 0,        // Base
};

/**
 * Calculates the price for a variant based on color only
 * Sizes don't affect price - only colors do
 */
const calculateVariantPrice = (
  basePrice: number,
  color?: string
): number => {
  let price = basePrice;

  // Only apply color-based pricing (sizes don't affect price)
  if (color && COLOR_PRICE_ADJUSTMENTS[color] !== undefined) {
    price = price * (1 + COLOR_PRICE_ADJUSTMENTS[color]);
  }

  // Round to 2 decimal places
  return Math.round(price * 100) / 100;
};

/**
 * Updates base prices for all products
 * Sets prices in a realistic range for boutique products ($20 - $500)
 */
const updateBasePrices = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Updating base prices for all products...");

  const products = await payload.find({
    collection: "products",
    limit: 1000,
    pagination: false,
  });

  let updatedCount = 0;

  for (const product of products.docs) {
    // Generate a new base price between $20 and $500
    // For existing products, we'll adjust within ±20% of current price or set new price
    const currentPrice = product.price || 0;
    let newPrice: number;

    if (currentPrice > 0) {
      // Adjust existing price by ±20%
      const adjustment = currentPrice * (Math.random() * 0.4 - 0.2); // -20% to +20%
      newPrice = Math.max(20, Math.min(500, currentPrice + adjustment));
    } else {
      // Set new price if product has no price
      newPrice = getRandomPrice(20, 500);
    }

    // Round to 2 decimal places
    newPrice = Math.round(newPrice * 100) / 100;

    await payload.update({
      collection: "products",
      id: product.id,
      data: {
        price: newPrice,
      },
    });

    console.log(`✓ Updated ${product.name}: $${currentPrice.toFixed(2)} → $${newPrice.toFixed(2)}`);
    updatedCount++;
  }

  console.log(`\n✅ Updated base prices for ${updatedCount} products`);
  console.log("=".repeat(50));
};

/**
 * Updates variant price adjustments for all products with variants
 */
const updateVariantPrices = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Updating variant price adjustments...");

  const products = await payload.find({
    collection: "products",
    limit: 1000,
    pagination: false,
    where: {
      variants: {
        exists: true,
      },
    },
  });

  let updatedCount = 0;
  let variantsUpdated = 0;

  for (const product of products.docs) {
    if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      continue;
    }

    const basePrice = product.price || 0;
    if (basePrice === 0) {
      console.log(`⏭️  Skipping ${product.name} - no base price set`);
      continue;
    }

    // Update each variant with price (only for color variants, sizes use base price)
    const updatedVariants = product.variants.map((variant: any) => {
      // Only set price if variant has a color (colors have different prices)
      // Size-only variants don't get a price field (they use base price)
      if (variant.color) {
        const variantPrice = calculateVariantPrice(
          basePrice,
          variant.color
        );

        return {
          ...variant,
          price: variantPrice,
        };
      }

      // Size-only variants: explicitly remove price field (they use base price)
      const { price, ...sizeOnlyVariant } = variant;
      return sizeOnlyVariant;
    });

    await payload.update({
      collection: "products",
      id: product.id,
      data: {
        variants: updatedVariants,
      },
    });

    const variantInfo = updatedVariants
      .map((v: any) => {
        const sizeInfo = v.size ? `Size: ${v.size}` : "";
        const colorInfo = v.color ? `Color: ${v.color}` : "";
        const priceInfo = v.price ? ` $${v.price.toFixed(2)}` : ` $${basePrice.toFixed(2)} (base)`;
        return `${sizeInfo}${colorInfo ? `, ${colorInfo}` : ''}${priceInfo}`;
      })
      .join("; ");

    console.log(`✓ Updated ${product.name} variants: ${variantInfo}`);
    updatedCount++;
    variantsUpdated += updatedVariants.length;
  }

  console.log(`\n✅ Updated prices for ${variantsUpdated} variants across ${updatedCount} products`);
  console.log("=".repeat(50));
};

/**
 * Main seeding function
 */
const seedPrices = async () => {
  try {
    console.log("🌱 Starting price seeding...");
    const payload = await getPayload({ config });

    // Step 1: Update base prices for all products
    await updateBasePrices(payload);

    // Step 2: Update variant price adjustments for products with variants
    await updateVariantPrices(payload);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Price seeding completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Price seeding failed:", error);
    process.exit(1);
  }
};

seedPrices();
