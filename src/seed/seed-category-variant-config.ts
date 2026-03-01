import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  entityExistsBySlug,
  logSuccess,
  logError,
  logSkip,
  logSection,
  ProgressTracker,
} from "./utils/seed-helpers";

interface VariantConfig {
  requiredVariants: string[];
  optionalVariants: string[];
  variantOptions: Record<string, string[]>;
  pricingRules: {
    basePrice: boolean;
    sizeOverrides?: Record<string, number>;
    colorOverrides?: Record<string, number>;
    materialOverrides?: Record<string, number>;
  };
}

const CATEGORY_VARIANT_CONFIGS: Record<string, VariantConfig> = {
  sarees: {
    requiredVariants: ["blouseSize", "color"],
    optionalVariants: ["material", "sareeLength", "borderType"],
    variantOptions: {
      blouseSize: ["32", "34", "36", "38", "40", "42", "44"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Silk", "Cotton", "Georgette", "Chiffon", "Linen", "Net", "Organza", "Tussar", "Raw Silk"],
      sareeLength: ["5.5 meters", "6 meters", "6.5 meters"],
      borderType: ["Heavy Border", "Light Border", "No Border"],
    },
    pricingRules: {
      basePrice: true,
      colorOverrides: {
        "Rose Gold": 20,
        "Champagne": 15,
        "Midnight Blue": 10,
        "Emerald": 15,
        "Ruby Red": 12,
        "Sapphire Blue": 12,
      },
      materialOverrides: {
        "Silk": 20,
        "Organza": 15,
      },
    },
  },
  lehengas: {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material", "blouseStyle", "dupattaType"],
    variantOptions: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Silk", "Georgette", "Chiffon", "Net", "Velvet", "Organza"],
      blouseStyle: ["Sleeveless", "Half Sleeve", "Full Sleeve", "Backless"],
      dupattaType: ["Heavy Embroidered", "Light Embroidered", "Plain", "Printed"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "XL": 5,
        "2XL": 10,
        "3XL": 15,
      },
      colorOverrides: {
        "Rose Gold": 20,
        "Champagne": 15,
        "Gold": 10,
      },
      materialOverrides: {
        "Silk": 20,
        "Velvet": 15,
        "Organza": 10,
      },
    },
  },
  "salwar-kameez": {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material", "bottomType", "dupattaType"],
    variantOptions: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Cotton", "Georgette", "Chiffon", "Silk", "Linen"],
      bottomType: ["Patiala", "Palazzo", "Straight", "Churidar", "Dhoti"],
      dupattaType: ["Embroidered", "Plain", "Printed"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "XL": 5,
        "2XL": 10,
        "3XL": 15,
      },
      colorOverrides: {
        "Rose Gold": 15,
        "Champagne": 10,
      },
      materialOverrides: {
        "Silk": 15,
        "Linen": 5,
      },
    },
  },
  "kurtas-kurtis": {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material", "length", "sleeveType"],
    variantOptions: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Cotton", "Georgette", "Chiffon", "Linen"],
      length: ["Short", "Medium", "Long", "Knee Length"],
      sleeveType: ["Sleeveless", "Half Sleeve", "Full Sleeve", "3/4 Sleeve"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "XL": 3,
        "2XL": 5,
        "3XL": 8,
      },
      colorOverrides: {
        "Rose Gold": 10,
        "Champagne": 8,
      },
      materialOverrides: {
        "Linen": 5,
      },
    },
  },
  "indo-western": {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material"],
    variantOptions: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Cotton", "Georgette", "Chiffon", "Linen", "Silk"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "XL": 5,
        "2XL": 10,
      },
      colorOverrides: {
        "Rose Gold": 15,
        "Champagne": 10,
      },
      materialOverrides: {
        "Silk": 20,
      },
    },
  },
  "blouses-cholis": {
    requiredVariants: ["blouseSize", "color"],
    optionalVariants: ["material", "blouseStyle"],
    variantOptions: {
      blouseSize: ["32", "34", "36", "38", "40", "42", "44"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Silk", "Cotton", "Georgette", "Chiffon"],
      blouseStyle: ["Sleeveless", "Half Sleeve", "Full Sleeve", "Backless"],
    },
    pricingRules: {
      basePrice: true,
      colorOverrides: {
        "Rose Gold": 15,
        "Champagne": 10,
        "Gold": 8,
      },
      materialOverrides: {
        "Silk": 15,
      },
    },
  },
  "dupattas-stoles": {
    requiredVariants: ["color"],
    optionalVariants: ["material", "length"],
    variantOptions: {
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Silk", "Cotton", "Georgette", "Chiffon", "Pashmina"],
      length: ["2.5 meters", "2.75 meters", "3 meters"],
    },
    pricingRules: {
      basePrice: true,
      colorOverrides: {
        "Rose Gold": 10,
        "Champagne": 8,
      },
      materialOverrides: {
        "Pashmina": 30,
        "Silk": 10,
      },
    },
  },
  accessories: {
    requiredVariants: [],
    optionalVariants: ["color", "material", "size"],
    variantOptions: {
      color: ["Black", "Brown", "Navy", "Red", "Beige", "Gold", "Silver"],
      material: ["Leather", "Fabric", "Synthetic", "Embroidered"],
      size: ["Small", "Medium", "Large", "One Size"],
    },
    pricingRules: {
      basePrice: true,
      materialOverrides: {
        "Leather": 20,
        "Embroidered": 15,
      },
    },
  },
  "mens-ethnic-wear": {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material", "length"],
    variantOptions: {
      size: ["S", "M", "L", "XL", "2XL", "3XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Cotton", "Linen", "Silk"],
      length: ["Short", "Medium", "Long"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "XL": 5,
        "2XL": 10,
        "3XL": 15,
      },
      colorOverrides: {
        "Gold": 10,
      },
      materialOverrides: {
        "Silk": 20,
        "Linen": 8,
      },
    },
  },
  "kids-ethnic-wear": {
    requiredVariants: ["size", "color"],
    optionalVariants: ["material"],
    variantOptions: {
      size: ["XS", "S", "M", "L", "XL"],
      color: [
        "Red", "Maroon", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple",
        "Black", "White", "Navy", "Gold", "Silver", "Rose Gold", "Champagne",
        "Midnight Blue", "Emerald", "Ruby Red", "Sapphire Blue", "Ivory",
        "Beige", "Tan", "Cream", "Brown", "Bronze"
      ],
      material: ["Cotton", "Georgette", "Chiffon"],
    },
    pricingRules: {
      basePrice: true,
      materialOverrides: {
        "Georgette": 3,
        "Chiffon": 3,
      },
    },
  },
  "occasion-based": {
    requiredVariants: [],
    optionalVariants: [],
    variantOptions: {},
    pricingRules: {
      basePrice: true,
    },
  },
  "fabric-based": {
    requiredVariants: [],
    optionalVariants: [],
    variantOptions: {},
    pricingRules: {
      basePrice: true,
    },
  },
  "pooja-religious-items": {
    requiredVariants: ["material"],
    optionalVariants: ["size", "color"],
    variantOptions: {
      material: ["Brass", "Copper", "Silver", "Steel", "Wood", "Clay", "Marble", "Resin", "Stone"],
      size: ["Small", "Medium", "Large", "Extra Large"],
      color: ["Gold", "Silver", "Copper", "Natural"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "Large": 5,
        "Extra Large": 10,
      },
      materialOverrides: {
        "Silver": 50,
        "Copper": 10,
        "Brass": 5,
      },
    },
  },
  "home-living": {
    requiredVariants: ["size", "material"],
    optionalVariants: ["color", "design"],
    variantOptions: {
      size: ["Small", "Medium", "Large", "Extra Large", "One Size"],
      material: ["Wood", "Metal", "Brass", "Copper", "Ceramic", "Glass", "Resin", "Fabric"],
      color: ["Natural", "Gold", "Silver", "Bronze", "Painted", "Various"],
      design: ["Traditional", "Modern", "Contemporary", "Antique"],
    },
    pricingRules: {
      basePrice: true,
      sizeOverrides: {
        "Large": 5,
        "Extra Large": 10,
      },
      materialOverrides: {
        "Brass": 10,
        "Copper": 15,
        "Silver": 50,
      },
    },
  },
  miscellaneous: {
    requiredVariants: [],
    optionalVariants: ["size", "color", "material", "type"],
    variantOptions: {
      size: ["Small", "Medium", "Large", "One Size"],
      color: ["Various"],
      material: ["Various"],
      type: ["Various"],
    },
    pricingRules: {
      basePrice: true,
    },
  },
};

