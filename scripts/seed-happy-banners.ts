/**
 * Seed Happy Banner designs for staff/vendor picker.
 * Run: npx tsx scripts/seed-happy-banners.ts
 */
import "dotenv/config";
import { config as dotenv } from "dotenv";
dotenv({ path: ".env" });
import { getPayload } from "payload";
import config from "@payload-config";
import { HAPPY_BANNER_PRESET_DEFAULTS } from "@/lib/happy-banner/presets";
import type { HappyBannerPreset } from "@/lib/happy-banner/types";

function buildBannerSeed(
  name: string,
  slug: string,
  preset: HappyBannerPreset,
  isDefault = false,
) {
  const defaults = HAPPY_BANNER_PRESET_DEFAULTS[preset];
  return {
    name,
    slug,
    description: defaults.description,
    preset,
    vendorWords: {
      word1: {
        label: defaults.word1Label,
        hint: defaults.word1Hint,
        defaultValue: defaults.word1Default,
      },
      word2: {
        label: defaults.word2Label,
        hint: defaults.word2Hint,
        defaultValue: defaults.word2Default,
      },
    },
    defaultWord1: defaults.word1Default,
    defaultWord2: defaults.word2Default,
    eyebrowText: defaults.eyebrowText,
    secondaryWord: defaults.secondaryWord,
    ctaLabel: defaults.ctaLabel,
    discountPrefix: defaults.discountPrefix,
    discountSuffix: defaults.discountSuffix,
    theme: {
      backgroundColor: defaults.backgroundColor,
      accentYellow: defaults.accentYellow,
      accentPink: defaults.accentPink,
    },
    isDefault,
    isActive: true,
  };
}

const BANNERS = [
  buildBannerSeed("Mega Sale Banner", "mega-sale-banner", "mega-sale"),
  buildBannerSeed("Summer Big Sale", "summer-big-sale", "summer-sale"),
  buildBannerSeed("Hue Are You Editorial", "hue-are-you", "hue-editorial"),
  buildBannerSeed("Tropical Hot Sale", "tropical-hot-sale", "tropical-hot-sale"),
  buildBannerSeed("New Arrivals", "new-arrivals", "new-arrivals"),
  buildBannerSeed("Ethnic Festive", "ethnic-festive", "ethnic-festive"),
  buildBannerSeed("Flash Sale", "flash-sale", "flash-sale"),
  buildBannerSeed("Bridal Edit", "bridal-edit", "bridal-edit"),
  buildBannerSeed("Linen Collection", "linen-edit", "linen-edit"),
  buildBannerSeed("Kurta Print", "kurta-print", "kurta-print"),
  buildBannerSeed("Luxury Boutique", "luxury-boutique", "luxury-boutique"),
  buildBannerSeed("Boho Chic", "boho-chic", "boho-chic"),
  buildBannerSeed("End of Season Clearance", "clearance-eoss", "clearance-eoss"),
  buildBannerSeed("Handloom Heritage", "handloom-heritage", "handloom-heritage"),
];

async function main() {
  const payload = await getPayload({ config });

  for (const banner of BANNERS) {
    const existing = await payload.find({
      collection: "happy-banners",
      where: { slug: { equals: banner.slug } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "happy-banners",
        id: existing.docs[0].id,
        data: banner,
        overrideAccess: true,
      });
      console.log(`Updated banner: ${banner.name}`);
    } else {
      await payload.create({
        collection: "happy-banners",
        data: banner,
        overrideAccess: true,
      });
      console.log(`Created banner: ${banner.name}`);
    }
  }

  console.log("Happy Banner seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
