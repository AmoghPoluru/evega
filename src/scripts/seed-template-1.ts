/**
 * Upsert the "Elegant White" vendor template without touching other templates.
 *
 * Usage: npm run db:seed:elegant-white
 */

import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { templateSeeds } from "@/lib/templates/seed-templates";

const TEMPLATE_SLUG = "elegant-white";
const LEGACY_SLUG = "template-1";

async function main() {
  const seed = templateSeeds.find((t) => t.slug === TEMPLATE_SLUG);
  if (!seed) {
    throw new Error(`Seed data for slug "${TEMPLATE_SLUG}" not found`);
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "vendor-templates",
    where: {
      or: [{ slug: { equals: TEMPLATE_SLUG } }, { slug: { equals: LEGACY_SLUG } }],
    },
    limit: 1,
    overrideAccess: true,
  });

  const data = {
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    category: seed.category,
    isDefault: seed.isDefault,
    isActive: seed.isActive,
    version: seed.version,
    author: seed.author,
    templateConfig: seed.templateConfig,
    cssVariables: seed.cssVariables,
    componentMapping: seed.componentMapping,
  };

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: "vendor-templates",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    console.log(`Updated template: ${updated.name} (${updated.id})`);
  } else {
    const created = await payload.create({
      collection: "vendor-templates",
      data,
      overrideAccess: true,
    });
    console.log(`Created template: ${created.name} (${created.id})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
