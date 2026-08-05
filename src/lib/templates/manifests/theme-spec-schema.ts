import { z } from "zod";

import { storefrontChromeSchema } from "@/lib/templates/storefront-chrome";

const seedColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
});

const sectionSpecSchema = z.object({
  type: z.enum([
    "hero",
    "product-grid",
    "product-lookbook",
    "testimonials",
    "rich-text",
    "vendor-info",
  ]),
  settings: z.record(z.string(), z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

/** Runtime validation for catalog theme specs — run via `npm run validate:themes`. */
export const themeSpecSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  description: z.string().min(10),
  category: z.enum(["minimal", "elegant", "bold", "colorful", "classic"]),
  niche: z.string().min(1),
  mood: z.enum(["playful", "minimal", "luxury", "bold", "warm", "catalog"]),
  tags: z.array(z.string()).min(1),
  skeleton: z.enum(["classic", "editorial", "showcase", "dense"]),
  seedColors: seedColorsSchema,
  contrast: z.enum(["light", "dark", "high-contrast"]).optional(),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    display: z.string().optional(),
  }),
  typeScale: z.object({ base: z.number().optional(), ratio: z.number().optional() }).optional(),
  headingCase: z.enum(["none", "uppercase"]).optional(),
  headingTracking: z.string().optional(),
  rhythm: z
    .object({
      section: z.enum(["compact", "normal", "airy"]).optional(),
      gap: z.enum(["compact", "normal", "airy"]).optional(),
    })
    .optional(),
  containerWidth: z.string().optional(),
  shape: z
    .object({
      radiusScale: z.enum(["sharp", "soft", "pill"]).optional(),
      borderWidth: z.string().optional(),
      shadowScale: z.enum(["none", "soft", "elevated"]).optional(),
    })
    .optional(),
  surface: z
    .object({
      cardTreatment: z.enum(["flat", "bordered", "elevated", "glass"]).optional(),
      imageAspect: z.string().optional(),
    })
    .optional(),
  motion: z.enum(["none", "subtle", "expressive"]).optional(),
  gridColumns: z.number().int().min(2).max(6).optional(),
  heroVariant: z
    .enum(["full-bleed", "split-media", "minimal-type", "carousel-peek"])
    .optional(),
  heroHeight: z.string().optional(),
  gridVariant: z.enum(["standard", "dense-compact", "editorial-rows"]).optional(),
  cardStyle: z.enum(["minimal", "detailed", "compact"]).optional(),
  navStyle: z.enum(["top", "sidebar", "sticky"]).optional(),
  footer: z.string().optional(),
  background: z
    .object({
      type: z.string(),
      value: z.string().optional(),
      animation: z
        .object({
          enabled: z.boolean().optional(),
          duration: z.string().optional(),
          easing: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  chrome: storefrontChromeSchema.optional(),
  sections: z.array(sectionSpecSchema).min(1),
  featured: z.boolean().optional(),
  starterLabel: z.string().optional(),
});

export type ThemeSpecInput = z.infer<typeof themeSpecSchema>;

export function validateThemeSpec(spec: unknown): ThemeSpecInput {
  return themeSpecSchema.parse(spec);
}

export function validateThemeSpecs(specs: unknown[]): ThemeSpecInput[] {
  return specs.map((spec, index) => {
    try {
      return themeSpecSchema.parse(spec);
    } catch (error) {
      const slug =
        typeof spec === "object" && spec !== null && "slug" in spec
          ? String((spec as { slug: unknown }).slug)
          : `#${index}`;
      throw new Error(
        `Invalid theme spec "${slug}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}
