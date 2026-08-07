/**
 * Seed 5 South Asian logo templates for the vendor picker.
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
    name: "Lotus Grace",
    slug: "lotus-grace",
    description: VENDOR_LOGO_PRESET_DEFAULTS["lotus-grace"].description,
    preset: "lotus-grace",
    isDefault: true,
  },
  {
    name: "Peacock Royal",
    slug: "peacock-royal",
    description: VENDOR_LOGO_PRESET_DEFAULTS["peacock-royal"].description,
    preset: "peacock-royal",
    isDefault: false,
  },
  {
    name: "Mandala Gold",
    slug: "mandala-gold",
    description: VENDOR_LOGO_PRESET_DEFAULTS["mandala-gold"].description,
    preset: "mandala-gold",
    isDefault: false,
  },
  {
    name: "Silk Emblem",
    slug: "silk-emblem",
    description: VENDOR_LOGO_PRESET_DEFAULTS["silk-emblem"].description,
    preset: "silk-emblem",
    isDefault: false,
  },
  {
    name: "Temple Arch",
    slug: "temple-arch",
    description: VENDOR_LOGO_PRESET_DEFAULTS["temple-arch"].description,
    preset: "temple-arch",
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
