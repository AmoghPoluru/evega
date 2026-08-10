import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { isSuperAdmin, isVendor, getVendorId } from "@/lib/access";
import { generateOrderNumber } from "@/lib/order-number";
import {
  getClosedOrderRevenueUpdateFields,
  isTransitionToClosedRevenue,
  refreshCustomersForClosedOrder,
} from "@/lib/vendor-revenue/finalize-closed-order";

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
            const existingHistory = data.statusHistory ?? originalDoc.statusHistory ?? [];
            const lastEntry = existingHistory[existingHistory.length - 1];

            if (lastEntry?.status !== data.status) {
              const newHistoryEntry = {
                status: data.status,
                timestamp: new Date().toISOString(),
                note: req.user ? `Updated by ${req.user.email}` : "System update",
              };

              data.statusHistory = [...existingHistory, newHistoryEntry];
            } else {
              data.statusHistory = existingHistory;
            }
          }
        } else if (operation === "create" && data.status && !data.statusHistory?.length) {
          const saleTimestamp = data.manualSaleDate
            ? new Date(data.manualSaleDate).toISOString()
            : new Date().toISOString();

          data.statusHistory = [
            {
              status: data.status,
              timestamp: saleTimestamp,
              note: data.isManualRevenueEntry ? "Manual revenue recorded" : "Order created",
            },
          ];
        }

        if (
          operation === "update" &&
          originalDoc &&
          isTransitionToClosedRevenue(originalDoc.status, data.status)
        ) {
          Object.assign(data, getClosedOrderRevenueUpdateFields({ ...originalDoc, ...data }));
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        // Send order confirmation email when order is created
        if (operation === "create" && doc.status === "payment_done" && doc.product) {
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

            // Notify the owning vendor via WhatsApp (async, don't block, log on failure)
            try {
              const { resolveVendorWhatsApp, notifyVendorNewOrder, resolveProductImageUrl } =
                await import("@/lib/whatsapp");
              const vendorWhatsApp = await resolveVendorWhatsApp(req.payload, product);
              const imageUrl = await resolveProductImageUrl(req.payload, product);
              await notifyVendorNewOrder(vendorWhatsApp, {
                orderNumber: doc.orderNumber,
                productName: product.name || "Product",
                quantity: doc.quantity || 1,
                total: doc.total,
                customerName: user.name || user.email || "Customer",
                orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/orders/${doc.id}`,
                imageUrl,
              });
            } catch (whatsappError) {
              console.error("Failed to send vendor WhatsApp order notification:", whatsappError);
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

        // Completed orders count as revenue — refresh linked customer stats
        if (
          operation === "update" &&
          previousDoc &&
          isTransitionToClosedRevenue(previousDoc.status, doc.status)
        ) {
          try {
            await refreshCustomersForClosedOrder(req.payload, doc);
          } catch (error) {
            console.error(`[Orders Hook] Failed to refresh customer stats for closed order ${doc.id}:`, error);
          }
        }

        // Restore inventory when order is canceled or refunded
        if (
          operation === "update" &&
          previousDoc &&
          doc.status !== previousDoc.status &&
          (doc.status === "canceled" || doc.status === "refunded") &&
          previousDoc.inventoryAdjusted === "deducted" &&
          doc.product
        ) {
          try {
            const { restoreStockForOrder } = await import("@/lib/inventory/adjust-product-stock");
            const productId =
              typeof doc.product === "string" ? doc.product : doc.product.id;

            const restored = await restoreStockForOrder(
              req.payload,
              {
                productId,
                quantity: doc.quantity ?? 1,
                size: doc.size ?? null,
                color: doc.color ?? null,
                inventoryAdjusted: previousDoc.inventoryAdjusted as string | null,
              },
              { orderId: doc.id, overrideAccess: true },
            );

            if (restored) {
              await req.payload.update({
                collection: "orders",
                id: doc.id,
                data: { inventoryAdjusted: "restored" },
                overrideAccess: true,
              });
            }
          } catch (error) {
            console.error(`[Orders Hook] Failed to restore inventory for order ${doc.id}:`, error);
          }
        }

        // Task 1009: Check product stock after order creation and auto-draft if needed
        if (operation === "create" && doc.product) {
          try {
            const productId = typeof doc.product === "string" ? doc.product : doc.product.id;
            const product = await req.payload.findByID({
              collection: "products",
              id: productId,
              depth: 0,
            });

            // Calculate total stock from variants
            let totalStock = 0;
            if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
              totalStock = product.variants.reduce((sum: number, variant: any) => {
                return sum + (variant.stock || 0);
              }, 0);
            }

            // If stock is 0 and product is published, auto-draft it
            if (totalStock === 0 && product.isPrivate === false) {
              await req.payload.update({
                collection: "products",
                id: productId,
                data: {
                  isPrivate: true,
                },
              });
              console.log(`[Orders Hook] Auto-drafted product ${productId} due to zero inventory after order creation`);
            }
          } catch (error) {
            console.error(`[Orders Hook] Failed to check/auto-draft product after order creation:`, error);
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
      required: false,
      hasMany: false,
      admin: {
        description: "Logged-in customer. Omitted for guest checkout orders.",
      },
    },
    {
      name: "guestEmail",
      type: "email",
      label: "Guest Email",
      admin: {
        description: "Email for guest checkout orders (when user is not set)",
        condition: (data) => !data?.user,
      },
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
      required: false,
      hasMany: false,
      admin: {
        description:
          "Primary product for single-item orders. Optional for manual revenue with line items or untracked sales.",
      },
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
      name: "inventoryAdjusted",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Deducted", value: "deducted" },
        { label: "Restored", value: "restored" },
      ],
      defaultValue: "none",
      admin: {
        readOnly: true,
        description: "Whether product stock was deducted on place or restored on cancel/refund",
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
      admin: {
        description: "Stripe checkout session associated with the order (only for Stripe payments)",
        condition: (data) => data?.paymentMethod === "stripe",
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
      name: "stripeTransferId",
      type: "text",
      admin: {
        description: "Stripe transfer ID (for vendor payout via Stripe Connect)",
      },
    },
    {
      name: "transferStatus",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" },
      ],
      defaultValue: "pending",
      admin: {
        description: "Status of the transfer to vendor's Stripe account",
      },
    },
    {
      name: "paymentMethod",
      type: "select",
      label: "Payment Method",
      options: [
        { label: "Stripe", value: "stripe" },
        { label: "Offline Payment", value: "offline" },
      ],
      defaultValue: "stripe",
      required: true,
      admin: {
        description: "How the customer chose to pay for this order",
      },
    },
    {
      name: "orderSource",
      type: "select",
      label: "Order source",
      options: [
        { label: "Online storefront", value: "online" },
        { label: "Manual entry", value: "manual" },
      ],
      admin: {
        description: "Online = customer checkout. Manual = vendor or staff created the order.",
      },
    },
    {
      name: "isManualRevenueEntry",
      type: "checkbox",
      label: "Manual revenue entry",
      defaultValue: false,
      admin: {
        description: "Created from My Revenue (not My Orders)",
      },
    },
    {
      name: "manualSaleDate",
      type: "date",
      label: "Manual sale date",
      admin: {
        description: "When the sale happened (for manual revenue entries)",
        condition: (data) => Boolean(data?.isManualRevenueEntry),
      },
    },
    {
      name: "saleContext",
      type: "select",
      label: "Sale context",
      options: [
        { label: "Store visit", value: "store_visit" },
        { label: "Expo / event", value: "expo" },
        { label: "Other", value: "other" },
      ],
      admin: {
        condition: (data) => Boolean(data?.isManualRevenueEntry),
      },
    },
    {
      name: "expoName",
      type: "text",
      label: "Expo / event name",
      admin: {
        condition: (data) => data?.isManualRevenueEntry && data?.saleContext === "expo",
      },
    },
    {
      name: "revenueDescription",
      type: "textarea",
      label: "Revenue description",
      admin: {
        description: "Notes about the sale (store visit, walk-in, etc.)",
        condition: (data) => Boolean(data?.isManualRevenueEntry),
      },
    },
    {
      name: "saleCustomers",
      type: "array",
      label: "Customers",
      admin: {
        description: "Walk-in or expo customers for this sale (name and phone, no shipping address)",
        condition: (data) =>
          Boolean(data?.isManualRevenueEntry) &&
          (data?.saleContext === "store_visit" || data?.saleContext === "expo"),
      },
      fields: [
        {
          name: "customer",
          type: "relationship",
          relationTo: "customers",
          admin: {
            description: "Linked customer record in My Customers",
          },
        },
        {
          name: "name",
          type: "text",
          label: "Customer name",
          required: true,
        },
        {
          name: "phone",
          type: "text",
          label: "Phone number",
          required: true,
        },
      ],
    },
    {
      name: "lineItems",
      type: "array",
      label: "Line items",
      admin: {
        description: "Products sold in this manual revenue entry",
        condition: (data) => Boolean(data?.isManualRevenueEntry),
      },
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: false,
        },
        {
          name: "description",
          type: "text",
          label: "Line description",
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          defaultValue: 1,
          min: 1,
        },
        {
          name: "unitPrice",
          type: "number",
          required: true,
          min: 0,
        },
        {
          name: "size",
          type: "text",
        },
        {
          name: "color",
          type: "text",
        },
      ],
    },
    {
      name: "paymentStatus",
      type: "select",
      label: "Payment Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
      required: true,
      admin: {
        description: "Current payment status for this order",
      },
    },
    {
      name: "offlinePaymentContact",
      type: "group",
      label: "Offline Payment Contact Info",
      fields: [
        {
          name: "phone",
          type: "text",
          label: "Vendor Phone",
        },
        {
          name: "email",
          type: "email",
          label: "Vendor Email",
        },
        {
          name: "customerPhone",
          type: "text",
          label: "Customer Phone",
          admin: {
            description: "Customer's phone number for vendor to contact them",
          },
        },
      ],
      admin: {
        condition: (data) => data?.paymentMethod === "offline",
        description: "Contact information for offline payment (vendor and customer)",
      },
    },
    {
      name: "offlinePaymentNotes",
      type: "textarea",
      label: "Offline Payment Notes",
      admin: {
        condition: (data) => data?.paymentMethod === "offline",
        description: "Any notes about the offline payment arrangement",
      },
    },
    {
      name: "shippingAddress",
      type: "group",
      label: "Shipping Address",
      admin: {
        description: "Shipping address for online and shipped orders",
        condition: (data) => !data?.isManualRevenueEntry,
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
