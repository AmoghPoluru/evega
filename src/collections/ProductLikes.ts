import type { CollectionConfig, Where } from "payload";
import { isAppAdmin } from "@/lib/access";

export const ProductLikes: CollectionConfig = {
  slug: "product-likes",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "product", "createdAt"],
    description: "Likes a customer has given to products.",
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
          collection: "product-likes",
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
          throw new Error("You have already liked this product.");
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        try {
          const productId =
            typeof doc.product === "object" && doc.product !== null
              ? doc.product.id
              : doc.product;
          if (!productId) return;

          const product = await req.payload.findByID({
            collection: "products",
            id: productId,
            depth: 0,
            overrideAccess: true,
          });

          const { resolveVendorWhatsApp, notifyVendorProductLiked } = await import(
            "@/lib/whatsapp"
          );
          const vendorWhatsApp = await resolveVendorWhatsApp(req.payload, product);
          await notifyVendorProductLiked(vendorWhatsApp, {
            productName: product.name || "your product",
          });
        } catch (error) {
          console.error("Failed to send vendor WhatsApp like notification:", error);
        }
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
