import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { getPayloadInstance, logSection, logSuccess, logError } from "./utils/seed-helpers";

/**
 * Master seed file that runs all seed files in correct order
 * Order: VariantTypes → VariantOptions → Categories → CategoryVariantConfig
 */
const seedAll = async () => {
  try {
    logSection("🌱 Starting Complete Database Seeding");
    const payload = await getPayloadInstance();

    // Step 1: Seed Variant Types
    logSection("Step 1/4: Seeding Variant Types");
    try {
      const { execSync } = await import("child_process");
      execSync("npx tsx src/seed/seed-variant-types.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Types seeded");
    } catch (error) {
      logError("Failed to seed variant types", error);
      throw error;
    }

    // Step 2: Seed Variant Options
    logSection("Step 2/4: Seeding Variant Options");
    try {
      const { execSync } = await import("child_process");
      execSync("npx tsx src/seed/seed-variant-options.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Options seeded");
    } catch (error) {
      logError("Failed to seed variant options", error);
      throw error;
    }

    // Step 3: Seed Categories
    logSection("Step 3/4: Seeding Categories");
    try {
      const { execSync } = await import("child_process");
      execSync("npx tsx src/seed/seed-categories.ts", { stdio: "inherit" });
      logSuccess("✓ Categories seeded");
    } catch (error) {
      logError("Failed to seed categories", error);
      throw error;
    }

    // Step 4: Seed Category Variant Configs
    logSection("Step 4/4: Seeding Category Variant Configs");
    try {
      const { execSync } = await import("child_process");
      execSync("npx tsx src/seed/seed-category-variant-config.ts", { stdio: "inherit" });
      logSuccess("✓ Category Variant Configs seeded");
    } catch (error) {
      logError("Failed to seed category variant configs", error);
      throw error;
    }

    logSection("✅ Complete Database Seeding Finished");
    console.log("\n📊 Summary:");
    console.log("   ✓ Variant Types");
    console.log("   ✓ Variant Options");
    console.log("   ✓ Categories");
    console.log("   ✓ Category Variant Configs");
    console.log("\n🎉 All seed files executed successfully!");
  } catch (error) {
    logError("Complete seeding failed", error);
    process.exit(1);
  }
};

seedAll();
