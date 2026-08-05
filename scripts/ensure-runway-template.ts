/**
 * Ensures the Runway template exists and reassigns vendors with broken template links.
 *
 * Usage:
 *   npx tsx scripts/ensure-runway-template.ts
 *   npx tsx scripts/ensure-runway-template.ts --assign-all-broken
 */

import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";
import { getThemeManifestBySlug, manifestToSeedPayload } from "@/lib/templates/manifests/registry";

async function main() {
  const assignAllBroken = process.argv.includes("--assign-all-broken");

  const payload = await getPayload({ config });
  const manifest = getThemeManifestBySlug("runway");

  if (!manifest) {
    console.error("❌ Runway manifest not found in codebase");
    process.exit(1);
  }

  const payloadData = manifestToSeedPayload(manifest);

  const existing = await payload.find({
    collection: "vendor-templates",
    where: { slug: { equals: "runway" } },
    limit: 1,
  });

  let runwayId: string;

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: "vendor-templates",
      id: existing.docs[0].id,
      data: payloadData,
    });
    runwayId = updated.id;
    console.log(`✅ Updated Runway template (${runwayId})`);
  } else {
    const created = await payload.create({
      collection: "vendor-templates",
      draft: false,
      data: payloadData,
    });
    runwayId = created.id;
    console.log(`✅ Created Runway template (${runwayId})`);
  }

  const vendors = await payload.find({
    collection: "vendors",
    limit: 500,
    depth: 0,
  });

  let repaired = 0;

  for (const vendor of vendors.docs) {
    const selectedId =
      typeof vendor.selectedTemplate === "string" ? vendor.selectedTemplate : vendor.selectedTemplate?.id;

    let isBroken = false;

    if (selectedId) {
      try {
        await payload.findByID({
          collection: "vendor-templates",
          id: selectedId,
        });
      } catch {
        isBroken = true;
      }
    }

    const slug = (vendor as { selectedTemplateSlug?: string | null }).selectedTemplateSlug;
    const wantsRunway = slug === "runway";

    if (isBroken || wantsRunway || assignAllBroken) {
      if (isBroken || wantsRunway || (assignAllBroken && !selectedId)) {
        await payload.update({
          collection: "vendors",
          id: vendor.id,
          data: {
            selectedTemplate: runwayId,
            selectedTemplateSlug: "runway",
          },
        });
        console.log(`  🔗 Assigned Runway to vendor: ${vendor.name} (${vendor.slug})`);
        repaired += 1;
      }
    } else if (slug && slug !== "runway" && isBroken) {
      // Repair broken non-runway refs by slug
      const bySlug = await payload.find({
        collection: "vendor-templates",
        where: { slug: { equals: slug } },
        limit: 1,
      });
      if (bySlug.docs.length > 0) {
        await payload.update({
          collection: "vendors",
          id: vendor.id,
          data: {
            selectedTemplate: bySlug.docs[0].id,
            selectedTemplateSlug: slug,
          },
        });
        console.log(`  🔧 Repaired template link for vendor: ${vendor.name} → ${slug}`);
        repaired += 1;
      }
    }
  }

  console.log(`\n✨ Done. Runway ID: ${runwayId}. Vendors updated: ${repaired}.`);
  console.log("   Re-select Runway at /vendor/templates if your storefront still looks wrong.");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Failed to ensure Runway template:", error);
  process.exit(1);
});
