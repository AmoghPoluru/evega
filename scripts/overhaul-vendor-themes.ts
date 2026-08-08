/**
 * One-time migration: theme overhaul (industry tags, featured curation, layout fixes).
 *
 * Run: npx tsx scripts/overhaul-vendor-themes.ts
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
import { THEME_CATALOG } from "../src/lib/templates/theme-catalog";

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection("vendor-templates");

  let updated = 0;
  let layoutFixed = 0;
  let deactivated = 0;

  for (const entry of THEME_CATALOG) {
    const doc = await collection.findOne({ slug: entry.slug });
    if (!doc) {
      console.warn(`⚠️  Missing template slug="${entry.slug}" — skipped`);
      continue;
    }

    const mapping = (doc.componentMapping as Record<string, unknown>) ?? {};
    const currentLayout = typeof mapping.layout === "string" ? mapping.layout : null;
    const needsLayoutFix = !currentLayout || currentLayout === "modular";

    const nextMapping = needsLayoutFix
      ? { ...mapping, layout: entry.defaultLayout }
      : mapping;

    const result = await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          industry: entry.industry,
          isFeatured: entry.isFeatured,
          sortOrder: entry.sortOrder,
          isActive: entry.isActive,
          componentMapping: nextMapping,
        },
      },
    );

    if (result.modifiedCount > 0) updated += 1;
    if (needsLayoutFix) layoutFixed += 1;
    if (!entry.isActive) deactivated += 1;

    console.log(
      `✓ ${entry.slug.padEnd(14)} industry=${entry.industry.padEnd(22)} featured=${String(entry.isFeatured).padEnd(5)} active=${String(entry.isActive).padEnd(5)} layout→${entry.defaultLayout}`,
    );
  }

  // Reassign vendors on duplicate kirana-2 → kirana
  const kirana2 = await collection.findOne({ slug: "kirana-2" });
  const kirana = await collection.findOne({ slug: "kirana" });
  if (kirana2 && kirana) {
    const kirana2Id = kirana2._id.toString();
    const kiranaId = kirana._id.toString();
    const vendorResult = await db.collection("vendors").updateMany(
      { selectedTemplate: kirana2Id },
      { $set: { selectedTemplate: kiranaId } },
    );
    if (vendorResult.modifiedCount > 0) {
      console.log(`\n↪ Reassigned ${vendorResult.modifiedCount} vendor(s) from kirana-2 to kirana`);
    }
  }

  const featured = THEME_CATALOG.filter((e) => e.isFeatured).length;
  console.log(`\nDone. Updated ${updated} templates, fixed ${layoutFixed} layouts, deactivated ${deactivated} duplicate(s).`);
  console.log(`Featured themes in vendor picker: ${featured}`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
