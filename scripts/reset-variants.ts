import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Script to reset variant system:
 * 1. Clear all existing variant data
 * 2. Create 3 variant types: Size, Color, Material
 * 3. Create standard options for each type
 * 4. Assign these variants to all categories
 * 5. Clear product variants (optional)
 */

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const COLOR_OPTIONS = [
  "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
  "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
  "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
  "Beige", "Tan", "Cream", "Brown", "Bronze"
];
const MATERIAL_OPTIONS = [
  "Silk", "Cotton", "Georgette", "Chiffon", "Linen", "Net", "Organza", 
  "Tussar", "Raw Silk", "Velvet", "Satin", "Polyester", "Rayon"
];

const COLOR_HEX_CODES: Record<string, string> = {
  "Red": "#FF0000",
  "Maroon": "#800000",
  "Pink": "#FFC0CB",
  "Blue": "#0000FF",
  "Green": "#008000",
  "Yellow": "#FFFF00",
  "Orange": "#FFA500",
  "Purple": "#800080",
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#000080",
  "Gold": "#FFD700",
  "Silver": "#C0C0C0",
  "Rose Gold": "#E8B4B8",
  "Champagne": "#F7E7CE",
  "Midnight Blue": "#191970",
  "Emerald": "#50C878",
  "Ruby Red": "#E0115F",
  "Sapphire Blue": "#0F52BA",
  "Ivory": "#FFFFF0",
  "Beige": "#F5F5DC",
  "Tan": "#D2B48C",
  "Cream": "#FFFDD0",
  "Brown": "#A52A2A",
  "Bronze": "#CD7F32"
};

async function resetVariants() {
  console.log("🚀 Starting variant system reset...\n");
  const payload = await getPayload({ config });

  try {
    // Step 1: Clear all existing variant options
    console.log("📋 Step 1: Clearing existing variant options...");
    const existingOptions = await payload.find({
      collection: "variant-options",
      limit: 1000,
      pagination: false,
    });
    
    for (const option of existingOptions.docs) {
      await payload.delete({
        collection: "variant-options",
        id: option.id,
      });
    }
    console.log(`   ✓ Deleted ${existingOptions.docs.length} variant options\n`);

    // Step 2: Clear all existing variant types
    console.log("📋 Step 2: Clearing existing variant types...");
    const existingTypes = await payload.find({
      collection: "variant-types",
      limit: 1000,
      pagination: false,
    });
    
    for (const type of existingTypes.docs) {
      await payload.delete({
        collection: "variant-types",
        id: type.id,
      });
    }
    console.log(`   ✓ Deleted ${existingTypes.docs.length} variant types\n`);

    // Step 3: Create 3 new variant types
    console.log("📋 Step 3: Creating variant types (Size, Color, Material)...");
    
    const sizeType = await payload.create({
      collection: "variant-types",
      data: {
        name: "Size",
        slug: "size",
        type: "select",
        displayOrder: 1,
        description: "Product size variant",
      },
    });
    console.log(`   ✓ Created variant type: Size (${sizeType.id})`);

    const colorType = await payload.create({
      collection: "variant-types",
      data: {
        name: "Color",
        slug: "color",
        type: "select",
        displayOrder: 2,
        description: "Product color variant",
      },
    });
    console.log(`   ✓ Created variant type: Color (${colorType.id})`);

    const materialType = await payload.create({
      collection: "variant-types",
      data: {
        name: "Material",
        slug: "material",
        type: "select",
        displayOrder: 3,
        description: "Product material variant",
      },
    });
    console.log(`   ✓ Created variant type: Material (${materialType.id})\n`);

    // Step 4: Create variant options for Size
    console.log("📋 Step 4: Creating Size options...");
    let sizeOptionCount = 0;
    for (let i = 0; i < SIZE_OPTIONS.length; i++) {
      await payload.create({
        collection: "variant-options",
        data: {
          value: SIZE_OPTIONS[i],
          label: SIZE_OPTIONS[i],
          variantType: sizeType.id,
          category: null, // Global
          displayOrder: i,
        },
      });
      sizeOptionCount++;
    }
    console.log(`   ✓ Created ${sizeOptionCount} size options\n`);

    // Step 5: Create variant options for Color
    console.log("📋 Step 5: Creating Color options...");
    let colorOptionCount = 0;
    for (let i = 0; i < COLOR_OPTIONS.length; i++) {
      const color = COLOR_OPTIONS[i];
      await payload.create({
        collection: "variant-options",
        data: {
          value: color,
          label: color,
          variantType: colorType.id,
          category: null, // Global
          hexCode: COLOR_HEX_CODES[color] || null,
          displayOrder: i,
        },
      });
      colorOptionCount++;
    }
    console.log(`   ✓ Created ${colorOptionCount} color options\n`);

    // Step 6: Create variant options for Material
    console.log("📋 Step 6: Creating Material options...");
    let materialOptionCount = 0;
    for (let i = 0; i < MATERIAL_OPTIONS.length; i++) {
      await payload.create({
        collection: "variant-options",
        data: {
          value: MATERIAL_OPTIONS[i],
          label: MATERIAL_OPTIONS[i],
          variantType: materialType.id,
          category: null, // Global
          displayOrder: i,
        },
      });
      materialOptionCount++;
    }
    console.log(`   ✓ Created ${materialOptionCount} material options\n`);

    // Step 7: Update all categories to use these 3 variant types
    console.log("📋 Step 7: Updating all categories...");
    const categories = await payload.find({
      collection: "categories",
      limit: 1000,
      pagination: false,
    });

    let updatedCategoryCount = 0;
    for (const category of categories.docs) {
      await payload.update({
        collection: "categories",
        id: category.id,
        data: {
          variantConfig: {
            requiredVariants: [sizeType.id, colorType.id],
            optionalVariants: [materialType.id],
            variantOptions: {
              size: SIZE_OPTIONS,
              color: COLOR_OPTIONS,
              material: MATERIAL_OPTIONS,
            },
            pricingRules: {
              basePrice: true,
            },
          },
        },
      });
      updatedCategoryCount++;
      console.log(`   ✓ Updated category: ${category.name}`);
    }
    console.log(`\n   ✓ Updated ${updatedCategoryCount} categories\n`);

    // Step 8: Clear product variants (optional - uncomment if needed)
    console.log("📋 Step 8: Clearing product variants...");
    const products = await payload.find({
      collection: "products",
      limit: 1000,
      pagination: false,
    });

    let clearedProductCount = 0;
    for (const product of products.docs) {
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        await payload.update({
          collection: "products",
          id: product.id,
          data: {
            variants: [], // Clear all variants
          },
        });
        clearedProductCount++;
      }
    }
    console.log(`   ✓ Cleared variants from ${clearedProductCount} products\n`);

    console.log("✅ Variant system reset complete!");
    console.log("\n📊 Summary:");
    console.log(`   - Created 3 variant types: Size, Color, Material`);
    console.log(`   - Created ${sizeOptionCount} size options`);
    console.log(`   - Created ${colorOptionCount} color options`);
    console.log(`   - Created ${materialOptionCount} material options`);
    console.log(`   - Updated ${updatedCategoryCount} categories`);
    console.log(`   - Cleared variants from ${clearedProductCount} products`);
    console.log("\n✨ All categories now use: Size (required), Color (required), Material (optional)");

  } catch (error) {
    console.error("❌ Error resetting variants:", error);
    throw error;
  }

  process.exit(0);
}

resetVariants();
