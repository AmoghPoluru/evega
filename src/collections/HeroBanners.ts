import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const HeroBanners: CollectionConfig = {
  slug: "hero-banners",
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "title",
    hidden: ({ user }) => !isSuperAdmin(user as any),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Title for the hero banner section",
      },
    },
    {
      name: "subtitle",
      type: "text",
      admin: {
        description: "Optional subtitle text",
      },
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional background image for the banner",
      },
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: "Select products to display in this hero banner",
      },
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Only active banners will be displayed on the homepage",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
      },
    },
  ],
};
