import { unstable_cache } from "next/cache";

import { getPayloadInstance } from "@/lib/payload-client";
import type { ResolvedTemplate } from "@/types/template-customization";

import { resolveSiteTemplate } from "./template-engine";

export const SITE_TEMPLATE_CACHE_TAG = "site-template";

/**
 * Site-wide template resolution, cached across requests. The default template
 * changes rarely, so the marketplace shell should not pay for a DB query on
 * every render. Revalidate with `revalidateTag(SITE_TEMPLATE_CACHE_TAG)`.
 */
export const getCachedSiteTemplate = unstable_cache(
  async (): Promise<ResolvedTemplate> => {
    const payload = await getPayloadInstance();
    return resolveSiteTemplate(payload);
  },
  ["site-template"],
  { revalidate: 300, tags: [SITE_TEMPLATE_CACHE_TAG] },
);
