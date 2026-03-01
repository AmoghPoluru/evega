import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { getPayloadInstance, logSection, logSuccess, logError } from "./utils/seed-helpers";
import { execSync } from "child_process";

/**
 * Fresh seed: Cleanup all data and load fresh categories/subcategories/variants + admin user
 */
const seedFresh = async () => {
  try {
    logSection("🌱 Starting Fresh Database Seeding");
    console.log("\nThis will:");
    console.log("1. Delete all existing data (categories, variants, orders, customers, vendors, users)");
    console.log("2. Create fresh admin user");
    console.log("3. Load fresh categories, subcategories, and variants\n");

    // Step 1: Cleanup
    logSection("Step 1/6: Cleaning up existing data");
    try {
      execSync("npx tsx src/seed/seed-cleanup.ts --confirm", { stdio: "inherit" });
      logSuccess("✓ Cleanup completed");
    } catch (error) {
      logError("Failed to cleanup", error);
      throw error;
    }

    const results = {
      adminUser: false,
      variantTypes: false,
      variantOptions: false,
      categories: false,
      variantConfigs: false,
    };

    // Step 2: Create Admin User
    logSection("Step 2/6: Creating Admin User");
    try {
      execSync("npx tsx src/seed/seed-users.ts", { stdio: "inherit" });
      logSuccess("✓ Admin user created");
      results.adminUser = true;
    } catch (error: any) {
      logError("Failed to create admin user", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    // Step 3: Seed Variant Types
    logSection("Step 3/6: Seeding Variant Types");
    try {
      execSync("npx tsx src/seed/seed-variant-types.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Types seeded");
      results.variantTypes = true;
    } catch (error: any) {
      logError("Failed to seed variant types", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    // Step 4: Seed Variant Options
    logSection("Step 4/6: Seeding Variant Options");
    try {
      execSync("npx tsx src/seed/seed-variant-options.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Options seeded");
      results.variantOptions = true;
    } catch (error: any) {
      logError("Failed to seed variant options", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    // Step 5: Seed Categories
    logSection("Step 5/6: Seeding Categories");
    try {
      execSync("npx tsx src/seed/seed-categories.ts", { stdio: "inherit" });
      logSuccess("✓ Categories seeded");
      results.categories = true;
    } catch (error: any) {
      logError("Failed to seed categories", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    // Step 6: Seed Category Variant Configs
    logSection("Step 6/6: Seeding Category Variant Configs");
    try {
      execSync("npx tsx src/seed/seed-category-variant-config.ts", { stdio: "inherit" });
      logSuccess("✓ Category Variant Configs seeded");
      results.variantConfigs = true;
    } catch (error: any) {
      logError("Failed to seed category variant configs", error);
      console.log("⚠️  Continuing...\n");
    }

    // Verification
    logSection("Verification: Checking Created Data");
    try {
      const payload = await getPayloadInstance();
      
      const variantTypesCount = await payload.find({
        collection: "variant-types",
        limit: 1,
        pagination: false,
      });
      
      const variantOptionsCount = await payload.find({
        collection: "variant-options",
        limit: 1,
        pagination: false,
      });
      
      const categoriesCount = await payload.find({
        collection: "categories",
        where: { parent: { exists: false } },
        limit: 100,
        pagination: false,
      });
      
      const subcategoriesCount = await payload.find({
        collection: "categories",
        where: { parent: { exists: true } },
        limit: 1000,
        pagination: false,
      });

      console.log(`\n📊 Verification Results:`);
      console.log(`   - Variant Types: ${variantTypesCount.totalDocs || 0} found`);
      console.log(`   - Variant Options: ${variantOptionsCount.totalDocs || 0} found`);
      console.log(`   - Main Categories: ${categoriesCount.totalDocs || 0} found`);
      console.log(`   - Subcategories: ${subcategoriesCount.totalDocs || 0} found`);
    } catch (error) {
      logError("Verification failed", error);
    }

    logSection("✅ Fresh Database Seeding Completed");
    console.log("\n📊 Summary:");
    console.log("   ✓ All old data deleted (including users)");
    console.log(`   ${results.adminUser ? "✓" : "✗"} Admin user ${results.adminUser ? "created" : "failed"} (admin@example.com / admin123)`);
    console.log(`   ${results.variantTypes ? "✓" : "✗"} Variant Types ${results.variantTypes ? "loaded" : "failed"}`);
    console.log(`   ${results.variantOptions ? "✓" : "✗"} Variant Options ${results.variantOptions ? "loaded" : "failed"}`);
    console.log(`   ${results.categories ? "✓" : "✗"} Categories & Subcategories ${results.categories ? "loaded" : "failed"}`);
    console.log(`   ${results.variantConfigs ? "✓" : "✗"} Category Variant Configs ${results.variantConfigs ? "loaded" : "failed"}`);
    
    const allSuccess = Object.values(results).every((r) => r === true);
    if (allSuccess) {
      console.log("\n🎉 Fresh database seeding completed successfully!");
    } else {
      console.log("\n⚠️  Some steps failed. Check errors above.");
      console.log("   Run individual seed scripts to retry failed steps.");
    }
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
  } catch (error) {
    logError("Fresh seeding failed", error);
    process.exit(1);
  }
};

seedFresh();
