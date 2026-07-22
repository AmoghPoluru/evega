import type { CollectionConfig, Where } from "payload";
import { isAppAdmin } from "@/lib/access";

export const ProductComments: CollectionConfig = {
  slug: "product-comments",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "product", "comment", "createdAt"],
    description: "Customer comments on products.",
  },
  access: {
    // Anyone can read comments.
    read: () => true,
    // Authenticated users can create comments.
    create: ({ req }) => {
      return isAppAdmin(req.user) || Boolean(req.user);
    },
    // A user can update only their own comment; admins can update any.
    update: ({ req }) => {
      const user = req.user;
      if (isAppAdmin(user)) return true;
      if (!user) return false;
      const where: Where = {
        user: { equals: user.id },
      };
      return where;
    },
    // A user can delete their own comment; admins can moderate/delete any.
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
      name: "comment",
      type: "textarea",
      required: true,
    },
  ],
  timestamps: true,
};
