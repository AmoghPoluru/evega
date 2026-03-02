import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
    description: "Manage product categories and their variant configurations",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "color",
      type: "text",
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "subcategories",
      type: "join",
      collection: "categories",
      on: "parent",
      hasMany: true,
    },
    {
      name: "variantConfig",
      type: "group",
      fields: [
        {
          name: "requiredVariants",
          type: "relationship",
          relationTo: "variant-types",
          hasMany: true,
          admin: {
            description: "Variant types that are required for products in this category",
          },
        },
        {
          name: "optionalVariants",
          type: "relationship",
          relationTo: "variant-types",
          hasMany: true,
          admin: {
            description: "Variant types that are optional for products in this category",
          },
        },
        {
          name: "variantOptions",
          type: "json",
          admin: {
            description: "Mapping of variant types to their allowed options (JSON format)",
          },
        },
        {
          name: "pricingRules",
          type: "group",
          fields: [
            {
              name: "basePrice",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Use base price from product",
              },
            },
            {
              name: "sizeOverrides",
              type: "json",
              admin: {
                description: "Price overrides by size (e.g., { 'XL': 5, '2XL': 10 })",
              },
            },
            {
              name: "colorOverrides",
              type: "json",
              admin: {
                description: "Price overrides by color (e.g., { 'Rose Gold': 20, 'Gold': 10 })",
              },
            },
            {
              name: "materialOverrides",
              type: "json",
              admin: {
                description: "Price overrides by material (e.g., { 'Silk': 20, 'Silver': 50 })",
              },
            },
          ],
        },
      ],
    },
  ],
};
