import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Generates random stock quantity between min and max
 */
const getRandomStock = (min: number = 0, max: number = 50): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Randomly decides if a product should have variants
 * 70% chance of having variants (for boutique products)
 */
const shouldHaveVariants = (): boolean => {
  return Math.random() < 0.7;
};

/**
 * Generates random price adjustment (-20% to +30% of base price)
 */
const getRandomPriceAdjustment = (basePrice: number): number => {
  // Random adjustment between -20% and +30%
  const adjustmentPercent = (Math.random() * 0.5 - 0.2); // -0.2 to 0.3
  return Math.round(basePrice * adjustmentPercent * 100) / 100; // Round to 2 decimals
};

/**
 * Size ranges for different product types
 */
const SIZE_RANGES = {
  small: ["XS", "S", "M"],
  medium: ["S", "M", "L"],
  large: ["M", "L", "XL", "XXL"],
  full: ["XS", "S", "M", "L", "XL", "XXL"],
  petite: ["XS", "S"],
  plus: ["L", "XL", "XXL"],
};

/**
 * Generates random variants for a product
 * Randomly selects a size range and then picks 2-4 sizes from that range
 */
const generateVariants = (basePrice: number) => {
  // Randomly select a size range category
  const rangeKeys = Object.keys(SIZE_RANGES);
  const randomRangeKey = rangeKeys[Math.floor(Math.random() * rangeKeys.length)] as keyof typeof SIZE_RANGES;
  const sizeRange = SIZE_RANGES[randomRangeKey];
  
  // From the selected range, randomly pick 2-4 sizes (or all if range is smaller)
  const numSizesToPick = Math.min(
    Math.floor(Math.random() * 3) + 2, // 2, 3, or 4 sizes
    sizeRange.length // Don't exceed the range size
  );
  
  const selectedSizes = sizeRange
    .sort(() => Math.random() - 0.5)
    .slice(0, numSizesToPick);
  
  return selectedSizes.map((size) => {
    // Sizes only affect stock, not price
    // Price is determined by color selection
    return {
      size: size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
      stock: getRandomStock(5, 50), // Stock between 5-50
      // No price field - sizes use base price, colors have their own prices
    };
  });
};

const seedVariants = async () => {
  try {
    console.log("🌱 Starting variant seeding...");
    const payload = await getPayload({ config });

    // Get all products
    console.log("📦 Fetching all products...");
    const products = await payload.find({
      collection: "products",
      limit: 1000, // Adjust if you have more products
      pagination: false,
    });

    console.log(`Found ${products.docs.length} products`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products.docs) {
      const existingVariants = product.variants && Array.isArray(product.variants) 
        ? product.variants 
        : [];
      
      // Check if product already has size variants
      const hasSizeVariants = existingVariants.some((v: any) => v.size);
      
      if (hasSizeVariants) {
        console.log(`⏭️  Skipping ${product.name} - already has size variants`);
        skippedCount++;
        continue;
      }

      // If product has color variants but no size variants, we'll add size variants
      // If product has no variants at all, randomly decide if it should have variants
      const hasColorVariants = existingVariants.some((v: any) => v.color);
      
      if (!hasColorVariants && !shouldHaveVariants()) {
        console.log(`⏭️  Skipping ${product.name} - randomly selected to not have variants`);
        skippedCount++;
        continue;
      }

      const basePrice = product.price || 0;
      if (basePrice === 0) {
        console.log(`⏭️  Skipping ${product.name} - no base price set`);
        skippedCount++;
        continue;
      }

      // Generate size variants
      const sizeVariants = generateVariants(basePrice);
      
      // If product has color variants, create size+color combinations
      // Otherwise, just add size variants
      let newVariants: any[] = [];
      
      if (hasColorVariants) {
        // Create size+color combinations for each existing color
        const existingColors = existingVariants
          .filter((v: any) => v.color)
          .map((v: any) => ({ color: v.color, price: v.price }));
        
        for (const sizeVariant of sizeVariants) {
          for (const colorVariant of existingColors) {
            newVariants.push({
              size: sizeVariant.size,
              color: colorVariant.color,
              stock: getRandomStock(5, 50), // Stock for this size+color combo
              price: colorVariant.price, // Price comes from color
            });
          }
        }
        
        // Remove old color-only variants and add new size+color combinations
        const updatedVariants = [
          ...existingVariants.filter((v: any) => !v.color), // Keep any non-color variants
          ...newVariants
        ];
        
        await payload.update({
          collection: "products",
          id: product.id,
          data: {
            variants: updatedVariants,
          },
        });
        
        const sizeColorInfo = `${sizeVariants.length} sizes × ${existingColors.length} colors = ${newVariants.length} combinations`;
        console.log(`✅ Updated ${product.name} - Added size variants to existing colors: ${sizeColorInfo}`);
      } else {
        // No color variants, just add size variants
        await payload.update({
          collection: "products",
          id: product.id,
          data: {
            variants: sizeVariants,
          },
        });
        
        const sizesList = sizeVariants.map((v) => {
          return `${v.size} (stock: ${v.stock})`;
        }).join(", ");
        console.log(`✅ Updated ${product.name} - Added size variants: ${sizesList}`);
      }
      
      updatedCount++;
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Variant seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} products`);
    console.log(`   - Skipped: ${skippedCount} products`);
    console.log(`   - Total: ${products.docs.length} products`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Variant seeding failed:", error);
    process.exit(1);
  }
};

seedVariants();
