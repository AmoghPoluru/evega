import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getPayloadInstance,
  variantOptionExists,
  logSuccess,
  logError,
  logSkip,
  logSection,
  ProgressTracker,
} from "./utils/seed-helpers";

// Color hex codes
const COLOR_HEX_CODES: Record<string, string> = {
  Red: "#FF0000",
  Maroon: "#800000",
  Pink: "#FFC0CB",
  Blue: "#0000FF",
  Green: "#008000",
  Yellow: "#FFFF00",
  Orange: "#FFA500",
  Purple: "#800080",
  Black: "#000000",
  White: "#FFFFFF",
  Navy: "#000080",
  Gold: "#FFD700",
  Silver: "#C0C0C0",
  "Rose Gold": "#E8B4B8",
  Champagne: "#F7E7CE",
  "Midnight Blue": "#191970",
  Emerald: "#50C878",
  "Ruby Red": "#E0115F",
  "Sapphire Blue": "#0F52BA",
  Ivory: "#FFFFF0",
  Beige: "#F5F5DC",
  Tan: "#D2B48C",
  Cream: "#FFFDD0",
  Brown: "#A52A2A",
  Bronze: "#CD7F32",
};

interface VariantOptionData {
  value: string;
  label?: string;
  variantTypeSlug: string;
  hexCode?: string;
  displayOrder?: number;
}

