/**
 * Seed Vendor Templates Script
 * 
 * Run this script to populate the vendor-templates collection with default templates.
 * 
 * Usage:
 *   npx tsx src/scripts/seed-templates.ts
 *   or
 *   npm run db:seed:templates
 */

import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { seedTemplates } from "@/lib/templates/seed-templates";

async function main() {
  console.log("🚀 Starting template seeding process...");

  try {
    const payload = await getPayload({ config });
    await seedTemplates(payload);
    console.log("✅ Template seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

main();
