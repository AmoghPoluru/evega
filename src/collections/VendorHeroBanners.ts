import type { CollectionConfig } from "payload";
import { getVendorId, isAppAdmin } from "@/lib/access";

export const VendorHeroBanners: CollectionConfig = {
  slug: "vendor-hero-banners",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(getVendorId(req.user) || isAppAdmin(req.user)),
    update: ({ req }) => Boolean(getVendorId(req.user) || isAppAdmin(req.user)),
    delete: ({ req }) => isAppAdmin(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "vendor", "canonical", "archived", "updatedAt"],
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        const vendorId = getVendorId(req.user);
        if (vendorId && operation === "create" && data) {
          data.vendor = vendorId;
          data.canonical = true;
        }

        if (data?.canonical && data?.vendor && data?.id) {
          const vid = typeof data.vendor === "string" ? data.vendor : data.vendor.id;
          const existing = await req.payload.find({
            collection: "vendor-hero-banners",
            where: {
              and: [
                { vendor: { equals: vid } },
                { canonical: { equals: true } },
                { id: { not_equals: data.id } },
              ],
            },
            limit: 10,
            overrideAccess: true,
          });
          for (const doc of existing.docs) {
            await req.payload.update({
              collection: "vendor-hero-banners",
              id: doc.id,
              data: { canonical: false } as Record<string, unknown>,
              overrideAccess: true,
            });
          }
        }

        return data;
      },
    ],
    beforeValidate: [
      async ({ req, data, operation }) => {
        const vendorId = getVendorId(req.user);
        if (vendorId && operation === "update" && data?.vendor) {
          const bannerVendorId =
            typeof data.vendor === "string" ? data.vendor : data.vendor.id;
          if (bannerVendorId !== vendorId) {
            throw new Error("You cannot change the vendor of a banner");
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "vendor",
      type: "relationship",
      relationTo: "vendors",
      required: true,
      admin: {
        readOnly: true,
        condition: (_, __, { user }) => !isAppAdmin(user),
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      label: "Header",
      admin: { description: "Vendor-editable banner header" },
    },
    {
      name: "subtitle",
      type: "text",
      label: "Tagline",
      admin: { description: "Vendor-editable banner tagline" },
    },
    {
      name: "canonical",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "One canonical banner per vendor drives Happy Banner text",
        condition: (_, __, { user }) => isAppAdmin(user),
      },
    },
    {
      name: "archived",
      type: "checkbox",
      defaultValue: false,
      admin: { condition: (_, __, { user }) => isAppAdmin(user) },
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, __, { user }) => isAppAdmin(user),
        description: "Deprecated — use Hero Banner Config global",
      },
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: {
        condition: (_, __, { user }) => isAppAdmin(user),
        description: "Deprecated — products come from Happy Banner Config",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: { hidden: true },
    },
    {
      name: "order",
      type: "number",
      admin: { hidden: true },
    },
  ],
};
