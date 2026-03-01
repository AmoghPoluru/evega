import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  logSuccess,
  logError,
  logSection,
} from "../seed/utils/seed-helpers";

const clearProducts = async () => {
  try {
    logSection("🧹 Clearing All Products");
    const payload = await getPayloadInstance();

    // Get all products
    const result = await payload.find({
      collection: "products",
      limit: 10000,
      pagination: false,
    });

    const products = result.docs;
    const count = products.length;

    if (count === 0) {
      logSuccess("No products to delete");
      return;
    }

    console.log(`Found ${count} product(s) to delete...\n`);

    // Delete all products
    let deletedCount = 0;
    for (const product of products) {
      try {
        await payload.delete({
          collection: "products",
          id: product.id,
        });
        deletedCount++;
        if (deletedCount % 10 === 0) {
          process.stdout.write(`Deleted ${deletedCount}/${count} products...\r`);
        }
      } catch (error) {
        logError(`Failed to delete product: ${product.name || product.id}`, error);
      }
    }

    console.log(); // New line after progress
    logSection("✅ Products Cleared");
    console.log(`📊 Summary:`);
    console.log(`   - Deleted: ${deletedCount} products`);
    console.log(`   - Total: ${count} products`);
    console.log(`\n💡 You can now import fresh products using the CSV import feature.`);
  } catch (error) {
    logError("Products cleanup failed", error);
    process.exit(1);
  }
};

clearProducts();
