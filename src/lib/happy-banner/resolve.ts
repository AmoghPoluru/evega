import type { Payload } from "payload";
import { fetchHappyBannerProducts } from "./product-source";
import {
  DISABLED_HAPPY_BANNER,
  type HeroBannerConfigDoc,
  type HappyBannerPreset,
  type MotionIntensity,
  type ProductSourceMode,
  type ResolvedHappyBanner,
  type VendorHeroBannerDoc,
} from "./types";

type VendorOverride = NonNullable<HeroBannerConfigDoc["vendorOverrides"]>[number];

function overrideForVendor(
  overrides: VendorOverride[] | null | undefined,
  vendorId: string,
): VendorOverride | undefined {
  return overrides?.find((o) => {
    const vid = typeof o.vendor === "string" ? o.vendor : o.vendor?.id;
    return vid === vendorId;
  });
}

function resolveBackground(
  config: HeroBannerConfigDoc,
  override: VendorOverride | undefined,
  tiles: ResolvedHappyBanner["tiles"],
): ResolvedHappyBanner["background"] {
  const mode = config.backgroundMode ?? "auto-palette";
  const bgMediaId =
    (typeof override?.backgroundImage === "string"
      ? override.backgroundImage
      : override?.backgroundImage && typeof override.backgroundImage === "object"
        ? override.backgroundImage.id
        : null) ??
    (typeof config.backgroundImage === "string"
      ? config.backgroundImage
      : config.backgroundImage && typeof config.backgroundImage === "object"
        ? config.backgroundImage.id
        : null);

  if (mode === "image" && bgMediaId) {
    return { mode: "image", url: String(bgMediaId), scrim: config.scrimOpacity ?? 0.45 };
  }

  if (mode === "gradient") {
    return {
      mode: "gradient",
      from: config.gradientFrom ?? "#1e1b4b",
      to: config.gradientTo ?? "#312e81",
    };
  }

  if (mode === "theme-token") {
    return { mode: "theme-token" };
  }

  const palette = tiles.map((t) => t.color).filter(Boolean);
  if (palette.length === 0) {
    return { mode: "theme-token" };
  }
  return { mode: "auto-palette", palette: palette.slice(0, 8) };
}

export async function resolveHappyBanner(
  payload: Payload,
  vendorId: string,
  _vendorSlug: string,
): Promise<ResolvedHappyBanner> {
  let globalConfig: HeroBannerConfigDoc | null = null;
  try {
    globalConfig = (await payload.findGlobal({
      slug: "hero-banner-config",
      depth: 1,
      overrideAccess: true,
    })) as HeroBannerConfigDoc;
  } catch {
    return { ...DISABLED_HAPPY_BANNER };
  }

  if (!globalConfig?.enabled) {
    return { ...DISABLED_HAPPY_BANNER };
  }

  const override = overrideForVendor(globalConfig.vendorOverrides, vendorId);

  if (override?.enabled === false) {
    return { ...DISABLED_HAPPY_BANNER };
  }

  const bannerResult = await payload.find({
    collection: "vendor-hero-banners",
    where: {
      and: [
        { vendor: { equals: vendorId } },
        { canonical: { equals: true } },
        { archived: { not_equals: true } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const vendorBanner = bannerResult.docs[0] as VendorHeroBannerDoc | undefined;
  const header = vendorBanner?.title?.trim() || "Welcome";
  const tagline = vendorBanner?.subtitle?.trim() || null;

  const productSource = (override?.productSource ??
    globalConfig.productSource ??
    "all-active") as ProductSourceMode;

  const manualIds: string[] = [];
  if (productSource === "manual" && override?.manualProducts) {
    for (const p of override.manualProducts) {
      const id = typeof p === "string" ? p : p?.id;
      if (id) manualIds.push(id);
    }
  }

  const maxTiles = globalConfig.maxTiles ?? 24;
  const { tiles, total } = await fetchHappyBannerProducts(
    payload,
    vendorId,
    productSource,
    manualIds,
    maxTiles,
    globalConfig.shuffleWindow ?? true,
  );

  if (tiles.length === 0) {
    return { ...DISABLED_HAPPY_BANNER, header, tagline };
  }

  const preset = (override?.preset ?? globalConfig.preset ?? "marquee-max") as HappyBannerPreset;
  const intensity = (override?.intensity ??
    globalConfig.intensity ??
    "lively") as MotionIntensity;

  const bg = resolveBackground(globalConfig, override, tiles);

  if (bg.mode === "image" && bg.url && !bg.url.startsWith("http")) {
    try {
      const media = await payload.findByID({
        collection: "media",
        id: bg.url,
        overrideAccess: true,
      });
      const url = typeof media === "object" && media && "url" in media ? (media.url as string) : bg.url;
      bg.url = url;
    } catch {
      /* keep id fallback */
    }
  }

  return {
    enabled: true,
    header,
    tagline,
    preset,
    motion: {
      intensity,
      speed: globalConfig.speed ?? 1,
      direction: globalConfig.direction ?? "ltr",
      pauseOnHover: globalConfig.pauseOnHover ?? true,
      spotlight: {
        enabled: globalConfig.spotlightEnabled ?? intensity !== "calm",
        intervalMs: globalConfig.spotlightIntervalMs ?? 8000,
      },
      particles: globalConfig.particles ?? intensity !== "calm",
    },
    geometry: {
      height: globalConfig.height ?? 360,
      tileSize: globalConfig.tileSize ?? 128,
    },
    background: bg,
    tiles,
    totalProducts: total,
  };
}

export async function getResolvedHappyBannerForSlug(
  payload: Payload,
  vendorSlug: string,
): Promise<ResolvedHappyBanner> {
  const vendors = await payload.find({
    collection: "vendors",
    where: { slug: { equals: vendorSlug } },
    limit: 1,
    overrideAccess: true,
  });
  const vendor = vendors.docs[0];
  if (!vendor) return { ...DISABLED_HAPPY_BANNER };
  return resolveHappyBanner(payload, vendor.id, vendorSlug);
}
