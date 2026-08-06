/**
 * Migrates legacy vendor hero banners to the Happy Banner model:
 * - Marks one banner per vendor as canonical
 * - Archives duplicate banners
 * - Seeds hero-banner-config global if missing
 *
 * Usage: npm run db:migrate:happy-banner
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

async function main() {
  if (!process.env.PAYLOAD_SECRET?.trim()) {
    console.error(
      "PAYLOAD_SECRET is not set. Add it to your .env file (project root), then re-run.\n" +
        "Generate one with: openssl rand -base64 32",
    );
    process.exit(1);
  }

  const payload = await getPayload({ config });

  const banners = await payload.find({
    collection: "vendor-hero-banners",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  const byVendor = new Map<string, typeof banners.docs>();
  for (const banner of banners.docs) {
    const vid = typeof banner.vendor === "string" ? banner.vendor : banner.vendor?.id;
    if (!vid) continue;
    const list = byVendor.get(vid) ?? [];
    list.push(banner);
    byVendor.set(vid, list);
  }

  let canonicalSet = 0;
  let archived = 0;

  for (const [, vendorBanners] of byVendor) {
    const sorted = [...vendorBanners].sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 999;
      const bo = typeof b.order === "number" ? b.order : 999;
      return ao - bo;
    });
    const primary = sorted.find((b) => b.isActive !== false) ?? sorted[0];
    if (!primary) continue;

    for (const banner of sorted) {
      const isPrimary = banner.id === primary.id;
      await payload.update({
        collection: "vendor-hero-banners",
        id: banner.id,
        data: {
          canonical: isPrimary,
          archived: !isPrimary,
          isActive: isPrimary,
        } as Record<string, unknown>,
        overrideAccess: true,
      });
      if (isPrimary) canonicalSet += 1;
      else archived += 1;
    }
  }

  try {
    await payload.findGlobal({ slug: "hero-banner-config", overrideAccess: true });
  } catch {
    await payload.updateGlobal({
      slug: "hero-banner-config",
      data: {
        enabled: true,
        productSource: "all-active",
        maxTiles: 24,
        preset: "marquee-max",
        intensity: "lively",
        height: 360,
        tileSize: 128,
      } as Record<string, unknown>,
      overrideAccess: true,
    });
  }

  console.log(`Migration complete: ${canonicalSet} canonical, ${archived} archived`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
