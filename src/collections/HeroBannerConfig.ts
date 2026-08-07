import type { GlobalConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

/** Platform-wide toggle for the Happy Banner feature. Individual designs live in happy-banners. */
export const HeroBannerConfig: GlobalConfig = {
  slug: "hero-banner-config",
  label: "Happy Banner Platform",
  admin: {
    description: "Master switch for Happy Banners on vendor storefronts.",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      label: "Enable Happy Banners on vendor storefronts",
    },
  ],
};
