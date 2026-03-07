import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { buildSearchQuery } from "../../src/lib/search/search-query-builder";
import { parseQuery as parseQueryFn } from "../../src/lib/search/query-parser";

/**
 * Search Testing Script
 * Tests 50+ search phrases to verify enhanced search functionality
 */

interface TestCase {
  query: string;
  expected: {
    hasColor?: string;
    hasSize?: string;
    hasMaterial?: string;
    minPrice?: string;
    maxPrice?: string;
    hasKeywords?: string[];
    description: string;
  };
}

const TEST_PHRASES: TestCase[] = [
  // Price Queries
  { query: "dress under 500", expected: { maxPrice: "500", hasKeywords: ["dress"], description: "Dresses under 500" } },
  { query: "dress less than 500", expected: { maxPrice: "500", hasKeywords: ["dress"], description: "Dresses less than 500" } },
  { query: "dress below 500", expected: { maxPrice: "500", hasKeywords: ["dress"], description: "Dresses below 500" } },
  { query: "dress under 100$", expected: { maxPrice: "100", hasKeywords: ["dress"], description: "Dresses under $100" } },
  { query: "dress over 1000", expected: { minPrice: "1000", hasKeywords: ["dress"], description: "Dresses over 1000" } },
  { query: "dress more than 1000", expected: { minPrice: "1000", hasKeywords: ["dress"], description: "Dresses more than 1000" } },
  { query: "red dress under 500", expected: { hasColor: "red", maxPrice: "500", hasKeywords: ["dress"], description: "Red dresses under 500" } },
  { query: "small red dress under 500", expected: { hasSize: "small", hasColor: "red", maxPrice: "500", hasKeywords: ["dress"], description: "Small red dresses under 500" } },

  // Basic Color + Type
  { query: "red dress", expected: { hasColor: "red", hasKeywords: ["dress"], description: "Red dresses" } },
  { query: "blue kurta", expected: { hasColor: "blue", hasKeywords: ["kurta"], description: "Blue kurtas" } },
  { query: "green saree", expected: { hasColor: "green", hasKeywords: ["saree"], description: "Green sarees" } },
  { query: "maroon lehenga", expected: { hasColor: "maroon", hasKeywords: ["lehenga"], description: "Maroon lehengas" } },
  { query: "black dress", expected: { hasColor: "black", hasKeywords: ["dress"], description: "Black dresses" } },
  { query: "white saree", expected: { hasColor: "white", hasKeywords: ["saree"], description: "White sarees" } },
  { query: "pink lehenga", expected: { hasColor: "pink", hasKeywords: ["lehenga"], description: "Pink lehengas" } },
  { query: "navy kurta", expected: { hasColor: "navy", hasKeywords: ["kurta"], description: "Navy kurtas" } },
  { query: "gold saree", expected: { hasColor: "gold", hasKeywords: ["saree"], description: "Gold sarees" } },
  { query: "silver dress", expected: { hasColor: "silver", hasKeywords: ["dress"], description: "Silver dresses" } },

  // Size + Color
  { query: "small red", expected: { hasSize: "small", hasColor: "red", description: "Small red products" } },
  { query: "medium blue", expected: { hasSize: "medium", hasColor: "blue", description: "Medium blue products" } },
  { query: "large green", expected: { hasSize: "large", hasColor: "green", description: "Large green products" } },
  { query: "s red", expected: { hasSize: "small", hasColor: "red", description: "Small red (abbreviation)" } },
  { query: "m blue", expected: { hasSize: "medium", hasColor: "blue", description: "Medium blue (abbreviation)" } },
  { query: "l green", expected: { hasSize: "large", hasColor: "green", description: "Large green (abbreviation)" } },
  { query: "xl red", expected: { hasSize: "xl", hasColor: "red", description: "XL red products" } },
  { query: "small maroon", expected: { hasSize: "small", hasColor: "maroon", description: "Small maroon products" } },
  { query: "medium pink", expected: { hasSize: "medium", hasColor: "pink", description: "Medium pink products" } },
  { query: "large black", expected: { hasSize: "large", hasColor: "black", description: "Large black products" } },

  // Complete Queries
  { query: "red dress size small", expected: { hasColor: "red", hasSize: "small", hasKeywords: ["dress"], description: "Red dresses with small size" } },
  { query: "small red dress", expected: { hasSize: "small", hasColor: "red", hasKeywords: ["dress"], description: "Small red dresses" } },
  { query: "blue kurta size medium", expected: { hasColor: "blue", hasSize: "medium", hasKeywords: ["kurta"], description: "Blue kurtas with medium size" } },
  { query: "medium blue kurta", expected: { hasSize: "medium", hasColor: "blue", hasKeywords: ["kurta"], description: "Medium blue kurtas" } },
  { query: "green saree size large", expected: { hasColor: "green", hasSize: "large", hasKeywords: ["saree"], description: "Green sarees with large size" } },
  { query: "large green saree", expected: { hasSize: "large", hasColor: "green", hasKeywords: ["saree"], description: "Large green sarees" } },
  { query: "maroon lehenga size small", expected: { hasColor: "maroon", hasSize: "small", hasKeywords: ["lehenga"], description: "Maroon lehengas with small size" } },
  { query: "small maroon lehenga", expected: { hasSize: "small", hasColor: "maroon", hasKeywords: ["lehenga"], description: "Small maroon lehengas" } },
  { query: "size small red dress", expected: { hasSize: "small", hasColor: "red", hasKeywords: ["dress"], description: "Explicit size pattern" } },
  { query: "color red size small dress", expected: { hasColor: "red", hasSize: "small", hasKeywords: ["dress"], description: "Explicit color and size pattern" } },

  // Material Searches
  { query: "silk dress", expected: { hasMaterial: "silk", hasKeywords: ["dress"], description: "Silk dresses" } },
  { query: "cotton kurta", expected: { hasMaterial: "cotton", hasKeywords: ["kurta"], description: "Cotton kurtas" } },
  { query: "georgette saree", expected: { hasMaterial: "georgette", hasKeywords: ["saree"], description: "Georgette sarees" } },
  { query: "silk red dress", expected: { hasMaterial: "silk", hasColor: "red", hasKeywords: ["dress"], description: "Silk red dresses" } },
  { query: "cotton blue kurta", expected: { hasMaterial: "cotton", hasColor: "blue", hasKeywords: ["kurta"], description: "Cotton blue kurtas" } },
  { query: "georgette green saree", expected: { hasMaterial: "georgette", hasColor: "green", hasKeywords: ["saree"], description: "Georgette green sarees" } },
  { query: "silk small red", expected: { hasMaterial: "silk", hasSize: "small", hasColor: "red", description: "Small red silk products" } },
  { query: "cotton medium blue", expected: { hasMaterial: "cotton", hasSize: "medium", hasColor: "blue", description: "Medium blue cotton products" } },
  { query: "silk red dress size small", expected: { hasMaterial: "silk", hasColor: "red", hasSize: "small", hasKeywords: ["dress"], description: "Small red silk dresses" } },
  { query: "small red silk dress", expected: { hasSize: "small", hasColor: "red", hasMaterial: "silk", hasKeywords: ["dress"], description: "Small red silk dresses (natural order)" } },

  // Complex Combinations
  { query: "small red silk dress", expected: { hasSize: "small", hasColor: "red", hasMaterial: "silk", hasKeywords: ["dress"], description: "Complete specification" } },
  { query: "medium blue cotton kurta", expected: { hasSize: "medium", hasColor: "blue", hasMaterial: "cotton", hasKeywords: ["kurta"], description: "Medium blue cotton kurtas" } },
  { query: "large green georgette saree", expected: { hasSize: "large", hasColor: "green", hasMaterial: "georgette", hasKeywords: ["saree"], description: "Large green georgette sarees" } },
  { query: "red dress size small silk", expected: { hasColor: "red", hasSize: "small", hasMaterial: "silk", hasKeywords: ["dress"], description: "Red silk dresses with small size" } },
  { query: "blue kurta size medium cotton", expected: { hasColor: "blue", hasSize: "medium", hasMaterial: "cotton", hasKeywords: ["kurta"], description: "Blue cotton kurtas with medium size" } },
  { query: "green saree size large georgette", expected: { hasColor: "green", hasSize: "large", hasMaterial: "georgette", hasKeywords: ["saree"], description: "Green georgette sarees with large size" } },
  { query: "small red silk", expected: { hasSize: "small", hasColor: "red", hasMaterial: "silk", description: "Small red silk (no keywords)" } },
  { query: "medium blue cotton", expected: { hasSize: "medium", hasColor: "blue", hasMaterial: "cotton", description: "Medium blue cotton (no keywords)" } },
  { query: "large green georgette", expected: { hasSize: "large", hasColor: "green", hasMaterial: "georgette", description: "Large green georgette (no keywords)" } },
  { query: "red silk dress size small", expected: { hasColor: "red", hasMaterial: "silk", hasSize: "small", hasKeywords: ["dress"], description: "Red silk dresses with small size" } },
];

