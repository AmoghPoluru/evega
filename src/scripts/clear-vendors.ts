import "dotenv/config";
import {
  getPayloadInstance,
  logSuccess,
  logError,
  logSection,
} from "../seed/utils/seed-helpers";

const clearVendors = async () => {
  try {
    logSection("🧹 Clearing All Vendors");
    const payload = await getPayloadInstance();

    // Get all vendors
    const result = await payload.find({
      collection: "vendors",
      limit: 10000,
      pagination: false,
    });

    const vendors = result.docs;
    const count = vendors.length;

    if (count === 0) {
      logSuccess("No vendors to delete");
      return;
    }

    console.log(`Found ${count} vendor(s) to delete...\n`);

    // Delete all vendors
    let deletedCount = 0;
    for (const vendor of vendors) {
      try {
        await payload.delete({
          collection: "vendors",
          id: vendor.id,
        });
        deletedCount++;
        if (deletedCount % 10 === 0) {
          process.stdout.write(`Deleted ${deletedCount}/${count} vendors...\r`);
        }
      } catch (error) {
        logError(`Failed to delete vendor: ${vendor.name || vendor.id}`, error);
      }
    }

    console.log(); // New line after progress
    logSection("✅ Vendors Cleared");
    console.log(`📊 Summary:`);
    console.log(`   - Deleted: ${deletedCount} vendors`);
    console.log(`   - Total: ${count} vendors`);
  } catch (error) {
    logError("Vendors cleanup failed", error);
    process.exit(1);
  }
};

clearVendors();
