import type { CollectionConfig, Where } from "payload";
import { isAppAdmin } from "@/lib/access";

export const Favorites: CollectionConfig = {
  slug: "favorites",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "product", "createdAt"],
    description: "Products a customer has favorited.",
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      if (isAppAdmin(user)) return true;
      if (!user) return false;
      const where: Where = {
        user: { equals: user.id },
      };
      return where;
    },
    create: ({ req }) => {
      return isAppAdmin(req.user) || Boolean(req.user);
    },
    update: ({ req }) => {
      const user = req.user;
      if (isAppAdmin(user)) return true;
      if (!user) return false;
      const where: Where = {
        user: { equals: user.id },
      };
      return where;
    },
    delete: ({ req }) => {
      const user = req.user;
      if (isAppAdmin(user)) return true;
      if (!user) return false;
      const where: Where = {
        user: { equals: user.id },
      };
      return where;
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation !== "create") return data;
        if (!data) return data;

        const userId =
          typeof data.user === "object" && data.user !== null
            ? data.user.id
            : data.user;
        const productId =
          typeof data.product === "object" && data.product !== null
            ? data.product.id
            : data.product;

        if (!userId || !productId) return data;

        const existing = await req.payload.find({
          collection: "favorites",
          limit: 1,
          depth: 0,
          where: {
            and: [
              { user: { equals: userId } },
              { product: { equals: productId } },
            ],
          },
        });

        const duplicate = existing.docs.find((doc) => doc.id !== originalDoc?.id);
        if (duplicate) {
          throw new Error("This product is already in your favorites.");
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
  ],
  timestamps: true,
};
