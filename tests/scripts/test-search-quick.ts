import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildSearchQuery } from "../../src/lib/search/search-query-builder";

/**
 * Quick Search Test - Tests a few key searches against the database
 */

const QUICK_TESTS = [
  "red",
  "dress",
  "red dress",
  "small red",
  "small red silk",
  "red dress size small",
  "silk dress",
  "blue kurta",
];

async function quickTest() {
  console.log("🔍 Quick Search Test\n");
  
  const payload = await getPayload({ config });

  // Check if we have products
  const totalProducts = await payload.find({
    collection: "products",
    limit: 1,
    where: {
      isArchived: { not_equals: true },
      isPrivate: { not_equals: true },
    },
  });

  if (totalProducts.docs.length === 0) {
    console.log("⚠️  No products found. Create some products first.");
    return;
  }

  console.log(`Found ${totalProducts.totalDocs} products in database\n`);
  console.log("=" .repeat(80));

  for (const searchTerm of QUICK_TESTS) {
    try {
      const { where, parsedQuery } = buildSearchQuery({ searchTerm });
      
      const results = await payload.find({
        collection: "products",
        where: {
          ...where,
          isArchived: { not_equals: true },
          isPrivate: { not_equals: true },
        },
        limit: 5,
        depth: 2,
      });

      const status = results.docs.length > 0 ? "✅" : "⚠️ ";
      console.log(`${status} "${searchTerm}"`);
      console.log(`   Parsed: color=${parsedQuery.color || "none"}, size=${parsedQuery.size || "none"}, material=${parsedQuery.material || "none"}, keywords=[${parsedQuery.keywords.join(", ") || "none"}]`);
      console.log(`   Found: ${results.docs.length} products`);
      if (results.docs.length > 0) {
        console.log(`   Examples: ${results.docs.slice(0, 3).map(p => p.name).join(", ")}`);
      }
      console.log();
    } catch (error: any) {
      console.log(`❌ "${searchTerm}" → Error: ${error.message}\n`);
    }
  }

  console.log("=" .repeat(80));
  console.log("\n✨ Quick test complete!");
}

quickTest().catch(console.error);
