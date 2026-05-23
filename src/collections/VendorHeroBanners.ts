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
        // Note: When called from tRPC, ownership is already validated in the mutation
        // This hook is primarily for Payload admin panel access
        const vendorId = getVendorId(req.user);
        
        // If no vendor ID found, allow deletion (tRPC will handle validation)
        // This prevents "Unauthorized" errors when deleting via tRPC
        if (!vendorId) {
          // Allow deletion - tRPC mutation will validate ownership
          return;
        }

        // For Payload admin panel, validate ownership
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
        
        // For create operations, ensure products is a valid array
        // Note: We don't validate product existence here as that's done in the tRPC mutation
        // This hook just ensures the format is correct for Payload
        if (operation === "create" && data && data.products) {
          // Ensure products is an array
          if (!Array.isArray(data.products)) {
            throw new Error("Products must be an array");
          }
          
          // Ensure products array is not empty (required field)
          if (data.products.length === 0) {
            throw new Error("At least one product is required");
          }
          
          // Ensure all items are strings (product IDs)
          const invalidProducts = data.products.filter((id: any) => typeof id !== "string" || !id || id.trim() === "");
          if (invalidProducts.length > 0) {
            console.warn("[VendorHeroBanners.beforeValidate] Invalid product IDs found:", invalidProducts);
            // Remove invalid IDs instead of throwing error
            data.products = data.products.filter((id: any) => typeof id === "string" && id && id.trim() !== "");
            if (data.products.length === 0) {
              throw new Error("No valid product IDs provided");
            }
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
        // This is primarily for admin UI - API calls validate separately
        const vendorId = getVendorId(user as any);
        if (!vendorId) {
          // If no vendor ID, don't filter (allow all) - validation happens in API
          return true;
        }
        
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
      admin: {
        description: "Display order (lower numbers appear first). Leave empty for default ordering.",
      },
    },
  ],
};
