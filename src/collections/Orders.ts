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
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        // Send order confirmation email when order is created
        if (operation === "create" && doc.status === "payment_done") {
          try {
            // Fetch user to get email
            const user = await req.payload.findByID({
              collection: "users",
              id: typeof doc.user === "string" ? doc.user : doc.user.id,
              depth: 0,
            });

            // Fetch product to get name
            const product = await req.payload.findByID({
              collection: "products",
              id: typeof doc.product === "string" ? doc.product : doc.product.id,
              depth: 0,
            });

            if (user.email) {
              const { sendOrderConfirmationEmail } = await import("@/lib/email");
              await sendOrderConfirmationEmail(
                user.email,
                doc.orderNumber,
                doc.total,
                [
                  {
                    name: product.name || "Product",
                    quantity: doc.quantity || 1,
                    price: doc.total,
                  },
                ]
              );
            }
          } catch (error) {
            // Log error but don't fail order creation
            console.error("Failed to send order confirmation email:", error);
          }
        }

        // Send order status update email when status changes
        if (operation === "update" && previousDoc && doc.status !== previousDoc.status) {
          try {
            const user = await req.payload.findByID({
              collection: "users",
              id: typeof doc.user === "string" ? doc.user : doc.user.id,
              depth: 0,
            });

            if (user.email) {
              // Status update emails can be added here if needed
              // For now, we only send confirmation on creation
            }
          } catch (error) {
            console.error("Failed to send order status update email:", error);
          }
        }
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
        description: "Total order amount in USD (customer paid amount)",
      },
    },
    {
      name: "commission",
      type: "number",
      admin: {
        description: "Platform commission amount (calculated from vendor commissionRate)",
        readOnly: true,
      },
    },
    {
      name: "commissionRate",
      type: "number",
      admin: {
        description: "Commission rate (%) used for this order (snapshot from vendor at time of order)",
        readOnly: true,
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
      name: "shippingAddress",
      type: "group",
      label: "Shipping Address",
      admin: {
        description: "Shipping address for this order (snapshot at time of order)",
      },
      fields: [
        {
          name: "fullName",
          type: "text",
          label: "Recipient Name",
          required: true,
          admin: {
            description: "Full name of the recipient",
          },
        },
        {
          name: "phone",
          type: "text",
          label: "Phone Number",
          admin: {
            description: "Contact phone number for delivery",
          },
        },
        {
          name: "street",
          type: "text",
          label: "Street Address",
          required: true,
          admin: {
            description: "Street address, apartment, suite, etc.",
          },
        },
        {
          name: "city",
          type: "text",
          label: "City",
          required: true,
        },
        {
          name: "state",
          type: "select",
          label: "State",
          required: true,
          options: [
            { label: "Alabama", value: "AL" },
            { label: "Alaska", value: "AK" },
            { label: "Arizona", value: "AZ" },
            { label: "Arkansas", value: "AR" },
            { label: "California", value: "CA" },
            { label: "Colorado", value: "CO" },
            { label: "Connecticut", value: "CT" },
            { label: "Delaware", value: "DE" },
            { label: "Florida", value: "FL" },
            { label: "Georgia", value: "GA" },
            { label: "Hawaii", value: "HI" },
            { label: "Idaho", value: "ID" },
            { label: "Illinois", value: "IL" },
            { label: "Indiana", value: "IN" },
            { label: "Iowa", value: "IA" },
            { label: "Kansas", value: "KS" },
            { label: "Kentucky", value: "KY" },
            { label: "Louisiana", value: "LA" },
            { label: "Maine", value: "ME" },
            { label: "Maryland", value: "MD" },
            { label: "Massachusetts", value: "MA" },
            { label: "Michigan", value: "MI" },
            { label: "Minnesota", value: "MN" },
            { label: "Mississippi", value: "MS" },
            { label: "Missouri", value: "MO" },
            { label: "Montana", value: "MT" },
            { label: "Nebraska", value: "NE" },
            { label: "Nevada", value: "NV" },
            { label: "New Hampshire", value: "NH" },
            { label: "New Jersey", value: "NJ" },
            { label: "New Mexico", value: "NM" },
            { label: "New York", value: "NY" },
            { label: "North Carolina", value: "NC" },
            { label: "North Dakota", value: "ND" },
            { label: "Ohio", value: "OH" },
            { label: "Oklahoma", value: "OK" },
            { label: "Oregon", value: "OR" },
            { label: "Pennsylvania", value: "PA" },
            { label: "Rhode Island", value: "RI" },
            { label: "South Carolina", value: "SC" },
            { label: "South Dakota", value: "SD" },
            { label: "Tennessee", value: "TN" },
            { label: "Texas", value: "TX" },
            { label: "Utah", value: "UT" },
            { label: "Vermont", value: "VT" },
            { label: "Virginia", value: "VA" },
            { label: "Washington", value: "WA" },
            { label: "West Virginia", value: "WV" },
            { label: "Wisconsin", value: "WI" },
            { label: "Wyoming", value: "WY" },
            { label: "District of Columbia", value: "DC" },
          ],
        },
        {
          name: "zipcode",
          type: "text",
          label: "ZIP Code",
          required: true,
          admin: {
            description: "5-digit ZIP code or ZIP+4 format (e.g., 12345 or 12345-6789)",
          },
        },
        {
          name: "country",
          type: "text",
          label: "Country",
          defaultValue: "United States",
          admin: {
            description: "Country for shipping",
          },
        },
      ],
    },
    {
      name: "shippingMethod",
      type: "select",
      label: "Shipping Method",
      options: [
        { label: "Standard Shipping", value: "standard" },
        { label: "Express Shipping", value: "express" },
        { label: "Overnight Shipping", value: "overnight" },
        { label: "International Shipping", value: "international" },
        { label: "Local Delivery", value: "local" },
        { label: "Pickup", value: "pickup" },
      ],
      admin: {
        description: "Shipping method selected for this order",
      },
    },
    {
      name: "shippingCost",
      type: "number",
      label: "Shipping Cost",
      defaultValue: 0,
      admin: {
        description: "Shipping cost in USD",
      },
    },
    {
      name: "shippingStatus",
      type: "select",
      label: "Shipping Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Label Created", value: "label_created" },
        { label: "Shipped", value: "shipped" },
        { label: "In Transit", value: "in_transit" },
        { label: "Out for Delivery", value: "out_for_delivery" },
        { label: "Delivered", value: "delivered" },
        { label: "Exception", value: "exception" },
        { label: "Returned", value: "returned" },
      ],
      defaultValue: "pending",
      admin: {
        description: "Current shipping status",
      },
    },
    {
      name: "trackingNumber",
      type: "text",
      admin: {
        description: "Shipping tracking number",
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
      name: "actualDeliveryDate",
      type: "date",
      admin: {
        description: "Actual delivery date (when package was delivered)",
      },
    },
    {
      name: "shippingLabelUrl",
      type: "text",
      admin: {
        description: "URL to shipping label PDF",
      },
    },
    {
      name: "packageWeight",
      type: "number",
      admin: {
        description: "Package weight in pounds (lbs)",
      },
    },
    {
      name: "packageDimensions",
      type: "group",
      label: "Package Dimensions",
      admin: {
        description: "Package dimensions for shipping calculations",
      },
      fields: [
        {
          name: "length",
          type: "number",
          label: "Length (inches)",
        },
        {
          name: "width",
          type: "number",
          label: "Width (inches)",
        },
        {
          name: "height",
          type: "number",
          label: "Height (inches)",
        },
      ],
    },
    {
      name: "insuranceValue",
      type: "number",
      admin: {
        description: "Insurance value for the shipment in USD",
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
