#!/usr/bin/env tsx
/**
 * Migration Script: Local Media to Vercel Blob Storage
 * 
 * This script migrates existing media files from local storage to Vercel Blob Storage.
 * 
 * Steps:
 * 1. Find all media records in MongoDB
 * 2. For each media file that doesn't have a Blob URL:
 *    - Read the local file (if exists)
 *    - Upload to Vercel Blob
 *    - Update MongoDB record with Blob URL
 * 
 * Usage:
 *   npm run migrate:media:blob
 * 
 * Prerequisites:
 *   - BLOB_READ_WRITE_TOKEN must be set in environment variables
 *   - Media files must exist in local media/ directory
 */

// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
import { resolve } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// Load .env.local first, then .env (local takes precedence)
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config(); // This will load .env but won't override .env.local values

// Now import Payload after env vars are loaded (using dynamic import)
import { getPayload } from "payload";
import { uploadToBlob } from "@/lib/vercel-blob-storage";

// Dynamic import of config to ensure env vars are loaded first
let config: any;
async function loadConfig() {
  if (!config) {
    config = (await import("@payload-config")).default;
  }
  return config;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ filename: string; error: string }>;
}

async function migrateMediaToBlob() {
  console.log("🚀 Starting media migration to Vercel Blob Storage...\n");

  // Check if Blob token is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ Error: BLOB_READ_WRITE_TOKEN is not set!");
    console.error("   Get it from: Vercel Dashboard → Storage → Blob → Create Token");
    console.error("   Add it to .env.local or Vercel environment variables");
    process.exit(1);
  }

  // Initialize Payload (load config dynamically)
  const payloadConfig = await loadConfig();
  const payload = await getPayload({ config: payloadConfig });
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get all media records
    console.log("📋 Fetching media records from database...");
    const mediaResult = await payload.find({
      collection: "media",
      limit: 1000, // Adjust if you have more than 1000 media files
      pagination: false,
    });

    stats.total = mediaResult.docs.length;
    console.log(`   Found ${stats.total} media records\n`);

    if (stats.total === 0) {
      console.log("✅ No media files to migrate.");
      return;
    }

    // Process each media file
    for (let i = 0; i < mediaResult.docs.length; i++) {
      const media = mediaResult.docs[i];
      const filename = media.filename || `media-${media.id}`;
      const currentUrl = media.url;

      // Check if already migrated (URL points to Vercel Blob)
      if (currentUrl && typeof currentUrl === 'string' && currentUrl.includes('blob.vercel-storage.com')) {
        console.log(`⏭️  [${i + 1}/${stats.total}] ${filename} - Already in Blob Storage`);
        stats.skipped++;
        continue;
      }

      // Check if local file exists
      const mediaDir = join(process.cwd(), "media");
      const filePath = join(mediaDir, filename);

      if (!existsSync(filePath)) {
        console.log(`⚠️  [${i + 1}/${stats.total}] ${filename} - Local file not found, skipping`);
        stats.skipped++;
        stats.errors.push({
          filename,
          error: "Local file not found",
        });
        continue;
      }

      try {
        // Read local file
        console.log(`📤 [${i + 1}/${stats.total}] Uploading ${filename}...`);
        const fileBuffer = await readFile(filePath);
        const mimeType = media.mimeType || "application/octet-stream";

        // Upload to Vercel Blob
        const blobResult = await uploadToBlob(
          fileBuffer,
          filename,
          mimeType
        );

        // Update MongoDB record
        await payload.update({
          collection: "media",
          id: media.id,
          data: {
            url: blobResult.url,
          },
        });

        console.log(`   ✅ Migrated: ${blobResult.url}`);
        stats.migrated++;
      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}`);
        stats.failed++;
        stats.errors.push({
          filename,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary");
    console.log("=".repeat(50));
    console.log(`Total media files:     ${stats.total}`);
    console.log(`✅ Successfully migrated: ${stats.migrated}`);
    console.log(`⏭️  Skipped:              ${stats.skipped}`);
    console.log(`❌ Failed:               ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log("\n❌ Errors:");
      stats.errors.forEach(({ filename, error }) => {
        console.log(`   - ${filename}: ${error}`);
      });
    }

    if (stats.migrated > 0) {
      console.log("\n✅ Migration complete! Media files are now in Vercel Blob Storage.");
      console.log("   You can safely delete local media files after verifying everything works.");
    }
  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateMediaToBlob()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
