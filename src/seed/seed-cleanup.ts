import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  logSuccess,
  logError,
  logSection,
  ProgressTracker,
} from "./utils/seed-helpers";

// Check for --confirm flag to skip confirmation
const skipConfirmation = process.argv.includes("--confirm");

const deleteAllFromCollection = async (
  payload: any,
  collection: string,
  collectionLabel: string
): Promise<number> => {
  try {
    // Get all documents
    const result = await payload.find({
      collection,
      limit: 10000,
      pagination: false,
    });

    const docs = result.docs;
    const count = docs.length;

    if (count === 0) {
      logSuccess(`No ${collectionLabel} to delete`);
      return 0;
    }

    // Delete all documents
    for (const doc of docs) {
      try {
        await payload.delete({
          collection,
          id: doc.id,
        });
      } catch (error) {
        logError(`Failed to delete ${collectionLabel} with id: ${doc.id}`, error);
      }
    }

    logSuccess(`Deleted ${count} ${collectionLabel}`);
    return count;
  } catch (error) {
    logError(`Failed to delete ${collectionLabel}`, error);
    return 0;
  }
};

const cleanupAll = async () => {
  try {
    logSection("🧹 Database Cleanup");
    console.log("\n⚠️  WARNING: This will delete ALL data from:");
    console.log("   - Categories & Subcategories");
    console.log("   - Variant Types & Variant Options");
    console.log("   - Products (depends on categories)");
    console.log("   - Hero Banners");
    console.log("   - Tags");
    console.log("   - Orders");
    console.log("   - Customers");
    console.log("   - Vendors");
    console.log("   - Users (including admin user)");
    console.log("\nThis action cannot be undone!\n");

    if (!skipConfirmation) {
      console.log("💡 Tip: Use --confirm flag to skip this warning");
      console.log("   Example: npm run db:seed:cleanup -- --confirm\n");
      throw new Error("Cleanup requires --confirm flag. Add --confirm to proceed.");
    }

    const payload = await getPayloadInstance();

    logSection("Starting Cleanup Process");

    // Order matters: Delete dependent collections first
    const collectionsToClean = [
      { collection: "orders", label: "orders" },
      { collection: "products", label: "products" },
      { collection: "hero-banners", label: "hero banners" },
      { collection: "tags", label: "tags" },
      { collection: "customers", label: "customers" },
      { collection: "vendors", label: "vendors" },
      { collection: "categories", label: "categories & subcategories" },
      { collection: "variant-options", label: "variant options" },
      { collection: "variant-types", label: "variant types" },
      { collection: "users", label: "users (including admin)" },
    ];

    const progress = new ProgressTracker(collectionsToClean.length, "Collections");
    let totalDeleted = 0;

    for (const { collection, label } of collectionsToClean) {
      const deleted = await deleteAllFromCollection(payload, collection, label);
      totalDeleted += deleted;
      progress.increment(label);
    }

    logSection("✅ Cleanup Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Total items deleted: ${totalDeleted}`);
    console.log(`   - Collections cleaned: ${collectionsToClean.length}`);
  } catch (error) {
    logError("Cleanup failed", error);
    process.exit(1);
  }
};

cleanupAll();
