import type { CollectionConfig, Where } from "payload";
import { getVendorId, isSuperAdmin } from "@/lib/access";

/**
 * Vendors may only mutate templates they own that have not been approved yet.
 * Approved templates are global assets and stay super-admin only.
 */
function ownedEditableTemplatesWhere(vendorId: string): Where {
  return {
    and: [
      { owner: { equals: vendorId } },
      { status: { not_equals: "approved" } },
    ],
  };
}

export const VendorTemplates: CollectionConfig = {
  slug: "vendor-templates",
  admin: {
    useAsTitle: "name",
    description: "UI/UX templates for vendor storefronts",
    defaultColumns: ["name", "category", "isDefault", "isActive", "version"],
  },
  access: {
    read: () => true, // Public read - vendors need to see available templates
    create: ({ req: { user } }) => isSuperAdmin(user) || Boolean(getVendorId(user)),
    update: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true;
      const vendorId = getVendorId(user);
      return vendorId ? ownedEditableTemplatesWhere(vendorId) : false;
    },
    delete: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true;
      const vendorId = getVendorId(user);
      return vendorId ? ownedEditableTemplatesWhere(vendorId) : false;
    },
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
      async ({ data, operation, req, originalDoc }) => {
        const docId = originalDoc?.id ?? data?.id;

        // If setting a template as default, unset other defaults
        if (data?.isDefault === true) {
          const existingDefaults = await req.payload.find({
            collection: "vendor-templates",
            where: {
              isDefault: { equals: true },
              ...(docId ? { id: { not_equals: docId } } : {}),
            },
            limit: 100,
          });

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

        // Prevent unsetting the last site-wide default while other active templates exist
        const wasDefault = originalDoc?.isDefault === true;
        const unsettingDefault = wasDefault && data?.isDefault === false;

        if (unsettingDefault && docId) {
          const otherDefaults = await req.payload.find({
            collection: "vendor-templates",
            where: {
              isDefault: { equals: true },
              id: { not_equals: docId },
            },
            limit: 1,
          });

          if (otherDefaults.docs.length === 0) {
            const otherActive = await req.payload.find({
              collection: "vendor-templates",
              where: {
                isActive: { equals: true },
                id: { not_equals: docId },
              },
              limit: 1,
            });

            if (otherActive.docs.length > 0) {
              throw new Error(
                "At least one template must be marked as the site-wide default. " +
                  "Set another active template as default before unchecking this one."
              );
            }
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
      name: "owner",
      type: "relationship",
      relationTo: "vendors",
      index: true,
      admin: {
        description:
          "Vendor who created this template. Empty means the template is global and selectable by every vendor.",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Pending Approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "draft",
      index: true,
      admin: {
        description:
          "Approval state. Only approved templates without an owner are offered to all vendors.",
      },
    },
    {
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Site-wide default template for new vendors. Only one template can be default; checking this unchecks any other default.",
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
      name: "sections",
      type: "json",
      admin: {
        description:
          "Ordered storefront sections for modular templates (mirrors templateConfig.sections)",
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
