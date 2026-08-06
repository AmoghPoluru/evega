import type { Payload } from "payload";
import { heroBannerConfigSchema, type HeroBannerConfigInput } from "./schema";
import type { HeroBannerConfigDoc } from "./types";

export async function getHeroBannerConfig(payload: Payload): Promise<HeroBannerConfigDoc | null> {
  try {
    return (await payload.findGlobal({
      slug: "hero-banner-config",
      depth: 2,
      overrideAccess: true,
    })) as HeroBannerConfigDoc;
  } catch {
    return null;
  }
}

export async function updateHeroBannerConfig(
  payload: Payload,
  input: HeroBannerConfigInput,
): Promise<HeroBannerConfigDoc> {
  const parsed = heroBannerConfigSchema.parse(input);
  return (await payload.updateGlobal({
    slug: "hero-banner-config",
    data: parsed,
    overrideAccess: true,
  })) as HeroBannerConfigDoc;
}
