import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { isSuperAdmin, getVendorId } from "@/lib/access";

export const Vendors: CollectionConfig = {
  slug: "vendors",
  admin: {
    useAsTitle: "name",
    description: "Vendors/Sellers in the marketplace",
  },
  access: {
    read: () => true, // Public can read vendor info
    create: ({ req }) => {
      // Only authenticated users can create vendors (during registration)
      return Boolean(req.user);
    },
    update: ({ req, data }) => {
      const user = req.user;
      
      // Super admins can update everything
      if (isSuperAdmin(user)) return true;
      
      // Vendors can update their own vendor, but NOT status or isActive
      const vendorId = getVendorId(user);
      if (vendorId) {
        // Prevent vendors from changing status or isActive
        if (data?.status !== undefined || data?.isActive !== undefined) {
          return false;
        }
        
        const where: Where = { id: { equals: vendorId } };
        return where;
      }
      
      return false;
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Auto-generate slug from name
        if (operation === "create" && data?.name && !data?.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user;
        
        // Prevent vendors from changing their own status or isActive
        if (operation === "update" && user && !isSuperAdmin(user)) {
          const vendorId = getVendorId(user);
          if (vendorId && (data?.status !== undefined || data?.isActive !== undefined)) {
            // Remove status and isActive from data if vendor is trying to change it
            delete data.status;
            delete data.isActive;
          }
        }
        
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        // Send vendor approval email when status changes to "approved"
        if (
          operation === "update" &&
          previousDoc &&
          doc.status === "approved" &&
          previousDoc.status !== "approved"
        ) {
          try {
            // Fetch user associated with vendor
            const users = await req.payload.find({
              collection: "users",
              where: {
                vendor: { equals: doc.id },
              },
              limit: 1,
            });

            if (users.docs.length > 0 && users.docs[0].email) {
              const { sendVendorApprovalEmail } = await import("@/lib/email");
              await sendVendorApprovalEmail(users.docs[0].email, doc.name);
            } else if (doc.email) {
              // Fallback to vendor email if user not found
              const { sendVendorApprovalEmail } = await import("@/lib/email");
              await sendVendorApprovalEmail(doc.email, doc.name);
            }
          } catch (error) {
            console.error("Failed to send vendor approval email:", error);
          }
        }

        // Send vendor rejection email when status changes to "rejected"
        if (
          operation === "update" &&
          previousDoc &&
          doc.status === "rejected" &&
          previousDoc.status !== "rejected"
        ) {
          try {
            const users = await req.payload.find({
              collection: "users",
              where: {
                vendor: { equals: doc.id },
              },
              limit: 1,
            });

            if (users.docs.length > 0 && users.docs[0].email) {
              const { sendVendorRejectionEmail } = await import("@/lib/email");
              await sendVendorRejectionEmail(users.docs[0].email, doc.name);
            } else if (doc.email) {
              const { sendVendorRejectionEmail } = await import("@/lib/email");
              await sendVendorRejectionEmail(doc.email, doc.name);
            }
          } catch (error) {
            console.error("Failed to send vendor rejection email:", error);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Business/Vendor name",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly identifier (auto-generated from name)",
      },
    },
    {
      name: "description",
      type: "richText",
      admin: {
        description: "Vendor description/bio",
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Vendor logo image",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Vendor cover/banner image",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        description: "Business email address",
      },
    },
    {
      name: "phone",
      type: "text",
      admin: {
        description: "Business phone number",
      },
    },
    {
      name: "website",
      type: "text",
      admin: {
        description: "Business website URL",
      },
    },
    {
      name: "address",
      type: "group",
      fields: [
        {
          name: "street",
          type: "text",
          label: "Street Address",
        },
        {
          name: "city",
          type: "text",
          label: "City",
        },
        {
          name: "state",
          type: "text",
          label: "State",
        },
        {
          name: "zipcode",
          type: "text",
          label: "ZIP Code",
        },
        {
          name: "country",
          type: "text",
          label: "Country",
          defaultValue: "USA",
        },
      ],
    },
    {
      name: "approveAction",
      type: "text",
      admin: {
        components: {
          Field: "@/collections/components/ApproveVendorButton#ApproveVendorButton",
        },
        description: "Quick action to approve and activate this vendor",
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          if (!isSuperAdmin(user)) {
            return false;
          }
          // Show button if vendor is not already approved AND active
          // Check both data (new values) and siblingData (existing values)
          const currentStatus = data?.status ?? siblingData?.status;
          const currentIsActive = data?.isActive ?? siblingData?.isActive ?? false;
          // Show if status is not approved OR isActive is false
          return currentStatus !== "approved" || currentIsActive === false;
        },
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Suspended", value: "suspended" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "pending",
      admin: {
        description: "Vendor approval status. Use 'Approve & Activate' button to approve vendors.",
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Active vendors can sell products. Use 'Approve & Activate' button above to activate vendors.",
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe Connect account ID for payouts",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeAccountStatus",
      type: "select",
      options: [
        { label: "Not Connected", value: "not_connected" },
        { label: "Pending", value: "pending" },
        { label: "Active", value: "active" },
        { label: "Restricted", value: "restricted" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "not_connected",
      admin: {
        description: "Stripe Connect account status",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeOnboardingLink",
      type: "text",
      admin: {
        description: "Link for vendor to complete Stripe onboarding",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeOnboardingCompleted",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether vendor has completed Stripe onboarding",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeAccountDetails",
      type: "json",
      admin: {
        description: "Detailed Stripe account information (business details, capabilities, requirements)",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeAccountCountry",
      type: "text",
      admin: {
        description: "Stripe account country",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeAccountEmail",
      type: "email",
      admin: {
        description: "Stripe account email",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripeChargesEnabled",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether vendor can accept charges",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "stripePayoutsEnabled",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether vendor can receive payouts",
        readOnly: true,
        condition: (data, siblingData, { user }) => {
          return isSuperAdmin(user);
        },
      },
    },
    {
      name: "syncStripeAction",
      type: "text",
      admin: {
        components: {
          Field: "@/collections/components/SyncStripeDetailsButton#SyncStripeDetailsButton",
        },
        description: "Sync vendor Stripe account details from Stripe API",
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          if (!isSuperAdmin(user)) {
            return false;
          }
          // Show button if vendor has a Stripe account
          const stripeAccountId = data?.stripeAccountId ?? siblingData?.stripeAccountId;
          return !!stripeAccountId;
        },
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "commissionRate",
      type: "number",
      defaultValue: 10,
      admin: {
        description: "Platform commission rate (%)",
      },
    },
    {
      name: "verificationDocuments",
      type: "array",
      label: "Verification Documents",
      admin: {
        description: "Business verification documents (business license, tax ID, etc.)",
      },
      fields: [
        {
          name: "document",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Business License", value: "business-license" },
            { label: "Tax ID", value: "tax-id" },
            { label: "Identity", value: "identity" },
            { label: "Other", value: "other" },
          ],
          required: true,
        },
        {
          name: "notes",
          type: "text",
          admin: {
            description: "Additional notes about this document",
          },
        },
      ],
    },
  ],
};
