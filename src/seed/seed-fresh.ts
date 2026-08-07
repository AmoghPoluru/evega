import "dotenv/config";
import { getPayloadInstance, logSection, logSuccess, logError } from "./utils/seed-helpers";
import { execSync } from "child_process";

/**
 * Fresh seed: Cleanup all data and load fresh variants + admin user
 */
const seedFresh = async () => {
  try {
    logSection("🌱 Starting Fresh Database Seeding");
    console.log("\nThis will:");
    console.log("1. Delete all existing data (variants, orders, customers, vendors, users)");
    console.log("2. Create fresh admin user");
    console.log("3. Load fresh variant types and options\n");

    logSection("Step 1/4: Cleaning up existing data");
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
    };

    logSection("Step 2/4: Creating Admin User");
    try {
      execSync("npx tsx src/seed/seed-users.ts", { stdio: "inherit" });
      logSuccess("✓ Admin user created");
      results.adminUser = true;
    } catch (error: any) {
      logError("Failed to create admin user", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    logSection("Step 3/4: Seeding Variant Types");
    try {
      execSync("npx tsx src/seed/seed-variant-types.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Types seeded");
      results.variantTypes = true;
    } catch (error: any) {
      logError("Failed to seed variant types", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

    logSection("Step 4/4: Seeding Variant Options");
    try {
      execSync("npx tsx src/seed/seed-variant-options.ts", { stdio: "inherit" });
      logSuccess("✓ Variant Options seeded");
      results.variantOptions = true;
    } catch (error: any) {
      logError("Failed to seed variant options", error);
      console.log("⚠️  Continuing with next steps...\n");
    }

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

      console.log(`\n📊 Verification Results:`);
      console.log(`   - Variant Types: ${variantTypesCount.totalDocs || 0} found`);
      console.log(`   - Variant Options: ${variantOptionsCount.totalDocs || 0} found`);
    } catch (error) {
      logError("Verification failed", error);
    }

    logSection("✅ Fresh Database Seeding Completed");
    console.log("\n📊 Summary:");
    console.log("   ✓ All old data deleted (including users)");
    console.log(`   ${results.adminUser ? "✓" : "✗"} Admin user ${results.adminUser ? "created" : "failed"} (admin@example.com / admin123)`);
    console.log(`   ${results.variantTypes ? "✓" : "✗"} Variant Types ${results.variantTypes ? "loaded" : "failed"}`);
    console.log(`   ${results.variantOptions ? "✓" : "✗"} Variant Options ${results.variantOptions ? "loaded" : "failed"}`);

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
