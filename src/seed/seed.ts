import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { execSync } from "child_process";

// ==================== TAGS DATA ====================
const tags = [
  "Handcrafted",
  "3D Design",
  "Limited Edition",
  "Best Seller",
  "New Release",
  "Hypoallergenic",
  "Adjustable",
  "Gift Ready",
  "Everyday Wear",
  "Statement Piece",
  "Minimalist",
  "Vintage Inspired",
  "Modern",
  "Geometric",
  "Floral",
  "Layering",
  "Stackable",
  "Brass",
  "Bronze",
  "Silver",
  "Seasonal",
  "Spring",
  "Summer",
  "Fall",
  "Winter",
  "Holiday",
];

// ==================== SEED FUNCTIONS ====================

const seedAdminUser = async (payload: any) => {
  try {
    const existingUsers = await payload.find({
      collection: "users",
      limit: 1,
    });

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: "users",
        data: {
          email: "admin@example.com",
          password: "admin123",
          username: "admin",
          roles: ["super-admin"],
        },
      });
      console.log("✓ Admin user created: admin@example.com / admin123");
    } else {
      console.log("⏭️  Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
};

const seedCategories = async () => {
  console.log("\n" + "=".repeat(50));
  console.log("Seeding categories using seed-categories.ts...");
  console.log("=".repeat(50));
  try {
    execSync("npx tsx src/seed/seed-categories.ts", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

const seedProducts = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Product seeding skipped - products should be created through vendor dashboard");
  console.log("=".repeat(50));
  // Products are now created through vendor dashboard
  // If you need sample products, create them separately
};

const seedTags = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting tag seeding...");
  let tagsCreated = 0;
  let tagsSkipped = 0;
  let tagsFailed = 0;

  for (const tagName of tags) {
    try {
      // Check if tag already exists
      const existingTag = await payload.find({
        collection: "tags",
        where: {
          name: {
            equals: tagName,
          },
        },
        limit: 1,
      });

      if (existingTag.docs.length === 0) {
        await payload.create({
          collection: "tags",
          data: {
            name: tagName,
          },
        });
        tagsCreated++;
        console.log(`✓ Created tag: ${tagName}`);
      } else {
        tagsSkipped++;
      }
    } catch (error) {
      console.error(`❌ Error creating tag ${tagName}:`, error);
      tagsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Tag seeding completed!");
  console.log(`✓ Created: ${tagsCreated}`);
  console.log(`⏭️  Skipped: ${tagsSkipped}`);
  console.log(`❌ Failed: ${tagsFailed}`);
  console.log("=".repeat(50));
};

// ==================== MAIN SEED FUNCTION ====================

const seed = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    console.log("\n💡 Note: This script now uses the new modular seed files.");
    console.log("   For full setup, use: npm run db:seed:core");
    console.log("   For fresh start, use: npm run db:seed:fresh\n");
    
    const payload = await getPayload({ config });

    // Seed in order: Admin User -> Categories -> Tags
    await seedAdminUser(payload);
    await seedCategories();
    await seedProducts(payload);
    await seedTags(payload);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("\n💡 To load variant types, options, and category configs:");
    console.log("   Run: npm run db:seed:core");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
