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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        try {
          const productId =
            typeof doc.product === "object" && doc.product !== null
              ? doc.product.id
              : doc.product;
          if (!productId) return;

          const userId =
            typeof doc.user === "object" && doc.user !== null ? doc.user.id : doc.user;

          const [product, user] = await Promise.all([
            req.payload.findByID({
              collection: "products",
              id: productId,
              depth: 0,
              overrideAccess: true,
            }),
            userId
              ? req.payload.findByID({
                  collection: "users",
                  id: userId,
                  depth: 0,
                  overrideAccess: true,
                })
              : Promise.resolve(null),
          ]);

          const { resolveVendorWhatsApp, notifyVendorProductCommented } = await import(
            "@/lib/whatsapp"
          );
          const vendorWhatsApp = await resolveVendorWhatsApp(req.payload, product);
          await notifyVendorProductCommented(vendorWhatsApp, {
            productName: product.name || "your product",
            commenterName: user?.name || user?.email || "A customer",
            commentPreview: doc.comment || "",
          });
        } catch (error) {
          console.error("Failed to send vendor WhatsApp comment notification:", error);
        }
      },
    ],
  },
};
