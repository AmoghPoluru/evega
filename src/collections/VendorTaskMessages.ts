import type { CollectionConfig } from "payload";
import { isSuperAdmin, getVendorId, isVendor } from "@/lib/access";

export const VendorTaskMessages: CollectionConfig = {
  slug: "vendor-task-messages",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["task", "author", "role", "createdAt", "isInternal"],
    description: "Messages and notes attached to vendor tasks.",
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;

      // Vendors can read messages for their own tasks only (enforced via where on task.vendor)
      if (isVendor(user)) {
        const vendorId = getVendorId(user);
        if (!vendorId) return false;

        return {
          "task.vendor": {
            equals: vendorId,
          },
          // Internal notes are hidden from vendors
          isInternal: {
            not_equals: true,
          },
        } as any;
      }

      return false;
    },
    create: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      return isVendor(user);
    },
    update: ({ req }) => {
      const user = req.user;
      // Only super admins can update messages (e.g. edit internal notes)
      return isSuperAdmin(user);
    },
    delete: ({ req }) => {
      // Only super admins can delete messages
      return isSuperAdmin(req.user);
    },
  },
  fields: [
    {
      name: "task",
      type: "relationship",
      relationTo: "vendor-tasks",
      required: true,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Vendor", value: "vendor" },
        { label: "Admin", value: "admin" },
      ],
      required: true,
    },
    {
      name: "body",
      type: "richText",
      required: true,
      admin: {
        description: "Message content.",
      },
    },
    {
      name: "attachments",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
      required: false,
    },
    {
      name: "isInternal",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "When checked, this note is visible only to admins/BDOs.",
        position: "sidebar",
      },
    },
  ],
};

