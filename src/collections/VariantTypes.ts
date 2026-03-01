import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const VariantTypes: CollectionConfig = {
  slug: "variant-types",
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
    hidden: ({ user }) => !isSuperAdmin(user as any),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Select", value: "select" },
        { label: "Number", value: "number" },
        { label: "Text", value: "text" },
      ],
      defaultValue: "select",
    },
    {
      name: "unit",
      type: "text",
      required: false,
      admin: {
        description: "Unit for number type (e.g., 'inches', 'meters')",
      },
    },
    {
      name: "displayOrder",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Order in which this variant type should be displayed",
      },
    },
    {
      name: "description",
      type: "textarea",
      required: false,
    },
  ],
};
