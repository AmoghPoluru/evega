import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

// ==================== PRODUCT TAG MAPPING ====================
// Map product names to tag names
const productTagMapping: Record<string, string[]> = {
  "Vastu Trunk Up Brass 3d Elephant Statue": ["Handcrafted", "3D Design", "Brass", "Best Seller"],
  "Small Brass 3D Fine Kamdhenu Cow With Calf": ["Handcrafted", "3D Design", "Brass", "Religious"],
  "Small 3D Brass Goddess Lakshmi & Lord Ganesha": ["Handcrafted", "3D Design", "Brass", "Religious", "Best Seller"],
  "Brass Tirupati Balaji Idol With Garuda Base": ["Handcrafted", "3D Design", "Brass", "Religious"],
  "Brass Narayana/Vishnu Lakshmi On Ananta-Sajya": ["Handcrafted", "3D Design", "Brass", "Religious"],
  "Brass Lord Vishnu Murti - 6\" Standing Idol For Mandir": ["Handcrafted", "3D Design", "Brass", "Religious"],
  "Brass Lakshmi Idol Standing On Lotus": ["Handcrafted", "3D Design", "Brass", "Religious", "Best Seller"],
  "Brass Durga Maa Murti With Lion - 6\" Standing Idol For Mandir": ["Handcrafted", "3D Design", "Brass", "Religious"],
};

// ==================== UPDATE FUNCTION ====================

const updateProductsWithTags = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting product tags update...");
  let productsUpdated = 0;
  let productsSkipped = 0;
  let productsFailed = 0;

  // Get all products
  const allProducts = await payload.find({
    collection: "products",
    limit: 1000,
    depth: 0,
  });

  for (const product of allProducts.docs) {
    try {
      const tagNames = productTagMapping[product.name];
      
      if (!tagNames || tagNames.length === 0) {
        console.log(`⏭️  No tags defined for product: ${product.name}`);
        productsSkipped++;
        continue;
      }

      // Find tag IDs by name
      const tagIds: string[] = [];
      for (const tagName of tagNames) {
        const tagResult = await payload.find({
          collection: "tags",
          where: {
            name: {
              equals: tagName,
            },
          },
          limit: 1,
        });

        if (tagResult.docs.length > 0) {
          tagIds.push(tagResult.docs[0].id);
        } else {
          console.warn(`  ⚠️  Tag not found: ${tagName}`);
        }
      }

      if (tagIds.length === 0) {
        console.warn(`  ⚠️  No valid tags found for product: ${product.name}`);
        productsSkipped++;
        continue;
      }

      // Update product with tags
      await payload.update({
        collection: "products",
        id: product.id,
        data: {
          tags: tagIds,
        },
      });

      productsUpdated++;
      console.log(`✓ Updated product: ${product.name} with ${tagIds.length} tags`);
    } catch (error) {
      console.error(`❌ Error updating product ${product.name}:`, error);
      productsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Product tags update completed!");
  console.log(`✓ Updated: ${productsUpdated}`);
  console.log(`⏭️  Skipped: ${productsSkipped}`);
  console.log(`❌ Failed: ${productsFailed}`);
  console.log("=".repeat(50));
};

// ==================== MAIN FUNCTION ====================

const update = async () => {
  try {
    console.log("🌱 Starting product tags update...");
    const payload = await getPayload({ config });

    await updateProductsWithTags(payload);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Product tags update completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  }
};

update();
