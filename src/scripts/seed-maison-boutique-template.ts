/**
 * Upsert only the Maison Boutique template (safe — does not delete other templates).
 *
 * Usage:
 *   npx tsx src/scripts/seed-maison-boutique-template.ts
 *   or
 *   npm run db:seed:maison-boutique
 */

import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  templateSeeds,
  upsertTemplateBySlug,
} from "@/lib/templates/seed-templates";

async function main() {
  const maison = templateSeeds.find((t) => t.slug === "maison-boutique");
  if (!maison) {
    throw new Error("maison-boutique seed not found in templateSeeds");
  }

  console.log("🚀 Upserting Maison Boutique template...");
  const payload = await getPayload({ config });
  await upsertTemplateBySlug(payload, maison);
  console.log("✅ Done. Vendors can select it under Store appearance → Template.");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
