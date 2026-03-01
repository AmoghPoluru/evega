import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  entityExistsBySlug,
  logSuccess,
  logError,
  logSkip,
  logSection,
  ProgressTracker,
} from "./utils/seed-helpers";

interface CategoryData {
  name: string;
  slug: string;
  parentSlug?: string;
  color?: string;
  description?: string;
  subcategories?: CategoryData[];
}

const MAIN_CATEGORIES: CategoryData[] = [
  {
    name: "Indo-Western",
    slug: "indo-western",
    color: "#AA96DA",
    description: "Fusion wear combining Indian and Western styles",
    subcategories: [
      {
        name: "Fusion Dresses",
        slug: "fusion-dresses",
        subcategories: [
          { name: "Cape Dresses", slug: "cape-dresses" },
          { name: "Crop Top Sets", slug: "crop-top-sets" },
        ],
      },
      {
        name: "Dhoti Pants",
        slug: "dhoti-pants",
        subcategories: [
          { name: "Traditional Dhoti", slug: "traditional-dhoti" },
          { name: "Modern Dhoti", slug: "modern-dhoti" },
        ],
      },
    ],
  },
];

const createCategory = async (
  payload: any,
  categoryData: CategoryData,
  parentId?: string
): Promise<string | null> => {
  try {
    const exists = await entityExistsBySlug(payload, "categories", categoryData.slug);

    if (exists) {
      logSkip(`Category "${categoryData.name}" already exists`);
      const existing = await payload.find({
        collection: "categories",
        where: { slug: { equals: categoryData.slug } },
        limit: 1,
      });
      return existing.docs[0]?.id || null;
    }

    const category = await payload.create({
      collection: "categories",
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        color: categoryData.color || null,
        parent: parentId || null,
      },
    });

    logSuccess(`Created category: ${categoryData.name}`);
    return category.id;
  } catch (error) {
    logError(`Failed to create category: ${categoryData.name}`, error);
    return null;
  }
};

const createCategoryRecursive = async (
  payload: any,
  categoryData: CategoryData,
  parentId?: string
): Promise<void> => {
  const categoryId = await createCategory(payload, categoryData, parentId);

  if (categoryId && categoryData.subcategories) {
    for (const subcategory of categoryData.subcategories) {
      await createCategoryRecursive(payload, subcategory, categoryId);
    }
  }
};

const seedCategories = async () => {
  try {
    logSection("🌱 Starting Categories Seeding");
    const payload = await getPayloadInstance();

    let totalCategories = 0;
    const countCategories = (cats: CategoryData[]): number => {
      let count = cats.length;
      cats.forEach((cat) => {
        if (cat.subcategories) {
          count += countCategories(cat.subcategories);
        }
      });
      return count;
    };
    totalCategories = countCategories(MAIN_CATEGORIES);

    const progress = new ProgressTracker(totalCategories, "Categories");
    let createdCount = 0;
    let skippedCount = 0;

    for (const category of MAIN_CATEGORIES) {
      await createCategoryRecursive(payload, category);
      progress.increment(category.name);
    }

    logSection("✅ Categories Seeding Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Total categories processed`);
    console.log(`   - Check logs above for created/skipped counts`);
  } catch (error) {
    logError("Categories seeding failed", error);
    throw error;
  }
};

// Run if executed directly
seedCategories()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
