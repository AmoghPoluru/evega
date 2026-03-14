import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { getVendorId } from "@/lib/access";

export const VendorHeroBanners: CollectionConfig = {
  slug: "vendor-hero-banners",
  access: {
    read: () => true, // Public read for displaying on vendor pages
    create: ({ req }) => {
      // Only vendors can create their own banners
      const vendorId = getVendorId(req.user);
      return !!vendorId;
    },
    update: ({ req, data }) => {
      // Vendors can only update their own banners
      const vendorId = getVendorId(req.user);
      if (!vendorId) return false;
      
      // If data is provided, check vendor matches
      if (data && data.vendor) {
        const bannerVendorId = typeof data.vendor === "string" ? data.vendor : data.vendor.id;
        return bannerVendorId === vendorId;
      }
      
      return true; // Will be checked in hooks
    },
    delete: ({ req, id }) => {
      // Vendors can only delete their own banners
      const vendorId = getVendorId(req.user);
      if (!vendorId) return false;
      
      // Will be checked in hooks
      return true;
    },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "vendor", "isActive", "order", "createdAt"],
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Ensure vendor is set to the current user's vendor
        const vendorId = getVendorId(req.user);
        if (vendorId && operation === "create" && data) {
          data.vendor = vendorId;
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Verify vendor owns this banner
        const vendorId = getVendorId(req.user);
        if (!vendorId) {
          throw new Error("Unauthorized");
        }

        const payload = req.payload;
        const banner = await payload.findByID({
          collection: "vendor-hero-banners",
          id: id as string,
        });

        const bannerVendorId = typeof banner.vendor === "string" ? banner.vendor : banner.vendor?.id;
        if (bannerVendorId !== vendorId) {
          throw new Error("You can only delete your own banners");
        }
      },
    ],
    beforeValidate: [
      async ({ req, data, operation }) => {
        // Ensure vendor is set and matches current user's vendor
        const vendorId = getVendorId(req.user);
        if (vendorId && operation === "update" && data) {
          // Don't allow changing vendor on update
          if (data.vendor && typeof data.vendor === "string" && data.vendor !== vendorId) {
            throw new Error("You cannot change the vendor of a banner");
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
      admin: {
        description: "The vendor who owns this banner",
        readOnly: true, // Set automatically, cannot be changed
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Title for the hero banner section",
      },
    },
    {
      name: "subtitle",
      type: "text",
      admin: {
        description: "Optional subtitle text",
      },
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional background image for the banner (recommended: 1920x500px)",
      },
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: "Select products to display in this hero banner (only your own products)",
      },
      filterOptions: ({ user }) => {
        // Filter products to only show vendor's own products
        const vendorId = getVendorId(user as any);
        if (!vendorId) return false;
        
        return {
          vendor: {
            equals: vendorId,
          },
        };
      },
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Only active banners will be displayed on your vendor page",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
      },
    },
  ],
};
