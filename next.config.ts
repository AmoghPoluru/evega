import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  // Cursor opens the parent Projects folder; keep module resolution inside evega.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  // Keep native sharp out of the app bundle so Vercel can load linux libvips.
  // Baileys is a Node-only library with native/dynamic requires; keep it out of
  // the bundle (WhatsApp Channels only runs in a persistent Node process).
  serverExternalPackages: [
    "sharp",
    "@img/sharp-linux-x64",
    "@img/sharp-libvips-linux-x64",
    "@whiskeysockets/baileys",
  ],
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/@img/sharp-linuxmusl-x64/**/*",
      "./node_modules/@img/sharp-libvips-linuxmusl-x64/**/*",
    ],
  },
  webpack: (config) => {
    // Resolve .js imports to .ts files for ESM compatibility
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
  // Configure images for Payload CMS media
  images: {
    remotePatterns: [
      // Allow images from the same domain (for Payload media)
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  // Increase body size limit for API routes (for video uploads)
  // Default is 1MB, we increase to 500MB for large video files
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

export default withPayload(nextConfig);
