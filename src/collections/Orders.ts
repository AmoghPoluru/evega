import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { isSuperAdmin, isVendor, getVendorId } from "@/lib/access";
import { generateOrderNumber } from "@/lib/order-number";

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => {
      const user = req.user;
      // Super admins can read all orders
      if (isSuperAdmin(user)) {
        return true;
      }
      // Vendors can read orders for their products
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          const where: Where = {
            vendor: { equals: vendorId },
          };
          return where;
        }
      }
      // Users can read their own orders
      if (user) {
        const where: Where = {
          user: { equals: user.id },
        };
        return where;
      }
      return false;
    },
    create: ({ req }) => {
      // Only allow creation via webhook (no user context) or super admin
      return true; // Webhooks don't have user context, so allow creation
    },
    update: ({ req }) => {
      const user = req.user;
      // Super admins can update all orders
      if (isSuperAdmin(user)) {
        return true;
      }
      // Vendors can update orders for their products
      if (user && isVendor(user) && user.vendor) {
        const vendorId = getVendorId(user);
        if (vendorId) {
          const where: Where = {
            vendor: { equals: vendorId },
          };
          return where;
        }
      }
      // Users cannot update orders (read-only for customers)
      return false;
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "user", "status", "total", "createdAt"],
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        // Generate order number on create
        if (operation === "create" && !data.orderNumber) {
          data.orderNumber = await generateOrderNumber();
        }

        // Auto-assign vendor from product when creating order
        if (operation === "create" && data.product && !data.vendor) {
          // Fetch product to get vendor
          const product = await req.payload.findByID({
            collection: "products",
            id: typeof data.product === "string" ? data.product : data.product.id,
            depth: 0,
          });
          if (product.vendor) {
            data.vendor = typeof product.vendor === "string" ? product.vendor : product.vendor.id;
          }
        }

        // Track status history
        if (operation === "update" && data.status && originalDoc) {
          // If status changed, add to history
          if (data.status !== originalDoc.status) {
            const newHistoryEntry = {
              status: data.status,
              timestamp: new Date().toISOString(),
              note: req.user ? `Updated by ${req.user.email}` : "System update",
            };

            data.statusHistory = [
              ...(originalDoc.statusHistory || []),
              newHistoryEntry,
            ];
          }
        } else if (operation === "create" && data.status) {
          // Initial status history entry
          data.statusHistory = [
            {
              status: data.status,
              timestamp: new Date().toISOString(),
              note: "Order created",
            },
          ];
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Unique order number (auto-generated)",
        readOnly: true,
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
    },
    {
      name: "vendor",
      type: "relationship",
      relationTo: "vendors",
      required: true,
      admin: {
        description: "Vendor that should fulfill this order (auto-assigned from product)",
      },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Payment Done", value: "payment_done" },
        { label: "Processing", value: "processing" },
        { label: "Complete", value: "complete" },
        { label: "Canceled", value: "canceled" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
      required: true,
      admin: {
        description: "Order status workflow: Pending → Payment Done → Processing → Complete",
      },
    },
    {
      name: "statusHistory",
      type: "array",
      fields: [
                {
                  name: "status",
                  type: "select",
                  options: [
                    { label: "Pending", value: "pending" },
                    { label: "Payment Done", value: "payment_done" },
                    { label: "Processing", value: "processing" },
                    { label: "Complete", value: "complete" },
                    { label: "Canceled", value: "canceled" },
                    { label: "Refunded", value: "refunded" },
                  ],
                },
        {
          name: "timestamp",
          type: "date",
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: "note",
          type: "text",
          label: "Admin Note (optional)",
        },
      ],
      admin: {
        description: "History of status changes",
        readOnly: true,
      },
    },
    {
      name: "total",
      type: "number",
      required: true,
      admin: {
        description: "Total order amount in USD",
      },
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description: "Quantity of items ordered",
      },
    },
    {
      name: "size",
      type: "text",
      admin: {
        description: "Product size variant (if applicable)",
      },
    },
    {
      name: "color",
      type: "text",
      admin: {
        description: "Product color variant (if applicable)",
      },
    },
    {
      name: "stripeCheckoutSessionId",
      type: "text",
      required: true,
      admin: {
        description: "Stripe checkout session associated with the order",
      },
    },
    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe account associated with the order",
      },
    },
    {
      name: "stripePaymentIntentId",
      type: "text",
      admin: {
        description: "Stripe payment intent ID",
      },
    },
    {
      name: "trackingNumber",
      type: "text",
      admin: {
        description: "Shipping tracking number",
        condition: (data) => data.status === "complete" || data.status === "refunded",
      },
    },
    {
      name: "carrier",
      type: "select",
      options: [
        { label: "USPS", value: "usps" },
        { label: "FedEx", value: "fedex" },
        { label: "UPS", value: "ups" },
        { label: "DHL", value: "dhl" },
        { label: "Other", value: "other" },
      ],
      admin: {
        description: "Shipping carrier",
        condition: (data) => data.status === "complete" || data.status === "refunded",
      },
    },
    {
      name: "trackingUrl",
      type: "text",
      admin: {
        description: "Tracking URL (auto-generated if carrier is selected)",
      },
    },
    {
      name: "estimatedDelivery",
      type: "date",
      admin: {
        description: "Estimated delivery date",
      },
    },
    {
      name: "vendorPayout",
      type: "group",
      label: "Vendor Payout Information",
      admin: {
        description: "Payout details for the vendor",
      },
      fields: [
        {
          name: "amount",
          type: "number",
          admin: {
            description: "Amount to be paid to vendor (after commission)",
          },
        },
        {
          name: "commissionAmount",
          type: "number",
          admin: {
            description: "Platform commission amount",
          },
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Completed", value: "completed" },
            { label: "Failed", value: "failed" },
          ],
          defaultValue: "pending",
          admin: {
            description: "Payout status",
          },
        },
        {
          name: "payoutDate",
          type: "date",
          admin: {
            description: "Date when payout was processed",
          },
        },
        {
          name: "transactionId",
          type: "text",
          admin: {
            description: "Stripe transfer/payout transaction ID",
          },
        },
      ],
    },
  ],
};