const VARIANT_OPTIONS: VariantOptionData[] = [
  // Size options
  { value: "XS", variantTypeSlug: "size", displayOrder: 1 },
  { value: "S", variantTypeSlug: "size", displayOrder: 2 },
  { value: "M", variantTypeSlug: "size", displayOrder: 3 },
  { value: "L", variantTypeSlug: "size", displayOrder: 4 },
  { value: "XL", variantTypeSlug: "size", displayOrder: 5 },
  { value: "2XL", variantTypeSlug: "size", displayOrder: 6 },
  { value: "3XL", variantTypeSlug: "size", displayOrder: 7 },
  { value: "4XL", variantTypeSlug: "size", displayOrder: 8 },
  { value: "Petite S", variantTypeSlug: "size", displayOrder: 9 },
  { value: "Petite M", variantTypeSlug: "size", displayOrder: 10 },
  { value: "Petite L", variantTypeSlug: "size", displayOrder: 11 },
  { value: "Tall L", variantTypeSlug: "size", displayOrder: 12 },
  { value: "Tall XL", variantTypeSlug: "size", displayOrder: 13 },
  { value: "Small", variantTypeSlug: "size", displayOrder: 14 },
  { value: "Medium", variantTypeSlug: "size", displayOrder: 15 },
  { value: "Large", variantTypeSlug: "size", displayOrder: 16 },
  { value: "Extra Large", variantTypeSlug: "size", displayOrder: 17 },
  { value: "One Size", variantTypeSlug: "size", displayOrder: 18 },
  { value: "King Size", variantTypeSlug: "size", displayOrder: 19 },
  { value: "Queen Size", variantTypeSlug: "size", displayOrder: 20 },

  // Blouse Size options
  { value: "32", variantTypeSlug: "blouseSize", displayOrder: 1 },
  { value: "34", variantTypeSlug: "blouseSize", displayOrder: 2 },
  { value: "36", variantTypeSlug: "blouseSize", displayOrder: 3 },
  { value: "38", variantTypeSlug: "blouseSize", displayOrder: 4 },
  { value: "40", variantTypeSlug: "blouseSize", displayOrder: 5 },
  { value: "42", variantTypeSlug: "blouseSize", displayOrder: 6 },
  { value: "44", variantTypeSlug: "blouseSize", displayOrder: 7 },

  // Shoe Size options
  { value: "4", variantTypeSlug: "shoeSize", displayOrder: 1 },
  { value: "5", variantTypeSlug: "shoeSize", displayOrder: 2 },
  { value: "6", variantTypeSlug: "shoeSize", displayOrder: 3 },
  { value: "7", variantTypeSlug: "shoeSize", displayOrder: 4 },
  { value: "8", variantTypeSlug: "shoeSize", displayOrder: 5 },
  { value: "9", variantTypeSlug: "shoeSize", displayOrder: 6 },
  { value: "10", variantTypeSlug: "shoeSize", displayOrder: 7 },

  // Ring Size options
  { value: "5", variantTypeSlug: "ringSize", displayOrder: 1 },
  { value: "6", variantTypeSlug: "ringSize", displayOrder: 2 },
  { value: "7", variantTypeSlug: "ringSize", displayOrder: 3 },
  { value: "8", variantTypeSlug: "ringSize", displayOrder: 4 },
  { value: "9", variantTypeSlug: "ringSize", displayOrder: 5 },
  { value: "10", variantTypeSlug: "ringSize", displayOrder: 6 },
  { value: "11", variantTypeSlug: "ringSize", displayOrder: 7 },

  // Chest Size options
  { value: "38", variantTypeSlug: "chest", displayOrder: 1 },
  { value: "40", variantTypeSlug: "chest", displayOrder: 2 },
  { value: "42", variantTypeSlug: "chest", displayOrder: 3 },
  { value: "44", variantTypeSlug: "chest", displayOrder: 4 },
  { value: "46", variantTypeSlug: "chest", displayOrder: 5 },
  { value: "48", variantTypeSlug: "chest", displayOrder: 6 },

  // Color options
  { value: "Red", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Red, displayOrder: 1 },
  { value: "Maroon", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Maroon, displayOrder: 2 },
  { value: "Pink", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Pink, displayOrder: 3 },
  { value: "Blue", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Blue, displayOrder: 4 },
  { value: "Green", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Green, displayOrder: 5 },
  { value: "Yellow", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Yellow, displayOrder: 6 },
  { value: "Orange", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Orange, displayOrder: 7 },
  { value: "Purple", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Purple, displayOrder: 8 },
  { value: "Black", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Black, displayOrder: 9 },
  { value: "White", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.White, displayOrder: 10 },
  { value: "Navy", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Navy, displayOrder: 11 },
  { value: "Gold", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Gold, displayOrder: 12 },
  { value: "Silver", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Silver, displayOrder: 13 },
  { value: "Rose Gold", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES["Rose Gold"], displayOrder: 14 },
  { value: "Champagne", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Champagne, displayOrder: 15 },
  { value: "Midnight Blue", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES["Midnight Blue"], displayOrder: 16 },
  { value: "Emerald", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Emerald, displayOrder: 17 },
  { value: "Ruby Red", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES["Ruby Red"], displayOrder: 18 },
  { value: "Sapphire Blue", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES["Sapphire Blue"], displayOrder: 19 },
  { value: "Ivory", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Ivory, displayOrder: 20 },
  { value: "Beige", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Beige, displayOrder: 21 },
  { value: "Tan", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Tan, displayOrder: 22 },
  { value: "Cream", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Cream, displayOrder: 23 },
  { value: "Brown", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Brown, displayOrder: 24 },
  { value: "Bronze", variantTypeSlug: "color", hexCode: COLOR_HEX_CODES.Bronze, displayOrder: 25 },
  { value: "Copper", variantTypeSlug: "color", hexCode: "#B87333", displayOrder: 26 },
  { value: "Natural", variantTypeSlug: "color", hexCode: "#F5F5DC", displayOrder: 27 },
  { value: "Painted", variantTypeSlug: "color", hexCode: "#FFFFFF", displayOrder: 28 },
  { value: "Various", variantTypeSlug: "color", hexCode: "#000000", displayOrder: 29 },

  // Material options - Fabric
  { value: "Silk", variantTypeSlug: "material", displayOrder: 1 },
  { value: "Cotton", variantTypeSlug: "material", displayOrder: 2 },
  { value: "Georgette", variantTypeSlug: "material", displayOrder: 3 },
  { value: "Chiffon", variantTypeSlug: "material", displayOrder: 4 },
  { value: "Linen", variantTypeSlug: "material", displayOrder: 5 },
  { value: "Net", variantTypeSlug: "material", displayOrder: 6 },
  { value: "Velvet", variantTypeSlug: "material", displayOrder: 7 },
  { value: "Organza", variantTypeSlug: "material", displayOrder: 8 },
  { value: "Tussar", variantTypeSlug: "material", displayOrder: 9 },
  { value: "Raw Silk", variantTypeSlug: "material", displayOrder: 10 },
  { value: "Pashmina", variantTypeSlug: "material", displayOrder: 11 },
  { value: "Polyester", variantTypeSlug: "material", displayOrder: 12 },
  { value: "Blend", variantTypeSlug: "material", displayOrder: 13 },

  // Material options - Jewelry
  { value: "Gold", variantTypeSlug: "material", displayOrder: 14 },
  { value: "Silver", variantTypeSlug: "material", displayOrder: 15 },
  { value: "Rose Gold", variantTypeSlug: "material", displayOrder: 16 },
  { value: "Brass", variantTypeSlug: "material", displayOrder: 17 },
  { value: "Copper", variantTypeSlug: "material", displayOrder: 18 },
  { value: "Plated", variantTypeSlug: "material", displayOrder: 19 },
  { value: "Platinum", variantTypeSlug: "material", displayOrder: 20 },

  // Material options - Leather/Footwear
  { value: "Leather", variantTypeSlug: "material", displayOrder: 21 },
  { value: "Synthetic", variantTypeSlug: "material", displayOrder: 22 },
  { value: "Canvas", variantTypeSlug: "material", displayOrder: 23 },
  { value: "Fabric", variantTypeSlug: "material", displayOrder: 24 },
  { value: "Embroidered", variantTypeSlug: "material", displayOrder: 25 },

  // Material options - Pooja
  { value: "Steel", variantTypeSlug: "material", displayOrder: 26 },
  { value: "Wood", variantTypeSlug: "material", displayOrder: 27 },
  { value: "Clay", variantTypeSlug: "material", displayOrder: 28 },
  { value: "Marble", variantTypeSlug: "material", displayOrder: 29 },
  { value: "Resin", variantTypeSlug: "material", displayOrder: 30 },
  { value: "Stone", variantTypeSlug: "material", displayOrder: 31 },

  // Material options - Home Decor
  { value: "Metal", variantTypeSlug: "material", displayOrder: 32 },
  { value: "Ceramic", variantTypeSlug: "material", displayOrder: 33 },
  { value: "Glass", variantTypeSlug: "material", displayOrder: 34 },
  { value: "Plastic", variantTypeSlug: "material", displayOrder: 35 },
  { value: "Paper", variantTypeSlug: "material", displayOrder: 36 },

  // Material options - Other
  { value: "Rudraksha", variantTypeSlug: "material", displayOrder: 37 },
  { value: "Tulsi", variantTypeSlug: "material", displayOrder: 38 },
  { value: "Sandalwood", variantTypeSlug: "material", displayOrder: 39 },
  { value: "Crystal", variantTypeSlug: "material", displayOrder: 40 },
  { value: "Gemstone", variantTypeSlug: "material", displayOrder: 41 },
  { value: "Stainless Steel", variantTypeSlug: "material", displayOrder: 42 },

  // Sleeve Type options
  { value: "Sleeveless", variantTypeSlug: "sleeveType", displayOrder: 1 },
  { value: "Half Sleeve", variantTypeSlug: "sleeveType", displayOrder: 2 },
  { value: "Full Sleeve", variantTypeSlug: "sleeveType", displayOrder: 3 },
  { value: "3/4 Sleeve", variantTypeSlug: "sleeveType", displayOrder: 4 },
  { value: "Backless", variantTypeSlug: "sleeveType", displayOrder: 5 },

  // Bottom Type options
  { value: "Patiala", variantTypeSlug: "bottomType", displayOrder: 1 },
  { value: "Palazzo", variantTypeSlug: "bottomType", displayOrder: 2 },
  { value: "Straight", variantTypeSlug: "bottomType", displayOrder: 3 },
  { value: "Churidar", variantTypeSlug: "bottomType", displayOrder: 4 },
  { value: "Dhoti", variantTypeSlug: "bottomType", displayOrder: 5 },

  // Dupatta Type options
  { value: "Heavy Embroidered", variantTypeSlug: "dupattaType", displayOrder: 1 },
  { value: "Light Embroidered", variantTypeSlug: "dupattaType", displayOrder: 2 },
  { value: "Plain", variantTypeSlug: "dupattaType", displayOrder: 3 },
  { value: "Printed", variantTypeSlug: "dupattaType", displayOrder: 4 },
  { value: "Embroidered", variantTypeSlug: "dupattaType", displayOrder: 5 },

  // Border Type options
  { value: "Heavy Border", variantTypeSlug: "borderType", displayOrder: 1 },
  { value: "Light Border", variantTypeSlug: "borderType", displayOrder: 2 },
  { value: "No Border", variantTypeSlug: "borderType", displayOrder: 3 },

  // Blouse Style options
  { value: "Sleeveless", variantTypeSlug: "blouseStyle", displayOrder: 1 },
  { value: "Half Sleeve", variantTypeSlug: "blouseStyle", displayOrder: 2 },
  { value: "Full Sleeve", variantTypeSlug: "blouseStyle", displayOrder: 3 },
  { value: "Backless", variantTypeSlug: "blouseStyle", displayOrder: 4 },

  // Saree Length options
  { value: "5.5 meters", variantTypeSlug: "sareeLength", displayOrder: 1 },
  { value: "6 meters", variantTypeSlug: "sareeLength", displayOrder: 2 },
  { value: "6.5 meters", variantTypeSlug: "sareeLength", displayOrder: 3 },

  // Length options
  { value: "Short", variantTypeSlug: "length", displayOrder: 1 },
  { value: "Medium", variantTypeSlug: "length", displayOrder: 2 },
  { value: "Long", variantTypeSlug: "length", displayOrder: 3 },
  { value: "Knee Length", variantTypeSlug: "length", displayOrder: 4 },
  { value: "2.5 meters", variantTypeSlug: "length", displayOrder: 5 },
  { value: "2.75 meters", variantTypeSlug: "length", displayOrder: 6 },
  { value: "3 meters", variantTypeSlug: "length", displayOrder: 7 },
  { value: "1 meter", variantTypeSlug: "length", displayOrder: 8 },
  { value: "1.25 meters", variantTypeSlug: "length", displayOrder: 9 },
  { value: "1.5 meters", variantTypeSlug: "length", displayOrder: 10 },

  // Age Group options
  { value: "0-6 months", variantTypeSlug: "ageGroup", displayOrder: 1 },
  { value: "6-12 months", variantTypeSlug: "ageGroup", displayOrder: 2 },
  { value: "1-2 years", variantTypeSlug: "ageGroup", displayOrder: 3 },
  { value: "2-3 years", variantTypeSlug: "ageGroup", displayOrder: 4 },
  { value: "3-4 years", variantTypeSlug: "ageGroup", displayOrder: 5 },
  { value: "4-5 years", variantTypeSlug: "ageGroup", displayOrder: 6 },
  { value: "5-6 years", variantTypeSlug: "ageGroup", displayOrder: 7 },
  { value: "6-8 years", variantTypeSlug: "ageGroup", displayOrder: 8 },
  { value: "8-10 years", variantTypeSlug: "ageGroup", displayOrder: 9 },
  { value: "10-12 years", variantTypeSlug: "ageGroup", displayOrder: 10 },

  // Bead Count options
  { value: "27 beads", variantTypeSlug: "beadCount", displayOrder: 1 },
  { value: "54 beads", variantTypeSlug: "beadCount", displayOrder: 2 },
  { value: "108 beads", variantTypeSlug: "beadCount", displayOrder: 3 },
  { value: "216 beads", variantTypeSlug: "beadCount", displayOrder: 4 },

  // Fragrance options
  { value: "Rose", variantTypeSlug: "fragrance", displayOrder: 1 },
  { value: "Sandalwood", variantTypeSlug: "fragrance", displayOrder: 2 },
  { value: "Jasmine", variantTypeSlug: "fragrance", displayOrder: 3 },
  { value: "Lavender", variantTypeSlug: "fragrance", displayOrder: 4 },
  { value: "Nag Champa", variantTypeSlug: "fragrance", displayOrder: 5 },
  { value: "Frankincense", variantTypeSlug: "fragrance", displayOrder: 6 },

  // Quantity options
  { value: "10 sticks", variantTypeSlug: "quantity", displayOrder: 1 },
  { value: "20 sticks", variantTypeSlug: "quantity", displayOrder: 2 },
  { value: "50 sticks", variantTypeSlug: "quantity", displayOrder: 3 },
  { value: "100 sticks", variantTypeSlug: "quantity", displayOrder: 4 },
  { value: "200 sticks", variantTypeSlug: "quantity", displayOrder: 5 },

  // Kit Type options
  { value: "Daily Pooja", variantTypeSlug: "kitType", displayOrder: 1 },
  { value: "Festival Pooja", variantTypeSlug: "kitType", displayOrder: 2 },
  { value: "Wedding Pooja", variantTypeSlug: "kitType", displayOrder: 3 },
  { value: "Special Occasion", variantTypeSlug: "kitType", displayOrder: 4 },

  // Language options
  { value: "Hindi", variantTypeSlug: "language", displayOrder: 1 },
  { value: "English", variantTypeSlug: "language", displayOrder: 2 },
  { value: "Sanskrit", variantTypeSlug: "language", displayOrder: 3 },
  { value: "Tamil", variantTypeSlug: "language", displayOrder: 4 },
  { value: "Telugu", variantTypeSlug: "language", displayOrder: 5 },
  { value: "Marathi", variantTypeSlug: "language", displayOrder: 6 },

  // Binding options
  { value: "Hardcover", variantTypeSlug: "binding", displayOrder: 1 },
  { value: "Paperback", variantTypeSlug: "binding", displayOrder: 2 },
  { value: "Spiral", variantTypeSlug: "binding", displayOrder: 3 },

  // Format options
  { value: "Book", variantTypeSlug: "format", displayOrder: 1 },
  { value: "E-book", variantTypeSlug: "format", displayOrder: 2 },
  { value: "Audiobook", variantTypeSlug: "format", displayOrder: 3 },

  // Design options
  { value: "Traditional", variantTypeSlug: "design", displayOrder: 1 },
  { value: "Modern", variantTypeSlug: "design", displayOrder: 2 },
  { value: "Contemporary", variantTypeSlug: "design", displayOrder: 3 },
  { value: "Antique", variantTypeSlug: "design", displayOrder: 4 },
  { value: "Engraved", variantTypeSlug: "design", displayOrder: 5 },
  { value: "Plain", variantTypeSlug: "design", displayOrder: 6 },
  { value: "Zari Work", variantTypeSlug: "design", displayOrder: 7 },
  { value: "Jacquard", variantTypeSlug: "design", displayOrder: 8 },

  // Finish options
  { value: "Polished", variantTypeSlug: "finish", displayOrder: 1 },
  { value: "Antique", variantTypeSlug: "finish", displayOrder: 2 },
  { value: "Matte", variantTypeSlug: "finish", displayOrder: 3 },
  { value: "Glossy", variantTypeSlug: "finish", displayOrder: 4 },
  { value: "Natural", variantTypeSlug: "finish", displayOrder: 5 },
  { value: "Energized", variantTypeSlug: "finish", displayOrder: 6 },

  // Type options (generic)
  { value: "Gift Set", variantTypeSlug: "type", displayOrder: 1 },
  { value: "Gift Hamper", variantTypeSlug: "type", displayOrder: 2 },
  { value: "Special Occasion Gift", variantTypeSlug: "type", displayOrder: 3 },
  { value: "Notebook", variantTypeSlug: "type", displayOrder: 4 },
  { value: "Pen", variantTypeSlug: "type", displayOrder: 5 },
  { value: "Book", variantTypeSlug: "type", displayOrder: 6 },
  { value: "Lighting", variantTypeSlug: "type", displayOrder: 7 },
  { value: "Accessory", variantTypeSlug: "type", displayOrder: 8 },
  { value: "Utensil", variantTypeSlug: "type", displayOrder: 9 },
  { value: "Serving", variantTypeSlug: "type", displayOrder: 10 },
  { value: "Storage", variantTypeSlug: "type", displayOrder: 11 },
  { value: "Single Wick", variantTypeSlug: "type", displayOrder: 12 },
  { value: "Multi Wick", variantTypeSlug: "type", displayOrder: 13 },
  { value: "Electric", variantTypeSlug: "type", displayOrder: 14 },
  { value: "Oil Lamp", variantTypeSlug: "type", displayOrder: 15 },
  { value: "Yantra", variantTypeSlug: "type", displayOrder: 16 },
  { value: "Gemstone", variantTypeSlug: "type", displayOrder: 17 },
  { value: "Artifact", variantTypeSlug: "type", displayOrder: 18 },
  { value: "Small (3-5 inches)", variantTypeSlug: "type", displayOrder: 19 },
  { value: "Medium (6-10 inches)", variantTypeSlug: "type", displayOrder: 20 },
  { value: "Large (11-15 inches)", variantTypeSlug: "type", displayOrder: 21 },
  { value: "Extra Large (16+ inches)", variantTypeSlug: "type", displayOrder: 22 },
  { value: "Box", variantTypeSlug: "type", displayOrder: 23 },
  { value: "Pouch", variantTypeSlug: "type", displayOrder: 24 },
  { value: "Bulk", variantTypeSlug: "type", displayOrder: 25 },
  { value: "Basic", variantTypeSlug: "type", displayOrder: 26 },
  { value: "Standard", variantTypeSlug: "type", displayOrder: 27 },
  { value: "Premium", variantTypeSlug: "type", displayOrder: 28 },
  { value: "Complete", variantTypeSlug: "type", displayOrder: 29 },
  { value: "Deluxe", variantTypeSlug: "type", displayOrder: 30 },
];

