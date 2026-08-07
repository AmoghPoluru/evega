/**
 * Seed default Happy Banner designs for staff/vendor picker.
 * Run: npx tsx scripts/seed-happy-banners.ts
 */
import "dotenv/config";
import { config as dotenv } from "dotenv";
dotenv({ path: ".env" });
import { getPayload } from "payload";
import config from "@payload-config";

const BANNERS = [
  {
    name: "Mega Sale Banner",
    slug: "mega-sale-banner",
    description: "Classic blue, yellow, and pink mega sale banner.",
    preset: "mega-sale" as const,
    vendorWords: {
      word1: {
        label: "Word 1",
        hint: "Main headline (e.g. MEGA, SUMMER)",
        defaultValue: "MEGA",
      },
      word2: {
        label: "Word 2",
        hint: "Discount number before % (e.g. 50, 35)",
        defaultValue: "50",
      },
    },
    defaultWord1: "MEGA",
    defaultWord2: "50",
    eyebrowText: "LIMITED TIME ONLY",
    secondaryWord: "SALE",
    ctaLabel: "SHOP NOW",
    discountPrefix: "UP TO",
    discountSuffix: "OFF",
    theme: {
      backgroundColor: "#1b2db8",
      accentYellow: "#ffd400",
      accentPink: "#ff2d9a",
    },
    isDefault: false,
    isActive: true,
  },
  {
    name: "Summer Big Sale",
    slug: "summer-big-sale",
    description: "Tropical green summer promo — Word 1: SUMMER, Word 2: discount %.",
    preset: "summer-sale" as const,
    vendorWords: {
      word1: {
        label: "Word 1",
        hint: "Season headline (e.g. SUMMER, SPRING)",
        defaultValue: "SUMMER",
      },
      word2: {
        label: "Word 2",
        hint: "Discount number before % (e.g. 50, 40)",
        defaultValue: "50",
      },
    },
    defaultWord1: "SUMMER",
    defaultWord2: "50",
    eyebrowText: "",
    secondaryWord: "Big Sale",
    ctaLabel: "",
    discountPrefix: "DISCOUNT UP TO",
    discountSuffix: "OFF",
    theme: {
      backgroundColor: "#2f5536",
      accentYellow: "#9fd356",
      accentPink: "#7ec8e3",
    },
    isDefault: false,
    isActive: true,
  },
  {
    name: "Hue Are You Editorial",
    slug: "hue-are-you",
    description: "Yellow editorial banner — headline + website line.",
    preset: "hue-editorial" as const,
    vendorWords: {
      word1: {
        label: "Headline",
        hint: "Main headline (e.g. HUE ARE YOU?)",
        defaultValue: "HUE ARE YOU?",
      },
      word2: {
        label: "Website",
        hint: "Store URL line (e.g. TALBOTS.COM)",
        defaultValue: "TALBOTS.COM",
      },
    },
    defaultWord1: "HUE ARE YOU?",
    defaultWord2: "TALBOTS.COM",
    eyebrowText: "",
    secondaryWord: "",
    ctaLabel: "SHOP NOW ›",
    discountPrefix: "",
    discountSuffix: "",
    theme: {
      backgroundColor: "#f5d030",
      accentYellow: "#8b1538",
      accentPink: "#e84b73",
    },
    isDefault: false,
    isActive: true,
  },
  {
    name: "Tropical Hot Sale",
    slug: "tropical-hot-sale",
    description: "Beige tropical promo — HOT is fixed; Word 1: SUMMER SALE, Word 2: 50.",
    preset: "tropical-hot-sale" as const,
    vendorWords: {
      word1: {
        label: "Headline",
        hint: "Main sale line without HOT (e.g. SUMMER SALE)",
        defaultValue: "SUMMER SALE",
      },
      word2: {
        label: "Word 2",
        hint: "Discount number before % (e.g. 50, 40)",
        defaultValue: "50",
      },
    },
    defaultWord1: "SUMMER SALE",
    defaultWord2: "50",
    eyebrowText: "SPECIAL OFFER",
    secondaryWord: "HOT",
    ctaLabel: "SHOP NOW",
    discountPrefix: "UP TO",
    discountSuffix: "OFF",
    theme: {
      backgroundColor: "#f5f0e8",
      accentYellow: "#1a5c32",
      accentPink: "#e31c23",
    },
    isDefault: false,
    isActive: true,
  },
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
