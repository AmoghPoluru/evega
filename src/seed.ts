import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

// ==================== CATEGORIES DATA ====================
const categories = [
  {
    name: "BRASS 3D DESIGNS",
    color: "#B8860B", // Dark goldenrod (brass color)
    slug: "brass-3d-designs",
    subcategories: [],
  },
];

// ==================== PRODUCTS DATA ====================
const products = [
  {
    name: "Vastu Trunk Up Brass 3d Elephant Statue",
    description: "Elevate your living spaces with Agromech's stunning Brass 3D Designs. This beautifully crafted elephant statue with trunk raised brings positive energy and prosperity to your home. Handcrafted with intricate details and premium brass quality.",
    price: 3299.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Small Brass 3D Fine Kamdhenu Cow With Calf",
    description: "A divine representation of Kamdhenu, the wish-fulfilling cow, with her calf. This handcrafted brass statue features exquisite 3D detailing and is perfect for home decor, mandir, or as a thoughtful gift. Made with premium brass for lasting beauty.",
    price: 2760.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Small 3D Brass Goddess Lakshmi & Lord Ganesha",
    description: "A beautiful brass statue featuring Goddess Lakshmi and Lord Ganesha seated together. This divine piece brings blessings of wealth and wisdom to your home. Expertly crafted with intricate 3D designs and premium brass quality.",
    price: 3150.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Brass Tirupati Balaji Idol With Garuda Base",
    description: "A divine brass idol of Tirupati Balaji (Lord Venkateswara) standing on a Garuda base. This handcrafted piece features multiple arms holding various attributes and is perfect for your mandir or home altar. Made with premium brass for timeless elegance.",
    price: 2499.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Brass Narayana/Vishnu Lakshmi On Ananta-Sajya",
    description: "A magnificent brass statue depicting Lord Vishnu (Narayana) reclining on the multi-headed serpent Sheshnag, with Goddess Lakshmi seated at his feet. This divine piece features intricate 3D detailing and is perfect for home decor or mandir.",
    price: 4999.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Brass Lord Vishnu Murti - 6\" Standing Idol For Mandir",
    description: "A beautiful standing brass idol of Lord Vishnu with four arms holding his traditional attributes. This 6-inch statue stands on a lotus-shaped base and is perfect for your mandir or home altar. Handcrafted with premium brass and intricate details.",
    price: 3499.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Brass Lakshmi Idol Standing On Lotus",
    description: "A divine brass statue of Goddess Lakshmi standing on a lotus pedestal. This handcrafted piece features four arms holding lotus flowers and in a gesture of blessing. Perfect for home decor, mandir, or as a gift. Made with premium brass quality.",
    price: 2899.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
  {
    name: "Brass Durga Maa Murti With Lion - 6\" Standing Idol For Mandir",
    description: "A powerful brass statue of Goddess Durga Maa with multiple arms holding weapons, riding a lion. This 6-inch standing idol is perfect for your mandir or home altar. Handcrafted with intricate 3D details and premium brass for lasting beauty.",
    price: 3299.00,
    categorySlug: "brass-3d-designs",
    refundPolicy: "30-day",
  },
];

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

const seedCategories = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting category seeding...");
  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  let categoriesFailed = 0;

  for (const category of categories) {
    try {
      // Check if category already exists
      const existingCategory = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: category.slug,
          },
        },
        limit: 1,
      });

      let categoryDoc;
      if (existingCategory.docs.length > 0) {
        categoryDoc = existingCategory.docs[0];
        console.log(`⏭️  Category already exists: ${category.name}`);
        categoriesSkipped++;
      } else {
        // Create parent category
        categoryDoc = await payload.create({
          collection: "categories",
          data: {
            name: category.name,
            slug: category.slug,
            color: category.color || null,
          },
        });
        console.log(`✓ Created category: ${category.name}`);
        categoriesCreated++;
      }

      // Create subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        for (const subCategory of category.subcategories) {
          try {
            // Check if subcategory already exists
            const existingSubcategory = await payload.find({
              collection: "categories",
              where: {
                slug: {
                  equals: subCategory.slug,
                },
                parent: {
                  equals: categoryDoc.id,
                },
              },
              limit: 1,
            });

            if (existingSubcategory.docs.length === 0) {
              await payload.create({
                collection: "categories",
                data: {
                  name: subCategory.name,
                  slug: subCategory.slug,
                  parent: categoryDoc.id,
                },
              });
              console.log(`  ✓ Created subcategory: ${subCategory.name}`);
            } else {
              console.log(`  ⏭️  Subcategory already exists: ${subCategory.name}`);
            }
          } catch (error) {
            console.error(`  ❌ Error creating subcategory ${subCategory.name}:`, error);
            categoriesFailed++;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error);
      categoriesFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Category seeding completed!");
  console.log(`✓ Created: ${categoriesCreated}`);
  console.log(`⏭️  Skipped: ${categoriesSkipped}`);
  console.log(`❌ Failed: ${categoriesFailed}`);
  console.log("=".repeat(50));
};

const seedProducts = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting product seeding...");
  let productsCreated = 0;
  let productsSkipped = 0;
  let productsFailed = 0;

  for (const productData of products) {
    try {
      // Find category by slug
      const categoryResult = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: productData.categorySlug,
          },
        },
        limit: 1,
      });

      const category = categoryResult.docs[0];
      if (!category) {
        console.error(`❌ Category not found: ${productData.categorySlug} for product: ${productData.name}`);
        productsFailed++;
        continue;
      }

      // Find subcategory by slug and parent (if subcategorySlug is provided)
      let subcategory = null;
      if (productData.subcategorySlug) {
        const subcategoryResult = await payload.find({
          collection: "categories",
          where: {
            slug: {
              equals: productData.subcategorySlug,
            },
            parent: {
              equals: category.id,
            },
          },
          limit: 1,
        });

        subcategory = subcategoryResult.docs[0];
        if (!subcategory) {
          console.error(`❌ Subcategory not found: ${productData.subcategorySlug} for category ${productData.categorySlug} - Product: ${productData.name}`);
          productsFailed++;
          continue;
        }
      }

      // Check if product already exists
      const existingProduct = await payload.find({
        collection: "products",
        where: {
          name: {
            equals: productData.name,
          },
        },
        limit: 1,
      });

      if (existingProduct.docs.length > 0) {
        console.log(`⏭️  Product already exists: ${productData.name}`);
        productsSkipped++;
        continue;
      }

      // Create product
      await payload.create({
        collection: "products",
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: category.id,
          subcategory: subcategory ? subcategory.id : null,
          refundPolicy: productData.refundPolicy || "30-day",
          isPrivate: false,
          isArchived: false,
        },
      });

      productsCreated++;
      console.log(`✓ Created product: ${productData.name}`);
    } catch (error) {
      console.error(`❌ Error creating product ${productData.name}:`, error);
      productsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Product seeding completed!");
  console.log(`✓ Created: ${productsCreated}`);
  console.log(`⏭️  Skipped: ${productsSkipped}`);
  console.log(`❌ Failed: ${productsFailed}`);
  console.log("=".repeat(50));
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
    const payload = await getPayload({ config });

    // Seed in order: Admin User -> Categories -> Products -> Tags
    await seedAdminUser(payload);
    await seedCategories(payload);
    await seedProducts(payload);
    await seedTags(payload);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Database seeding completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
