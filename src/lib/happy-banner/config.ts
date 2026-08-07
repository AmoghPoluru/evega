import type { Payload } from "payload";
import type { HeroBannerPlatformConfig } from "./types";

export async function getHappyBannerPlatformConfig(
  payload: Payload,
): Promise<HeroBannerPlatformConfig> {
  const global = await payload.findGlobal({
    slug: "hero-banner-config",
    overrideAccess: true,
  });

  return global as HeroBannerPlatformConfig;
}

export async function updateHappyBannerPlatformConfig(
  payload: Payload,
  data: Partial<HeroBannerPlatformConfig>,
): Promise<HeroBannerPlatformConfig> {
  const updated = await payload.updateGlobal({
    slug: "hero-banner-config",
    data,
    overrideAccess: true,
  });

  return updated as HeroBannerPlatformConfig;
}

export async function isHappyBannerPlatformEnabled(payload: Payload): Promise<boolean> {
  const config = await getHappyBannerPlatformConfig(payload);
  return config.enabled !== false;
}
