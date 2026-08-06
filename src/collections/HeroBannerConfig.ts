import type { GlobalConfig } from "payload";
import { isAppAdmin } from "@/lib/access";

export const HeroBannerConfig: GlobalConfig = {
  slug: "hero-banner-config",
  label: "Happy Banner Config",
  access: {
    read: () => true,
    update: ({ req }) => isAppAdmin(req.user),
  },
  admin: {
    group: "Platform",
    description: "Global Happy Banner motion, product source, and per-vendor overrides.",
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: false,
      label: "Enable Happy Banner system",
    },
    {
      type: "row",
      fields: [
        {
          name: "productSource",
          type: "select",
          defaultValue: "all-active",
          options: [
            { label: "All active products", value: "all-active" },
            { label: "Newest", value: "newest" },
            { label: "Best sellers", value: "best-sellers" },
            { label: "Manual (per-vendor override)", value: "manual" },
          ],
        },
        {
          name: "maxTiles",
          type: "number",
          defaultValue: 24,
          min: 4,
          max: 60,
        },
        {
          name: "shuffleWindow",
          type: "checkbox",
          defaultValue: true,
          label: "Shuffle product window",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "preset",
          type: "select",
          defaultValue: "marquee-max",
          options: [
            { label: "Marquee Max", value: "marquee-max" },
            { label: "Kinetic Wall", value: "kinetic-wall" },
            { label: "Crossfire", value: "crossfire" },
            { label: "Gravity Well", value: "gravity-well" },
            { label: "Confetti", value: "confetti" },
            { label: "Liquid Ribbon", value: "liquid-ribbon" },
          ],
        },
        {
          name: "intensity",
          type: "select",
          defaultValue: "lively",
          options: [
            { label: "Calm", value: "calm" },
            { label: "Lively", value: "lively" },
            { label: "Showcase", value: "showcase" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "height", type: "number", defaultValue: 360, min: 220, max: 640 },
        { name: "tileSize", type: "number", defaultValue: 128, min: 56, max: 200 },
        { name: "speed", type: "number", defaultValue: 1, min: 0.25, max: 3 },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "direction",
          type: "select",
          defaultValue: "ltr",
          options: [
            { label: "Left to right", value: "ltr" },
            { label: "Right to left", value: "rtl" },
          ],
        },
        { name: "pauseOnHover", type: "checkbox", defaultValue: true },
        { name: "particles", type: "checkbox", defaultValue: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "spotlightEnabled", type: "checkbox", defaultValue: true },
        {
          name: "spotlightIntervalMs",
          type: "number",
          defaultValue: 8000,
          min: 3000,
          max: 30000,
        },
      ],
    },
    {
      name: "backgroundMode",
      type: "select",
      defaultValue: "auto-palette",
      options: [
        { label: "Auto palette from products", value: "auto-palette" },
        { label: "Background image", value: "image" },
        { label: "Gradient", value: "gradient" },
        { label: "Theme token", value: "theme-token" },
      ],
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: { condition: (_, s) => s.backgroundMode === "image" },
    },
    {
      type: "row",
      fields: [
        {
          name: "gradientFrom",
          type: "text",
          defaultValue: "#1e1b4b",
          admin: { condition: (_, s) => s.backgroundMode === "gradient" },
        },
        {
          name: "gradientTo",
          type: "text",
          defaultValue: "#312e81",
          admin: { condition: (_, s) => s.backgroundMode === "gradient" },
        },
        {
          name: "scrimOpacity",
          type: "number",
          defaultValue: 0.45,
          min: 0,
          max: 1,
          admin: { condition: (_, s) => s.backgroundMode === "image" },
        },
      ],
    },
    {
      name: "vendorEditableFields",
      type: "select",
      hasMany: true,
      defaultValue: ["header", "tagline"],
      options: [
        { label: "Header", value: "header" },
        { label: "Tagline", value: "tagline" },
      ],
    },
    {
      name: "vendorOverrides",
      type: "array",
      labels: { singular: "Vendor override", plural: "Vendor overrides" },
      fields: [
        { name: "vendor", type: "relationship", relationTo: "vendors", required: true },
        { name: "enabled", type: "checkbox", defaultValue: true },
        {
          name: "preset",
          type: "select",
          options: [
            { label: "Marquee Max", value: "marquee-max" },
            { label: "Kinetic Wall", value: "kinetic-wall" },
            { label: "Crossfire", value: "crossfire" },
            { label: "Gravity Well", value: "gravity-well" },
            { label: "Confetti", value: "confetti" },
            { label: "Liquid Ribbon", value: "liquid-ribbon" },
          ],
        },
        {
          name: "intensity",
          type: "select",
          options: [
            { label: "Calm", value: "calm" },
            { label: "Lively", value: "lively" },
            { label: "Showcase", value: "showcase" },
          ],
        },
        {
          name: "productSource",
          type: "select",
          options: [
            { label: "All active", value: "all-active" },
            { label: "Newest", value: "newest" },
            { label: "Best sellers", value: "best-sellers" },
            { label: "Manual", value: "manual" },
          ],
        },
        {
          name: "manualProducts",
          type: "relationship",
          relationTo: "products",
          hasMany: true,
          admin: { condition: (_, s) => s.productSource === "manual" },
        },
        { name: "backgroundImage", type: "upload", relationTo: "media" },
        { name: "notes", type: "textarea" },
      ],
    },
  ],
};
