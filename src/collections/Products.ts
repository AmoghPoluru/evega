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
      label: "Product Variants (Sizes & Colors)",
      admin: {
        description: "Add size and color variants with inventory and price adjustments. Leave empty if product has no variants.",
      },
      fields: [
        {
          name: "size",
          type: "select",
          required: false,
          options: [
            { label: "XS", value: "XS" },
            { label: "S", value: "S" },
            { label: "M", value: "M" },
            { label: "L", value: "L" },
            { label: "XL", value: "XL" },
            { label: "XXL", value: "XXL" },
          ],
          admin: {
            description: "Size variant (optional if using color only)",
          },
        },
        {
          name: "color",
          type: "text",
          required: false,
          admin: {
            description: "Color variant (e.g., Red, Blue, Black) - optional if using size only",
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
            description: "Price for this specific variant. If not set, uses the product's base price. Each size/color combination can have its own price.",
          },
        },
      ],
    },
  ],
};
