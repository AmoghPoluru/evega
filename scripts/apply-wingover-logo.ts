/**
 * Apply Wingover Boutique logo template to the wingover vendor.
 * Run: npx tsx scripts/apply-wingover-logo.ts
 */
import "dotenv/config";
import { config as dotenv } from "dotenv";
dotenv({ path: ".env" });
import { getPayload } from "payload";
import config from "@payload-config";

async function main() {
  const payload = await getPayload({ config });

  const templates = await payload.find({
    collection: "vendor-logo-templates",
    where: { slug: { equals: "wingover-boutique" } },
    limit: 1,
    overrideAccess: true,
  });
  const template = templates.docs[0];
  if (!template) throw new Error("wingover-boutique template missing — run seed-vendor-logo-templates first");

  const vendors = await payload.find({
    collection: "vendors",
    where: { slug: { equals: "wingover" } },
    limit: 1,
    overrideAccess: true,
  });
  const vendor = vendors.docs[0];
  if (!vendor) throw new Error("wingover vendor missing");

  await payload.update({
    collection: "vendors",
    id: vendor.id,
    data: {
      logoSource: "template",
      logoTemplate: {
        selectedTemplate: template.id,
        word1: "wingover",
        word2: "BOUTIQUE",
      },
    },
    overrideAccess: true,
  });

  console.log(`Applied Wingover Boutique logo to vendor ${vendor.slug}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
