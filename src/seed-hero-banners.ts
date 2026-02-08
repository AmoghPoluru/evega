import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

// ==================== HERO BANNERS DATA ====================
// Products will be assigned by name after products are seeded
const heroBanners = [
  {
    title: "Featured Brass 3D Designs",
    subtitle: "Handcrafted with Excellence",
    productNames: [
      "Vastu Trunk Up Brass 3d Elephant Statue",
      "Small Brass 3D Fine Kamdhenu Cow With Calf",
      "Small 3D Brass Goddess Lakshmi & Lord Ganesha",
      "Brass Tirupati Balaji Idol With Garuda Base",
    ],
    isActive: true,
    order: 1,
  },
  {
    title: "Premium Religious Idols",
    subtitle: "Divine Collection for Your Home",
    productNames: [
      "Brass Narayana/Vishnu Lakshmi On Ananta-Sajya",
      "Brass Lord Vishnu Murti - 6\" Standing Idol For Mandir",
      "Brass Lakshmi Idol Standing On Lotus",
      "Brass Durga Maa Murti With Lion - 6\" Standing Idol For Mandir",
    ],
    isActive: true,
    order: 2,
  },
  {
    title: "Best Sellers",
    subtitle: "Most Popular Products",
    productNames: [
      "Vastu Trunk Up Brass 3d Elephant Statue",
      "Small Brass 3D Fine Kamdhenu Cow With Calf",
      "Brass Lakshmi Idol Standing On Lotus",
    ],
    isActive: true,
    order: 3,
  },
];

// ==================== SEED FUNCTION ====================

const seedHeroBanners = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting hero banner seeding...");
  let bannersCreated = 0;
  let bannersSkipped = 0;
  let bannersFailed = 0;

  for (const bannerData of heroBanners) {
    try {
      // Check if banner already exists (by title)
      const existingBanner = await payload.find({
        collection: "hero-banners",
        where: {
          title: {
            equals: bannerData.title,
          },
        },
        limit: 1,
      });

      if (existingBanner.docs.length > 0) {
        console.log(`⏭️  Hero banner already exists: ${bannerData.title}`);
        bannersSkipped++;
        continue;
      }

      // Find products by name
      const productIds: string[] = [];
      for (const productName of bannerData.productNames) {
        const productResult = await payload.find({
          collection: "products",
          where: {
            name: {
              equals: productName,
            },
          },
          limit: 1,
        });

        if (productResult.docs.length > 0) {
          productIds.push(productResult.docs[0].id);
        } else {
          console.warn(`  ⚠️  Product not found: ${productName}`);
        }
      }

      if (productIds.length === 0) {
        console.error(`  ❌ No products found for banner: ${bannerData.title}`);
        bannersFailed++;
        continue;
      }

      await payload.create({
        collection: "hero-banners",
        data: {
          title: bannerData.title,
          subtitle: bannerData.subtitle || null,
          products: productIds,
          isActive: bannerData.isActive,
          order: bannerData.order,
        },
      });

      bannersCreated++;
      console.log(`✓ Created hero banner: ${bannerData.title} (${productIds.length} products)`);
    } catch (error) {
      console.error(`❌ Error creating hero banner ${bannerData.title}:`, error);
      bannersFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Hero banner seeding completed!");
  console.log(`✓ Created: ${bannersCreated}`);
  console.log(`⏭️  Skipped: ${bannersSkipped}`);
  console.log(`❌ Failed: ${bannersFailed}`);
  console.log("=".repeat(50));
};

// ==================== MAIN FUNCTION ====================

const seed = async () => {
  try {
    console.log("🌱 Starting hero banner seeding...");
    const payload = await getPayload({ config });

    await seedHeroBanners(payload);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Hero banner seeding completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
