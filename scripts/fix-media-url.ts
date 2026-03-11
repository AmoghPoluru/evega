#!/usr/bin/env tsx
/**
 * Fix Media URL Script
 * 
 * This script fixes media records that have incorrect URLs by:
 * 1. Finding media with /api/media/file/ URLs
 * 2. Uploading the local file to Vercel Blob (if exists)
 * 3. Updating the media record with the Blob URL
 * 
 * Usage:
 *   npm run fix:media:url
 *   OR
 *   npx tsx scripts/fix-media-url.ts [media-filename]
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

async function fixMediaUrl(filename?: string) {
  console.log("🔧 Starting media URL fix...\n");

  // Check if Blob token is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ Error: BLOB_READ_WRITE_TOKEN is not set!");
    console.error("   Get it from: Vercel Dashboard → Storage → Blob → Create Token");
    process.exit(1);
  }

  const payloadConfig = await loadConfig();
  const payload = await getPayload({ config: payloadConfig });

  try {
    // Find media records with problematic URLs
    const where: any = {
      or: [
        { url: { contains: "/api/media/file/" } },
        { url: { contains: "localhost:3000/api/media" } },
      ],
    };

    if (filename) {
      where.filename = { equals: filename };
    }

    const mediaResult = await payload.find({
      collection: "media",
      where,
      limit: 100,
    });

    console.log(`📋 Found ${mediaResult.docs.length} media records with problematic URLs\n`);

    if (mediaResult.docs.length === 0) {
      console.log("✅ No media records need fixing.");
      return;
    }

    let fixed = 0;
    let failed = 0;

    for (const media of mediaResult.docs) {
      const mediaFilename = media.filename || `media-${media.id}`;
      console.log(`\n📤 Processing: ${mediaFilename}`);

      // Check if local file exists
      const mediaDir = join(process.cwd(), "media");
      const filePath = join(mediaDir, mediaFilename);

      if (!existsSync(filePath)) {
        console.log(`   ⚠️  Local file not found: ${filePath}`);
        console.log(`   💡 Skipping - file may already be in Blob or deleted`);
        continue;
      }

      try {
        // Read local file
        const fileBuffer = await readFile(filePath);
        const mimeType = media.mimeType || "application/octet-stream";

        // Upload to Vercel Blob
        console.log(`   ⬆️  Uploading to Vercel Blob...`);
        const blobResult = await uploadToBlob(
          fileBuffer,
          mediaFilename,
          mimeType
        );

        // Update media record with Blob URL
        await payload.update({
          collection: "media",
          id: media.id,
          data: {
            url: blobResult.url,
          },
        });

        console.log(`   ✅ Fixed! New URL: ${blobResult.url}`);
        fixed++;
      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}`);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Fix Summary");
    console.log("=".repeat(50));
    console.log(`Total records found: ${mediaResult.docs.length}`);
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("=".repeat(50) + "\n");

    if (fixed > 0) {
      console.log("✅ Media URLs fixed! Images should now load correctly.");
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Get filename from command line args
const filename = process.argv[2];

fixMediaUrl(filename)
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
