import type { CollectionConfig } from "payload";
import { isSuperAdmin, getVendorId, isVendor } from "@/lib/access";

export const VendorTasks: CollectionConfig = {
  slug: "vendor-tasks",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "priority", "vendor", "assignedTo", "updatedAt"],
    description: "Support tasks and communication between vendors and BDO/admin.",
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;

      // Vendors can read only their own tasks
      if (isVendor(user)) {
        const vendorId = getVendorId(user);
        if (!vendorId) return false;
        return {
          vendor: {
            equals: vendorId,
          },
        };
      }

      return false;
    },
    create: ({ req }) => {
      const user = req.user;
      // Super admins and vendors can create tasks
      if (isSuperAdmin(user)) return true;
      return isVendor(user);
    },
    update: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;

      // Vendors can update only their own tasks (e.g., add notes, close/reopen)
      if (isVendor(user)) {
        const vendorId = getVendorId(user);
        if (!vendorId) return false;
        return {
          vendor: {
            equals: vendorId,
          },
        };
      }

      return false;
    },
    delete: ({ req }) => {
      // Only super admins can delete tasks
      return isSuperAdmin(req.user);
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
      required: true,
      admin: {
        description: "Describe your question, issue, or request in detail.",
      },
    },
    {
      name: "type",
      type: "select",
      options: [
        { label: "Question", value: "question" },
        { label: "Feature Request", value: "feature-request" },
        { label: "Bug", value: "bug" },
        { label: "Onboarding", value: "onboarding" },
        { label: "Other", value: "other" },
      ],
      defaultValue: "question",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Open", value: "open" },
        { label: "In Progress", value: "in-progress" },
        { label: "Waiting on Vendor", value: "waiting-on-vendor" },
        { label: "Waiting on Admin", value: "waiting-on-admin" },
        { label: "Closed", value: "closed" },
      ],
      defaultValue: "open",
      required: true,
    },
    {
      name: "priority",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      defaultValue: "normal",
      required: true,
    },
    {
      name: "vendor",
      type: "relationship",
      relationTo: "vendors",
      required: true,
      admin: {
        description: "Vendor associated with this task.",
        position: "sidebar",
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      required: false,
      admin: {
        description: "Admin/BDO responsible for this task.",
        position: "sidebar",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "value",
          type: "text",
        },
      ],
      admin: {
        description: "Optional tags, e.g. 'category', 'upload-help', 'payments'.",
      },
    },
    {
      name: "visibility",
      type: "select",
      options: [
        { label: "Vendor & Admin", value: "vendor-and-admin" },
        { label: "Admin Only", value: "admin-only" },
      ],
      defaultValue: "vendor-and-admin",
      required: true,
    },
    {
      name: "closedAt",
      type: "date",
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "lastReadAtByVendor",
      type: "date",
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "lastReadAtByAdmin",
      type: "json",
      required: false,
      admin: {
        description: "Map of admin user IDs to last read timestamps.",
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        const user = req.user;

        if (operation === "create") {
          // Auto-set vendor and createdBy on create
          if (!isSuperAdmin(user) && isVendor(user)) {
            const vendorId = getVendorId(user);
            if (vendorId) {
              data.vendor = vendorId;
            }
          }
          if (user?.id) {
            data.createdBy = user.id;
          }
        }

        return data;
      },
    ],
  },
};

