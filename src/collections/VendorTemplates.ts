import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const VendorTemplates: CollectionConfig = {
  slug: "vendor-templates",
  admin: {
    useAsTitle: "name",
    description: "UI/UX templates for vendor storefronts",
    defaultColumns: ["name", "category", "isDefault", "isActive", "version"],
  },
  access: {
    read: () => true, // Public read - vendors need to see available templates
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Auto-generate slug from name
        if (operation === "create" && data?.name && !data?.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        // If setting a template as default, unset other defaults
        if (data?.isDefault === true) {
          const existingDefaults = await req.payload.find({
            collection: "vendor-templates",
            where: {
              isDefault: { equals: true },
              id: { not_equals: data?.id },
            },
            limit: 100,
          });

          // Unset other defaults
          for (const template of existingDefaults.docs) {
            await req.payload.update({
              collection: "vendor-templates",
              id: template.id,
              data: {
                isDefault: false,
              },
            });
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Template name (e.g., 'Modern Minimal', 'Classic Elegance')",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly identifier (auto-generated from name)",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Template description shown to vendors",
      },
    },
    {
      name: "previewImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Screenshot/preview image of the template (recommended: 1920x1080px)",
      },
    },
    {
      name: "thumbnailImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Small thumbnail for template selection UI (recommended: 400x300px)",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Minimal", value: "minimal" },
        { label: "Elegant", value: "elegant" },
        { label: "Bold", value: "bold" },
        { label: "Colorful", value: "colorful" },
        { label: "Classic", value: "classic" },
      ],
      defaultValue: "minimal",
      admin: {
        description: "Template category for filtering",
      },
    },
    {
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether this is the default template for new vendors",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Whether template is available for selection",
      },
    },
    {
      name: "version",
      type: "text",
      defaultValue: "1.0.0",
      admin: {
        description: "Template version number",
      },
    },
    {
      name: "author",
      type: "text",
      defaultValue: "Evega Team",
      admin: {
        description: "Template creator/author",
      },
    },
    {
      name: "templateConfig",
      type: "json",
      required: true,
      admin: {
        description: "Template configuration schema (colors, fonts, spacing, layout, components)",
      },
    },
    {
      name: "cssVariables",
      type: "json",
      required: true,
      admin: {
        description: "CSS custom properties/variables for the template",
      },
    },
    {
      name: "componentMapping",
      type: "json",
      required: true,
      admin: {
        description: "Component structure mapping (which component variants to use)",
      },
    },
  ],
};
