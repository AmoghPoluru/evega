import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { isSuperAdmin, isVendor, getVendorId } from "@/lib/access";

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    read: ({ req }) => {
      const user = req.user;
      // Public can read published products from all vendors
      const where: Where = {
        isArchived: { equals: false },
        isPrivate: { equals: false },
      };

      // Vendors can also see their own drafts
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          return {
            or: [
              where,
              {
                and: [
                  { vendor: { equals: vendorId } },
                  { isArchived: { equals: false } },
                ],
              },
            ],
          };
        }
      }

      return where;
    },
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      // Only vendors can create products
      return isVendor(req.user);
    },
    update: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          const where: Where = { vendor: { equals: vendorId } };
          return where;
        }
      }
      return false;
    },
    delete: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          const where: Where = { vendor: { equals: vendorId } };
          return where;
        }
      }
      return false;
    },
  },
  admin: {
    useAsTitle: "name",
    description: "You must verify your account before creating products"
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Convert string descriptions to Lexical format for richText fields
        if (data?.description && typeof data.description === "string") {
          data.description = {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: data.description,
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          };
        }
        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user;
        // Auto-assign vendor for vendors when creating
        if (operation === "create" && user && isVendor(user) && user.vendor && !data.vendor) {
          const vendorId = getVendorId(user);
          if (vendorId) {
            data.vendor = vendorId;
          }
        }

        // Prevent vendors from changing vendor field
        if (operation === "update" && user && isVendor(user) && user.vendor) {
          const vendorId = getVendorId(user);
          if (data.vendor && data.vendor !== vendorId) {
            throw new Error("You cannot change the vendor of this product");
          }
          // Force vendor to match vendor's vendor
          if (vendorId) {
            data.vendor = vendorId;
          }
        }
        return data;
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // Convert string descriptions to Lexical format when reading existing products
        if (doc?.description && typeof doc.description === "string") {
          doc.description = {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: doc.description,
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          };
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD"
      }
    },
    {
      name: "vendor",
      type: "relationship",
      relationTo: "vendors",
      required: true,
      admin: {
        description: "The vendor/shop that owns this product",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      required: true,
      admin: {
        description: "Select a category for this product"
      }
    },
    {
      name: "subcategory",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      required: false,
      admin: {
        description: "Select a subcategory for this product (optional)"
      }
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "video",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Product video (MP4, WebM, etc.) - vendors can upload product demonstration videos",
      },
      filterOptions: {
        mimeType: {
          contains: "video",
        },
      },
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Supports Markdown formatting"
      },
    },
    {
      name: "isPrivate",
      label: "Private",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description: "If checked, this product will not be shown on the public storefront"
      },
    },
    {
      name: "isArchived",
      label: "Archive",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description: "If checked, this product will be archived"
      },
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      admin: {
        description: "Select tags for this product"
      },
    },
    {
      name: "variants",
      type: "array",
      label: "Product Variants",
      admin: {
        description: "⚠️ Use the Vendor Dashboard (/vendor/products) to create products with variants. Variant fields are dynamically generated based on the selected category. This field is for advanced users only.",
      },
      fields: [
        {
          name: "variantData",
          type: "json",
          required: true,
          admin: {
            description: "Dynamic variant data based on category variant types (e.g., { size: 'M', color: 'Red', material: 'Silk' })",
            components: {
              Field: "@/components/payload/VariantDataField",
            },
          },
        },
        {
          name: "stock",
          type: "number",
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: "Available inventory for this variant",
          },
        },
        {
          name: "price",
          type: "number",
          required: false,
          admin: {
            description: "Price for this specific variant. If not set, uses the product's base price.",
          },
        },
      ],
    },
  ],
};