const seedVariantOptions = async () => {
  try {
    logSection("🌱 Starting Variant Options Seeding");
    const payload = await getPayloadInstance();

    // Get all variant types
    const variantTypes = await payload.find({
      collection: "variant-types",
      limit: 1000,
      pagination: false,
    });

    if (variantTypes.docs.length === 0) {
      logError("No variant types found. Please run seed-variant-types.ts first.");
      process.exit(1);
    }

    // Create a map of variant type slugs to IDs
    const variantTypeMap = new Map<string, string>();
    variantTypes.docs.forEach((vt: any) => {
      variantTypeMap.set(vt.slug, vt.id);
    });

    const progress = new ProgressTracker(VARIANT_OPTIONS.length, "Variant Options");
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const option of VARIANT_OPTIONS) {
      const variantTypeId = variantTypeMap.get(option.variantTypeSlug);

      if (!variantTypeId) {
        logError(`Variant type "${option.variantTypeSlug}" not found`);
        errorCount++;
        progress.increment();
        continue;
      }

      const exists = await variantOptionExists(payload, option.value, variantTypeId);

      if (exists) {
        logSkip(`Variant option "${option.value}" (${option.variantTypeSlug}) already exists`);
        skippedCount++;
        progress.increment();
        continue;
      }

      try {
        await payload.create({
          collection: "variant-options",
          data: {
            value: option.value,
            label: option.label || option.value,
            variantType: variantTypeId,
            hexCode: option.hexCode || null,
            displayOrder: option.displayOrder || 0,
          },
        });

        logSuccess(`Created variant option: ${option.value} (${option.variantTypeSlug})`);
        createdCount++;
      } catch (error) {
        logError(`Failed to create variant option: ${option.value}`, error);
        errorCount++;
      }

      progress.increment();
    }

    logSection("✅ Variant Options Seeding Completed");
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} variant options`);
    console.log(`   - Skipped: ${skippedCount} variant options`);
    console.log(`   - Errors: ${errorCount} variant options`);
    console.log(`   - Total: ${VARIANT_OPTIONS.length} variant options`);
  } catch (error) {
    logError("Variant options seeding failed", error);
    throw error;
  }
};

// Run if executed directly
seedVariantOptions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
