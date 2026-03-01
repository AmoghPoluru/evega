import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  entityExistsByName,
  logSuccess,
  logError,
  logSkip,
  logSection,
  ProgressTracker,
} from "./utils/seed-helpers";

// Tags based on categories and subcategories
const CATEGORY_TAGS = [
  "Sarees",
  "Lehengas",
  "Salwar Kameez",
  "Kurtas",
  "Kurtis",
  "Indo-Western",
  "Blouses",
  "Cholis",
  "Dupattas",
  "Stoles",
  "Accessories",
  "Men's Wear",
  "Kids' Wear",
  "Pooja Items",
  "Home & Living",
];

// Subcategory-based tags
const SUBCATEGORY_TAGS = [
  "Silk",
  "Cotton",
  "Georgette",
  "Chiffon",
  "Linen",
  "Net",
  "Bridal",
  "Party Wear",
  "Casual",
  "Designer",
  "Traditional",
  "Modern",
  "Embroidered",
  "Printed",
  "Plain",
  "Anarkali",
  "Palazzo",
  "Patiala",
  "Churidar",
  "Straight Cut",
  "Kanchipuram",
  "Banarasi",
  "Mysore",
  "Tussar",
  "Raw Silk",
  "Organza",
  "Handloom",
  "Khadi",
  "Heavy Embroidered",
  "Light Embroidered",
  "Zari Work",
  "Sequined",
  "Sharara",
  "Sherwani",
  "Kurta Sets",
  "Nehru Jacket",
  "Dhoti",
];

// Material-based tags
const MATERIAL_TAGS = [
  "Silk",
  "Cotton",
  "Georgette",
  "Chiffon",
  "Linen",
  "Net",
  "Velvet",
  "Organza",
  "Tussar",
  "Raw Silk",
  "Pashmina",
  "Brass",
  "Copper",
  "Silver",
  "Gold",
  "Rose Gold",
  "Platinum",
  "Leather",
  "Marble",
  "Wood",
  "Clay",
  "Resin",
  "Stone",
];

// Occasion-based tags
const OCCASION_TAGS = [
  "Wedding",
  "Bridal",
  "Festival",
  "Diwali",
  "Eid",
  "Holi",
  "Navratri",
  "Party",
  "Cocktail Party",
  "Formal",
  "Casual",
  "Office Wear",
  "Daily Wear",
  "Evening Wear",
  "Traditional",
  "Religious",
  "Pooja",
];

// Style-based tags
const STYLE_TAGS = [
  "Traditional",
  "Modern",
  "Contemporary",
  "Fusion",
  "Designer",
  "High-End",
  "Embroidered",
  "Printed",
  "Plain",
  "Heavy Work",
  "Light Work",
  "Zari",
  "Sequined",
  "Handcrafted",
  "Machine Made",
  "Handloom",
  "Handmade",
];

// Color-based tags
const COLOR_TAGS = [
  "Red",
  "Maroon",
  "Pink",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Black",
  "White",
  "Navy",
  "Gold",
  "Silver",
  "Rose Gold",
  "Champagne",
  "Emerald",
  "Ruby",
  "Sapphire",
];

// Size-based tags
const SIZE_TAGS = [
  "Plus Size",
  "Petite",
  "Tall",
  "Regular Fit",
  "Loose Fit",
  "Slim Fit",
];

// Feature tags
const FEATURE_TAGS = [
  "Handcrafted",
  "3D Design",
  "Limited Edition",
  "Best Seller",
  "New Release",
  "Gift Ready",
  "Everyday Wear",
  "Statement Piece",
  "Minimalist",
  "Vintage Inspired",
  "Geometric",
  "Floral",
  "Layering",
  "Stackable",
  "Adjustable",
  "Hypoallergenic",
  "Seasonal",
  "Spring",
  "Summer",
  "Fall",
  "Winter",
  "Holiday",
  "Premium Quality",
  "Eco-Friendly",
  "Sustainable",
  "Organic",
  "Washable",
  "Dry Clean Only",
];

// Combine all tags
const ALL_TAGS = [
  ...new Set([
    ...CATEGORY_TAGS,
    ...SUBCATEGORY_TAGS,
    ...MATERIAL_TAGS,
    ...OCCASION_TAGS,
    ...STYLE_TAGS,
    ...COLOR_TAGS,
    ...SIZE_TAGS,
    ...FEATURE_TAGS,
  ]),
].sort();

const seedTags = async () => {
  try {
    logSection("🌱 Starting Tags Seeding");
    const payload = await getPayloadInstance();

    const progress = new ProgressTracker(ALL_TAGS.length, "Tags");
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const tagName of ALL_TAGS) {
      try {
        const exists = await entityExistsByName(payload, "tags", tagName);

        if (exists) {
          logSkip(`Tag "${tagName}" already exists`);
          skippedCount++;
          progress.increment();
          continue;
        }

        await payload.create({
          collection: "tags",
          data: {
            name: tagName,
          },
        });

        logSuccess(`Created tag: ${tagName}`);
        createdCount++;
      } catch (error) {
        logError(`Failed to create tag: ${tagName}`, error);
        errorCount++;
      }

      progress.increment();
    }

    logSection("✅ Tags Seeding Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} tags`);
    console.log(`   - Skipped: ${skippedCount} tags`);
    console.log(`   - Errors: ${errorCount} tags`);
    console.log(`   - Total: ${ALL_TAGS.length} tags`);
  } catch (error) {
    logError("Tags seeding failed", error);
    process.exit(1);
  }
};

seedTags()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
