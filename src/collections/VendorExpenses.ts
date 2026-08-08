import type { CollectionConfig } from "payload";
import type { Where } from "payload";
import { isSuperAdmin, isVendor, getVendorId } from "@/lib/access";
import { VENDOR_EXPENSE_CATEGORIES } from "@/lib/vendor-expenses/categories";

export const VendorExpenses: CollectionConfig = {
  slug: "vendor-expenses",
  admin: {
    useAsTitle: "description",
    defaultColumns: ["category", "amount", "expenseDate", "vendor", "createdAt"],
    description: "Vendor business expenses (inventory, rent, marketing, etc.)",
  },
  access: {
    read: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          return { vendor: { equals: vendorId } } satisfies Where;
        }
      }
      return false;
    },
    create: ({ req }) => isSuperAdmin(req.user) || isVendor(req.user),
    update: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          return { vendor: { equals: vendorId } } satisfies Where;
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
          return { vendor: { equals: vendorId } } satisfies Where;
        }
      }
      return false;
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user;
        if (operation === "create" && user && isVendor(user) && user.vendor && !data?.vendor) {
          const vendorId = getVendorId(user);
          if (vendorId) {
            data.vendor = vendorId;
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
      index: true,
      admin: {
        description: "Vendor who recorded this expense",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: VENDOR_EXPENSE_CATEGORIES.map((item) => ({
        label: item.label,
        value: item.id,
      })),
      admin: {
        description: "Type of business expense",
      },
    },
    {
      name: "expenseDate",
      type: "date",
      required: true,
      admin: {
        description: "When the expense was paid or incurred",
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "amount",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Expense amount (positive number)",
        step: 0.01,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: {
        description: "What this expense was for",
      },
    },
  ],
};
