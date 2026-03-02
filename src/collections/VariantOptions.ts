import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const VariantOptions: CollectionConfig = {
  slug: "variant-options",
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "value",
    description: "Manage variant option values (e.g., 'Small', 'Red', 'Silk'). These appear in product variant dropdowns.",
  },
  fields: [
    {
      name: "value",
      type: "text",
      required: true,
    },
    {
      name: "label",
      type: "text",
      required: false,
      admin: {
        description: "Display label (if different from value)",
      },
    },
    {
      name: "variantType",
      type: "relationship",
      relationTo: "variant-types",
      required: true,
      admin: {
        description: "The variant type this option belongs to",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: false,
      admin: {
        description: "If set, this option is specific to this category. If null, it's global.",
      },
    },
    {
      name: "hexCode",
      type: "text",
      required: false,
      admin: {
        description: "Hex color code (for color variant options)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description: "Image for this option (e.g., color swatch)",
      },
    },
    {
      name: "displayOrder",
      type: "number",
      required: false,
      defaultValue: 0,
      admin: {
        description: "Order in which this option should be displayed",
      },
    },
  ],
};
