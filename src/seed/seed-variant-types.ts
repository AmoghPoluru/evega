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

const VARIANT_TYPES = [
  { name: "Size", slug: "size", type: "select", displayOrder: 1 },
  { name: "Blouse Size", slug: "blouseSize", type: "select", displayOrder: 2 },
  { name: "Color", slug: "color", type: "select", displayOrder: 3 },
  { name: "Material", slug: "material", type: "select", displayOrder: 4 },
  { name: "Ring Size", slug: "ringSize", type: "select", displayOrder: 5 },
  { name: "Shoe Size", slug: "shoeSize", type: "select", displayOrder: 6 },
  { name: "Length", slug: "length", type: "number", unit: "inches", displayOrder: 7 },
  { name: "Sleeve Type", slug: "sleeveType", type: "select", displayOrder: 8 },
  { name: "Bottom Type", slug: "bottomType", type: "select", displayOrder: 9 },
  { name: "Dupatta Type", slug: "dupattaType", type: "select", displayOrder: 10 },
  { name: "Border Type", slug: "borderType", type: "select", displayOrder: 11 },
  { name: "Blouse Style", slug: "blouseStyle", type: "select", displayOrder: 12 },
  { name: "Saree Length", slug: "sareeLength", type: "select", displayOrder: 13 },
  { name: "Age Group", slug: "ageGroup", type: "select", displayOrder: 14 },
  { name: "Chest Size", slug: "chest", type: "select", displayOrder: 15 },
  { name: "Bead Count", slug: "beadCount", type: "select", displayOrder: 16 },
  { name: "Fragrance", slug: "fragrance", type: "select", displayOrder: 17 },
  { name: "Quantity", slug: "quantity", type: "select", displayOrder: 18 },
  { name: "Kit Type", slug: "kitType", type: "select", displayOrder: 19 },
  { name: "Language", slug: "language", type: "select", displayOrder: 20 },
  { name: "Binding", slug: "binding", type: "select", displayOrder: 21 },
  { name: "Format", slug: "format", type: "select", displayOrder: 22 },
  { name: "Design", slug: "design", type: "select", displayOrder: 23 },
  { name: "Finish", slug: "finish", type: "select", displayOrder: 24 },
  { name: "Type", slug: "type", type: "select", displayOrder: 25 },
];

const seedVariantTypes = async () => {
  try {
    logSection("🌱 Starting Variant Types Seeding");
    const payload = await getPayloadInstance();
    const progress = new ProgressTracker(VARIANT_TYPES.length, "Variant Types");

    let createdCount = 0;
    let skippedCount = 0;

    for (const variantType of VARIANT_TYPES) {
      const exists = await entityExistsBySlug(payload, "variant-types", variantType.slug);

      if (exists) {
        logSkip(`Variant type "${variantType.name}" already exists`);
        skippedCount++;
        progress.increment();
        continue;
      }

      try {
        await payload.create({
          collection: "variant-types",
          data: {
            name: variantType.name,
            slug: variantType.slug,
            type: variantType.type,
            unit: variantType.unit || null,
            displayOrder: variantType.displayOrder,
          },
        });

        logSuccess(`Created variant type: ${variantType.name}`);
        createdCount++;
      } catch (error) {
        logError(`Failed to create variant type: ${variantType.name}`, error);
      }

      progress.increment();
    }

    logSection("✅ Variant Types Seeding Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} variant types`);
    console.log(`   - Skipped: ${skippedCount} variant types`);
    console.log(`   - Total: ${VARIANT_TYPES.length} variant types`);
  } catch (error) {
    logError("Variant types seeding failed", error);
    throw error;
  }
};

// Run if executed directly
seedVariantTypes()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