const getVariantTypeIds = async (payload: any, variantTypeSlugs: string[]): Promise<string[]> => {
  const variantTypes = await payload.find({
    collection: "variant-types",
    where: {
      slug: {
        in: variantTypeSlugs,
      },
    },
    limit: 100,
  });

  return variantTypes.docs.map((vt: any) => vt.id);
};

const seedCategoryVariantConfig = async () => {
  try {
    logSection("🌱 Starting Category Variant Config Seeding");
    const payload = await getPayloadInstance();

    const progress = new ProgressTracker(
      Object.keys(CATEGORY_VARIANT_CONFIGS).length,
      "Category Variant Configs"
    );
    let updatedCount = 0;
    let skippedCount = 0;

    for (const [categorySlug, config] of Object.entries(CATEGORY_VARIANT_CONFIGS)) {
      try {
        // Find category
        const categories = await payload.find({
          collection: "categories",
          where: {
            slug: {
              equals: categorySlug,
            },
          },
          limit: 1,
        });

        if (categories.docs.length === 0) {
          logSkip(`Category "${categorySlug}" not found`);
          skippedCount++;
          progress.increment();
          continue;
        }

        const category = categories.docs[0];

        // Get variant type IDs
        const requiredVariantTypeIds = await getVariantTypeIds(payload, config.requiredVariants);
        const optionalVariantTypeIds = await getVariantTypeIds(payload, config.optionalVariants);

        // Update category with variant config
        await payload.update({
          collection: "categories",
          id: category.id,
          data: {
            variantConfig: {
              requiredVariants: requiredVariantTypeIds,
              optionalVariants: optionalVariantTypeIds,
              variantOptions: config.variantOptions,
              pricingRules: config.pricingRules,
            },
          },
        });

        logSuccess(`Updated variant config for category: ${category.name}`);
        updatedCount++;
      } catch (error) {
        logError(`Failed to update variant config for category: ${categorySlug}`, error);
      }

      progress.increment();
    }

    logSection("✅ Category Variant Config Seeding Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} categories`);
    console.log(`   - Skipped: ${skippedCount} categories`);
    console.log(`   - Total: ${Object.keys(CATEGORY_VARIANT_CONFIGS).length} categories`);
  } catch (error) {
    logError("Category variant config seeding failed", error);
    throw error;
  }
};

// Run if executed directly
seedCategoryVariantConfig()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
