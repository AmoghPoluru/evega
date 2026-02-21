import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Script to assign a vendor to all products
 * Usage: npx tsx src/scripts/assign-vendor-to-products.ts
 */
async function assignVendorToProducts() {
  try {
    console.log("🌱 Starting vendor assignment...");
    const payload = await getPayload({ config });

    // Find the vendor by name or slug
    const vendorName = "maruthi";
    const vendorResult = await payload.find({
      collection: "vendors",
      where: {
        or: [
          { name: { contains: vendorName, options: "i" } },
          { slug: { equals: vendorName } },
        ],
      },
      limit: 1,
    });

    if (vendorResult.docs.length === 0) {
      console.error(`❌ Vendor "${vendorName}" not found.`);
      console.log("Available vendors:");
      const allVendors = await payload.find({
        collection: "vendors",
        limit: 100,
      });
      allVendors.docs.forEach((v: any) => {
        console.log(`  - ${v.name} (slug: ${v.slug})`);
      });
      process.exit(1);
    }

    const vendor = vendorResult.docs[0];
    console.log(`✓ Found vendor: ${vendor.name} (ID: ${vendor.id})`);

    // Get all products
    const productsResult = await payload.find({
      collection: "products",
      limit: 1000, // Adjust if you have more products
    });

    const products = productsResult.docs;
    console.log(`\n📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log("⏭️  No products to update");
      process.exit(0);
    }

    // Update each product
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      try {
        // Check if product already has this vendor
        const currentVendorId = typeof product.vendor === "string" 
          ? product.vendor 
          : product.vendor?.id;

        if (currentVendorId === vendor.id) {
          console.log(`⏭️  Product "${product.name}" already has vendor "${vendor.name}"`);
          skipped++;
          continue;
        }

        // Update product with vendor
        await payload.update({
          collection: "products",
          id: product.id,
          data: {
            vendor: vendor.id,
          },
        });

        console.log(`✓ Updated product: "${product.name}"`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Failed to update product "${product.name}":`, error.message);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Vendor assignment completed!");
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

assignVendorToProducts();
