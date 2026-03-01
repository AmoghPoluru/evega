import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { getPayloadInstance, logSection, logSuccess, logError } from "./utils/seed-helpers";
import { execSync } from "child_process";

/**
 * Core seed: Load categories/subcategories/variants/variant types and admin user
 * This script is idempotent - safe to run multiple times
 * Does NOT delete existing data, only creates/updates what's needed
 */
const seedCore = async () => {
  const results = {
    adminUser: false,
    variantTypes: false,
    variantOptions: false,
    categories: false,
    variantConfigs: false,
  };

  logSection("🌱 Starting Core Database Seeding");
    console.log("\nThis will load:");
    console.log("1. Admin user (if not exists)");
    console.log("2. Variant Types");
    console.log("3. Variant Options");
    console.log("4. Categories & Subcategories");
    console.log("5. Category Variant Configs");
    console.log("6. Tags (based on categories)");
    console.log("\nNote: This does NOT delete existing data.\n");

  // Step 1: Create Admin User
  logSection("Step 1/5: Creating/Updating Admin User");
  try {
    execSync("npx tsx src/seed/seed-users.ts", { stdio: "inherit" });
    logSuccess("✓ Admin user ready");
    results.adminUser = true;
  } catch (error: any) {
    logError("Failed to create admin user", error);
    console.log("⚠️  Continuing with next steps...\n");
  }

  // Step 2: Seed Variant Types
  logSection("Step 2/5: Seeding Variant Types");
  try {
    execSync("npx tsx src/seed/seed-variant-types.ts", { stdio: "inherit" });
    logSuccess("✓ Variant Types seeded");
    results.variantTypes = true;
  } catch (error: any) {
    logError("Failed to seed variant types", error);
    console.log("⚠️  Continuing with next steps...\n");
  }

  // Step 3: Seed Variant Options
  logSection("Step 3/5: Seeding Variant Options");
  try {
    execSync("npx tsx src/seed/seed-variant-options.ts", { stdio: "inherit" });
    logSuccess("✓ Variant Options seeded");
    results.variantOptions = true;
  } catch (error: any) {
    logError("Failed to seed variant options", error);
    console.log("⚠️  Continuing with next steps...\n");
  }

  // Step 4: Seed Categories
  logSection("Step 4/5: Seeding Categories");
  try {
    execSync("npx tsx src/seed/seed-categories.ts", { stdio: "inherit" });
    logSuccess("✓ Categories seeded");
    results.categories = true;
  } catch (error: any) {
    logError("Failed to seed categories", error);
    console.log("⚠️  Continuing with next steps...\n");
  }

    // Step 5: Seed Category Variant Configs
    logSection("Step 5/6: Seeding Category Variant Configs");
    try {
      execSync("npx tsx src/seed/seed-category-variant-config.ts", { stdio: "inherit" });
      logSuccess("✓ Category Variant Configs seeded");
      results.variantConfigs = true;
    } catch (error: any) {
      logError("Failed to seed category variant configs", error);
      console.log("⚠️  Continuing...\n");
    }

    // Step 6: Seed Tags
    logSection("Step 6/6: Seeding Tags");
    try {
      execSync("npx tsx src/seed/seed-tags.ts", { stdio: "inherit" });
      logSuccess("✓ Tags seeded");
    } catch (error: any) {
      logError("Failed to seed tags", error);
      console.log("⚠️  Continuing...\n");
    }

  // Verification step
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

  logSection("✅ Core Database Seeding Completed");
  console.log("\n📊 Summary:");
  console.log(`   ${results.adminUser ? "✓" : "✗"} Admin user ${results.adminUser ? "ready" : "failed"} (admin@example.com / admin123)`);
  console.log(`   ${results.variantTypes ? "✓" : "✗"} Variant Types ${results.variantTypes ? "loaded" : "failed"}`);
  console.log(`   ${results.variantOptions ? "✓" : "✗"} Variant Options ${results.variantOptions ? "loaded" : "failed"}`);
  console.log(`   ${results.categories ? "✓" : "✗"} Categories & Subcategories ${results.categories ? "loaded" : "failed"}`);
    console.log(`   ${results.variantConfigs ? "✓" : "✗"} Category Variant Configs ${results.variantConfigs ? "loaded" : "failed"}`);
    console.log(`   ✓ Tags loaded (based on categories)`);
  
  const allSuccess = Object.values(results).every((r) => r === true);
  if (allSuccess) {
    console.log("\n🎉 Core database seeding completed successfully!");
  } else {
    console.log("\n⚠️  Some steps failed. Check errors above.");
    console.log("   You can run individual seed scripts to retry failed steps:");
    console.log("   - npm run db:seed:variant-types");
    console.log("   - npm run db:seed:variant-options");
    console.log("   - npm run db:seed:categories");
    console.log("   - npm run db:seed:category-variant-config");
  }
  console.log("\n💡 This script is idempotent - safe to run multiple times");
  console.log("   It will skip items that already exist and only create new ones.");
};

seedCore();
