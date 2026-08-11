import type { TemplateConfig, TemplateCustomization } from "@/types/template-customization";

const DEFAULT_BANNER_HEIGHT = "480px";
const MIN_BANNER_HEIGHT = "300px";

function parseHeightPx(height: string | undefined): number | null {
  if (!height) return null;
  const match = /^(\d+(?:\.\d+)?)px$/.exec(height.trim());
  return match ? Number(match[1]) : null;
}

/**
 * Ensures merged template config never silently hides vendor-configured banners
 * because a legacy theme bundled showBanner:false or height:0px.
 * Vendor explicit overrides in templateCustomization are respected.
 */
export function enforceBannerCapableConfig(
  config: TemplateConfig,
  customization: TemplateCustomization = {},
): TemplateConfig {
  const next = { ...config };

  if (customization.layout?.showBanner !== false) {
    next.layout = { ...next.layout, showBanner: true };
  }

  const vendorHeight = customization.components?.heroBanner?.height;
  const mergedHeight = next.components?.heroBanner?.height;
  const mergedHeightPx = parseHeightPx(mergedHeight);

  let resolvedHeight = mergedHeight ?? DEFAULT_BANNER_HEIGHT;

  if (mergedHeightPx === 0 || mergedHeight === "0px") {
    resolvedHeight = vendorHeight && vendorHeight !== "0px" ? vendorHeight : DEFAULT_BANNER_HEIGHT;
  } else if (mergedHeightPx !== null && mergedHeightPx < 300 && !vendorHeight) {
    resolvedHeight = MIN_BANNER_HEIGHT;
  }

  next.components = {
    ...next.components,
    heroBanner: {
      ...next.components.heroBanner,
      height: resolvedHeight,
    },
  };

  return next;
}
