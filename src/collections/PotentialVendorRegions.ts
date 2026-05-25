import type { CollectionConfig } from "payload";

import { isAppStaff } from "@/lib/access";

export const PotentialVendorRegions: CollectionConfig = {
  slug: "potential-vendor-regions",
  admin: {
    useAsTitle: "region",
    defaultColumns: ["region", "updatedAt"],
    description: "Regions and prospect vendor names for outreach (staff only).",
  },
  access: {
    read: ({ req }) => isAppStaff(req.user),
    create: ({ req }) => isAppStaff(req.user),
    update: ({ req }) => isAppStaff(req.user),
    delete: ({ req }) => isAppStaff(req.user),
  },
  fields: [
    {
      name: "region",
      type: "text",
      required: true,
      label: "Region",
      admin: {
        description: 'e.g. "Charlotte", "Raleigh", "Triad"',
      },
    },
    {
      name: "potentialVendors",
      type: "array",
      label: "Potential vendors",
      admin: {
        description: "Prospect business or vendor names in this region",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Lower numbers appear first in the staff list",
        position: "sidebar",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      label: "Active",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
