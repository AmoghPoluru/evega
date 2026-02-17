import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Common colors for boutique products
 */
const COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Pink",
  "Navy",
  "Brown",
  "Gray",
  "Beige",
  "Gold",
  "Silver",
];

/**
 * Color price multipliers (based on seed-prices.ts logic)
 */
const COLOR_PRICE_MULTIPLIERS: Record<string, number> = {
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
 * Calculates price for a color variant
 */
const calculateColorPrice = (basePrice: number, color: string): number => {
  const multiplier = COLOR_PRICE_MULTIPLIERS[color] || 0;
  return Math.round(basePrice * (1 + multiplier) * 100) / 100;
};

/**
 * Generates random stock quantity between min and max
 */
const getRandomStock = (min: number = 0, max: number = 50): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Randomly selects 3-6 colors for a product
 */
const selectColors = (): string[] => {
  const numColors = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, or 6 colors
  const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
  return shuffledColors.slice(0, numColors);
};

/**
 * Adds color variants to all products
 */
const addColorVariants = async () => {
  try {
    console.log("🌱 Starting color variant seeding...");
    const payload = await getPayload({ config });

    // Get all products
    console.log("📦 Fetching all products...");
    const products = await payload.find({
      collection: "products",
      limit: 1000,
      pagination: false,
    });

    console.log(`Found ${products.docs.length} products\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let totalVariantsAdded = 0;

    for (const product of products.docs) {
      const basePrice = product.price || 0;
      
      if (basePrice === 0) {
        console.log(`⏭️  Skipping ${product.name} - no base price set`);
        skippedCount++;
        continue;
      }

      // Get existing variants
      const existingVariants = product.variants && Array.isArray(product.variants) 
        ? product.variants 
        : [];

      // Check if product already has color variants
      const hasColorVariants = existingVariants.some((v: any) => v.color);
      
      if (hasColorVariants) {
        console.log(`⏭️  Skipping ${product.name} - already has color variants`);
        skippedCount++;
        continue;
      }

      // Select random colors for this product
      const selectedColors = selectColors();
      
      // Create color variants
      const colorVariants = selectedColors.map((color) => ({
        color: color,
        stock: getRandomStock(5, 50), // Stock between 5-50
        price: calculateColorPrice(basePrice, color),
      }));

      // Combine existing variants (if any) with new color variants
      const allVariants = [...existingVariants, ...colorVariants];

      // Update product with color variants
      await payload.update({
        collection: "products",
        id: product.id,
        data: {
          variants: allVariants,
        },
      });

      const colorsList = colorVariants
        .map((v) => `${v.color} ($${v.price.toFixed(2)}, stock: ${v.stock})`)
        .join(", ");

      console.log(`✅ Updated ${product.name}`);
      console.log(`   Added colors: ${colorsList}`);
      console.log(`   Total variants: ${existingVariants.length} existing + ${colorVariants.length} new colors\n`);

      updatedCount++;
      totalVariantsAdded += colorVariants.length;
    }

    console.log("=".repeat(50));
    console.log("✅ Color variant seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} products`);
    console.log(`   - Skipped: ${skippedCount} products`);
    console.log(`   - Total color variants added: ${totalVariantsAdded}`);
    console.log(`   - Total products: ${products.docs.length}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Color variant seeding failed:", error);
    process.exit(1);
  }
};

addColorVariants();
