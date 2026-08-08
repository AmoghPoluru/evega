import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    // Local media is served at /api/media/file/* (see getMediaUrl → relative paths).
    // Keep localhost remotePatterns for any remaining absolute URLs in older data.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
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
