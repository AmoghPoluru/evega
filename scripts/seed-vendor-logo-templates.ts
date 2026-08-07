/**
 * Seed South Asian monogram logo templates for the vendor picker.
 * Run: npx tsx scripts/seed-vendor-logo-templates.ts
 */
import "dotenv/config";
import { config as dotenv } from "dotenv";
dotenv({ path: ".env" });
import { getPayload } from "payload";
import config from "@payload-config";
import { VENDOR_LOGO_PRESET_DEFAULTS } from "@/lib/vendor-logo/presets";
import type { VendorLogoPreset } from "@/lib/vendor-logo/types";

const TEMPLATES: Array<{
  name: string;
  slug: string;
  description: string;
  preset: VendorLogoPreset;
  isDefault: boolean;
}> = [
  {
    name: "Lotus Monogram",
    slug: "lotus-grace",
    description: VENDOR_LOGO_PRESET_DEFAULTS["lotus-grace"].description,
    preset: "lotus-grace",
    isDefault: true,
  },
  {
    name: "Peacock Monogram",
    slug: "peacock-royal",
    description: VENDOR_LOGO_PRESET_DEFAULTS["peacock-royal"].description,
    preset: "peacock-royal",
    isDefault: false,
  },
  {
    name: "Mandala Monogram",
    slug: "mandala-gold",
    description: VENDOR_LOGO_PRESET_DEFAULTS["mandala-gold"].description,
    preset: "mandala-gold",
    isDefault: false,
  },
  {
    name: "Bandhani Monogram",
    slug: "silk-emblem",
    description: VENDOR_LOGO_PRESET_DEFAULTS["silk-emblem"].description,
    preset: "silk-emblem",
    isDefault: false,
  },
  {
    name: "Heritage Monogram",
    slug: "temple-arch",
    description: VENDOR_LOGO_PRESET_DEFAULTS["temple-arch"].description,
    preset: "temple-arch",
    isDefault: false,
  },
  {
    name: "Rangoli Star",
    slug: "rangoli-star",
    description: VENDOR_LOGO_PRESET_DEFAULTS["rangoli-star"].description,
    preset: "rangoli-star",
    isDefault: false,
  },
  {
    name: "Diya Lamp",
    slug: "diya-lamp",
    description: VENDOR_LOGO_PRESET_DEFAULTS["diya-lamp"].description,
    preset: "diya-lamp",
    isDefault: false,
  },
  {
    name: "Jasmine Wreath",
    slug: "jasmine-wreath",
    description: VENDOR_LOGO_PRESET_DEFAULTS["jasmine-wreath"].description,
    preset: "jasmine-wreath",
    isDefault: false,
  },
  {
    name: "Paisley Curve",
    slug: "paisley-curve",
    description: VENDOR_LOGO_PRESET_DEFAULTS["paisley-curve"].description,
    preset: "paisley-curve",
    isDefault: false,
  },
  {
    name: "Kite Festival",
    slug: "kite-sankranti",
    description: VENDOR_LOGO_PRESET_DEFAULTS["kite-sankranti"].description,
    preset: "kite-sankranti",
    isDefault: false,
  },
  {
    name: "Henna Scroll",
    slug: "henna-scroll",
    description: VENDOR_LOGO_PRESET_DEFAULTS["henna-scroll"].description,
    preset: "henna-scroll",
    isDefault: false,
  },
  {
    name: "Marigold Ring",
    slug: "marigold-ring",
    description: VENDOR_LOGO_PRESET_DEFAULTS["marigold-ring"].description,
    preset: "marigold-ring",
    isDefault: false,
  },
  {
    name: "Chakra Wheel",
    slug: "chakra-wheel",
    description: VENDOR_LOGO_PRESET_DEFAULTS["chakra-wheel"].description,
    preset: "chakra-wheel",
    isDefault: false,
  },
  {
    name: "Hex Kolam",
    slug: "hex-kolam",
    description: VENDOR_LOGO_PRESET_DEFAULTS["hex-kolam"].description,
    preset: "hex-kolam",
    isDefault: false,
  },
  {
    name: "Elephant Emblem",
    slug: "elephant-emblem",
    description: VENDOR_LOGO_PRESET_DEFAULTS["elephant-emblem"].description,
    preset: "elephant-emblem",
    isDefault: false,
  },
];

async function main() {
  const payload = await getPayload({ config });

  for (const item of TEMPLATES) {
    const defaults = VENDOR_LOGO_PRESET_DEFAULTS[item.preset];
    const data = {
      name: item.name,
      slug: item.slug,
      description: item.description,
      preset: item.preset,
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
      theme: {
        primary: defaults.primary,
        secondary: defaults.secondary,
        accent: defaults.accent,
        tertiary: defaults.tertiary,
        highlight: defaults.highlight,
        background: defaults.background,
      },
      isDefault: item.isDefault,
      isActive: true,
    };

    const existing = await payload.find({
      collection: "vendor-logo-templates",
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: "vendor-logo-templates",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
      console.log(`Updated logo template: ${updated.name}`);
    } else {
      const created = await payload.create({
        collection: "vendor-logo-templates",
        data,
        overrideAccess: true,
      });
      console.log(`Created logo template: ${created.name}`);
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
