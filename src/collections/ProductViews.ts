import type { CollectionConfig, Where } from "payload";

import { isAppAdmin, isVendor, getVendorId } from "@/lib/access";

export const ProductViews: CollectionConfig = {
  slug: "product-views",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "product", "vendor", "lastViewedAt"],
    description: "Logged-in customers who viewed a product page.",
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      if (isAppAdmin(user)) return true;

      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          const where: Where = {
            vendor: { equals: vendorId },
          };
          return where;
        }
      }

      if (user) {
        return {
          user: { equals: user.id },
        };
      }

      return false;
    },
    create: ({ req }) => isAppAdmin(req.user) || Boolean(req.user),
    update: ({ req }) => isAppAdmin(req.user) || Boolean(req.user),
    delete: ({ req }) => isAppAdmin(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data?.product) return data;

        const productId =
          typeof data.product === "string" ? data.product : data.product.id;

        const product = await req.payload.findByID({
          collection: "products",
          id: productId,
          depth: 0,
        });

        if (product.vendor) {
          data.vendor =
            typeof product.vendor === "string" ? product.vendor : product.vendor.id;
        }

        if (operation === "create" || operation === "update") {
          data.lastViewedAt = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    {
      name: "vendor",
      type: "relationship",
      relationTo: "vendors",
      required: true,
      index: true,
    },
    {
      name: "lastViewedAt",
      type: "date",
      required: true,
      admin: {
        description: "Most recent time this user viewed the product",
      },
    },
  ],
};