async function testSearchParsing() {
  console.log("🧪 Testing Search Query Parsing\n");
  console.log("=" .repeat(80));

  let passed = 0;
  let failed = 0;
  const failures: Array<{ query: string; expected: any; actual: any }> = [];

  for (const testCase of TEST_PHRASES) {
    const parsed = parseQueryFn(testCase.query);
    const { parsedQuery } = buildSearchQuery({ searchTerm: testCase.query });

    let testPassed = true;
    const issues: string[] = [];

    // Check color
    if (testCase.expected.hasColor) {
      const expectedColor = testCase.expected.hasColor.toLowerCase();
      if (parsed.color !== expectedColor) {
        testPassed = false;
        issues.push(`Expected color: "${expectedColor}", got: "${parsed.color}"`);
      }
    }

    // Check size
    if (testCase.expected.hasSize) {
      const expectedSize = testCase.expected.hasSize.toLowerCase();
      if (parsed.size !== expectedSize) {
        testPassed = false;
        issues.push(`Expected size: "${expectedSize}", got: "${parsed.size}"`);
      }
    }

    // Check material
    if (testCase.expected.hasMaterial) {
      const expectedMaterial = testCase.expected.hasMaterial.toLowerCase();
      if (parsed.material !== expectedMaterial) {
        testPassed = false;
        issues.push(`Expected material: "${expectedMaterial}", got: "${parsed.material}"`);
      }
    }

    // Check keywords
    if (testCase.expected.hasKeywords) {
      const expectedKeywords = testCase.expected.hasKeywords.map(k => k.toLowerCase());
      const actualKeywords = parsed.keywords.map(k => k.toLowerCase());
      const missingKeywords = expectedKeywords.filter(k => !actualKeywords.includes(k));
      if (missingKeywords.length > 0) {
        testPassed = false;
        issues.push(`Missing keywords: ${missingKeywords.join(", ")}`);
      }
    }

    // Check minPrice
    if (testCase.expected.minPrice) {
      if (parsed.minPrice !== testCase.expected.minPrice) {
        testPassed = false;
        issues.push(`Expected minPrice: "${testCase.expected.minPrice}", got: "${parsed.minPrice}"`);
      }
    }

    // Check maxPrice
    if (testCase.expected.maxPrice) {
      if (parsed.maxPrice !== testCase.expected.maxPrice) {
        testPassed = false;
        issues.push(`Expected maxPrice: "${testCase.expected.maxPrice}", got: "${parsed.maxPrice}"`);
      }
    }

    if (testPassed) {
      console.log(`✅ "${testCase.query}"`);
      console.log(`   → ${testCase.expected.description}`);
      const priceInfo = parsed.minPrice || parsed.maxPrice ? `, minPrice=${parsed.minPrice || "none"}, maxPrice=${parsed.maxPrice || "none"}` : "";
      console.log(`   Parsed: color=${parsed.color || "none"}, size=${parsed.size || "none"}, material=${parsed.material || "none"}${priceInfo}, keywords=[${parsed.keywords.join(", ")}]`);
      passed++;
    } else {
      console.log(`❌ "${testCase.query}"`);
      console.log(`   → ${testCase.expected.description}`);
      console.log(`   Issues: ${issues.join("; ")}`);
      const priceInfo = parsed.minPrice || parsed.maxPrice ? `, minPrice=${parsed.minPrice || "none"}, maxPrice=${parsed.maxPrice || "none"}` : "";
      console.log(`   Parsed: color=${parsed.color || "none"}, size=${parsed.size || "none"}, material=${parsed.material || "none"}${priceInfo}, keywords=[${parsed.keywords.join(", ")}]`);
      failed++;
      failures.push({
        query: testCase.query,
        expected: testCase.expected,
        actual: parsed,
      });
    }
    console.log();
  }

  console.log("=" .repeat(80));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${TEST_PHRASES.length} tests\n`);

  if (failures.length > 0) {
    console.log("❌ Failed Tests:");
    failures.forEach((f, i) => {
      console.log(`\n${i + 1}. Query: "${f.query}"`);
      console.log(`   Expected:`, f.expected);
      console.log(`   Actual:`, f.actual);
    });
  }

  return { passed, failed, total: TEST_PHRASES.length };
}

async function testDatabaseSearch() {
  console.log("\n🔍 Testing Database Search Queries\n");
  console.log("=" .repeat(80));

  const payload = await getPayload({ config });

  // Get sample products to verify search works
  const sampleProducts = await payload.find({
    collection: "products",
    limit: 5,
    depth: 2,
    where: {
      isArchived: { not_equals: true },
      isPrivate: { not_equals: true },
    },
  });

  console.log(`Found ${sampleProducts.docs.length} sample products in database\n`);

  if (sampleProducts.docs.length === 0) {
    console.log("⚠️  No products found in database. Create some products first to test search.");
    return;
  }

  // Test a few key searches
  const keySearches = [
    "red",
    "dress",
    "red dress",
    "small red",
    "small red silk",
  ];

  let passed = 0;
  let failed = 0;

  for (const searchTerm of keySearches) {
    try {
      const { where } = buildSearchQuery({ searchTerm });
      
      const results = await payload.find({
        collection: "products",
        where: {
          ...where,
          isArchived: { not_equals: true },
          isPrivate: { not_equals: true },
        },
        limit: 10,
        depth: 2,
      });

      console.log(`✅ "${searchTerm}" → Found ${results.docs.length} products`);
      if (results.docs.length > 0) {
        console.log(`   Examples: ${results.docs.slice(0, 3).map(p => p.name).join(", ")}`);
      }
      passed++;
    } catch (error: any) {
      console.log(`❌ "${searchTerm}" → Error: ${error.message}`);
      failed++;
    }
    console.log();
  }

  console.log("=" .repeat(80));
  console.log(`\n📊 Database Search Results: ${passed} passed, ${failed} failed\n`);

  return { passed, failed };
}

async function runTests() {
  console.log("🚀 Starting Search Functionality Tests\n");

  try {
    // Test 1: Query Parsing
    const parsingResults = await testSearchParsing();

    // Test 2: Database Search (if products exist)
    const dbResults = await testDatabaseSearch();

    // Summary
    console.log("\n" + "=" .repeat(80));
    console.log("📋 TEST SUMMARY");
    console.log("=" .repeat(80));
    console.log(`Query Parsing: ${parsingResults.passed}/${parsingResults.total} passed`);
    if (dbResults) {
      console.log(`Database Search: ${dbResults.passed} queries tested`);
    }
    console.log("\n✨ Test complete!");

    process.exit(parsingResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

runTests();
