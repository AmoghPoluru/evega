import type { CollectionConfig } from "payload";
import type { Where } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "totalOrders", "totalSpent", "lastOrderDate", "createdAt"],
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      // Super admins can read all customers
      if (user?.roles?.includes("super-admin")) {
        return true;
      }
      // Vendors can read customers who have ordered from them
      if (user?.vendor) {
        const vendorId = typeof user.vendor === "string" ? user.vendor : user.vendor.id;
        if (vendorId) {
          const where: Where = {
            vendors: { contains: vendorId },
          };
          return where;
        }
      }
      return false;
    },
    create: ({ req }) => {
      // Only allow creation via webhook or super admin
      return true; // Webhooks don't have user context
    },
    update: ({ req }) => {
      const user = req.user;
      // Super admins can update all customers
      if (user?.roles?.includes("super-admin")) {
        return true;
      }
      // Vendors can update customers who have ordered from them
      if (user?.vendor) {
        const vendorId = typeof user.vendor === "string" ? user.vendor : user.vendor.id;
        if (vendorId) {
          const where: Where = {
            vendors: { contains: vendorId },
          };
          return where;
        }
      }
      return false;
    },
    delete: ({ req }) => {
      // Only super admins can delete customers
      return req.user?.roles?.includes("super-admin") || false;
    },
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
      admin: {
        description: "The user account associated with this customer",
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Customer name (synced from user)",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        description: "Customer email (synced from user)",
      },
    },
    {
      name: "phone",
      type: "text",
      admin: {
        description: "Customer phone number (optional)",
      },
    },
    {
      name: "vendors",
      type: "relationship",
      relationTo: "vendors",
      hasMany: true,
      admin: {
        description: "Vendors this customer has ordered from",
      },
    },
    {
      name: "totalOrders",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Total number of orders across all vendors",
      },
    },
    {
      name: "totalSpent",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Total amount spent across all vendors",
      },
    },
    {
      name: "lastOrderDate",
      type: "date",
      admin: {
        description: "Date of most recent order",
      },
    },
    {
      name: "firstOrderDate",
      type: "date",
      admin: {
        description: "Date of first order",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
        {
          name: "vendor",
          type: "relationship",
          relationTo: "vendors",
          admin: {
            description: "Vendor who added this tag (null for global tags)",
          },
        },
      ],
      admin: {
        description: "Customer tags/segments (can be vendor-specific or global)",
      },
    },
    {
      name: "notes",
      type: "array",
      fields: [
        {
          name: "text",
          type: "textarea",
          required: true,
        },
        {
          name: "vendor",
          type: "relationship",
          relationTo: "vendors",
          admin: {
            description: "Vendor who added this note",
          },
        },
        {
          name: "createdBy",
          type: "relationship",
          relationTo: "users",
          admin: {
            description: "User who created this note",
          },
        },
        {
          name: "createdAt",
          type: "date",
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
          },
        },
      ],
      admin: {
        description: "Customer notes (vendor-specific)",
      },
    },
  ],
};
