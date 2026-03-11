#!/usr/bin/env tsx
/**
 * List Vercel Blob Files
 * 
 * Lists all files in your Vercel Blob storage
 * 
 * Usage:
 *   npm run list:blob
 */

// Load environment variables FIRST
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

import { list } from '@vercel/blob';

async function listBlobFiles() {
  console.log("📋 Listing files in Vercel Blob Storage...\n");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ Error: BLOB_READ_WRITE_TOKEN is not set!");
    process.exit(1);
  }

  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`Found ${blobs.length} file(s) in Blob Storage:\n`);

    if (blobs.length === 0) {
      console.log("⚠️  No files found. This could mean:");
      console.log("   1. The upload didn't complete");
      console.log("   2. You're using a different Blob store");
      console.log("   3. The token doesn't have read permissions");
      return;
    }

    blobs.forEach((blob, index) => {
      console.log(`${index + 1}. ${blob.pathname}`);
      console.log(`   URL: ${blob.url}`);
      console.log(`   Size: ${(blob.size / 1024).toFixed(2)} KB`);
      console.log(`   Uploaded: ${new Date(blob.uploadedAt).toLocaleString()}`);
      console.log("");
    });

    // Check for our specific file
    const targetFile = blobs.find(b => 
      b.pathname.includes('enhanced_dress_photo-5.jpg') || 
      b.url.includes('enhanced_dress_photo-5.jpg')
    );

    if (targetFile) {
      console.log("✅ Found enhanced_dress_photo-5.jpg!");
      console.log(`   Direct URL: ${targetFile.url}`);
    } else {
      console.log("⚠️  enhanced_dress_photo-5.jpg not found in list");
    }

  } catch (error: any) {
    console.error("❌ Error listing blobs:", error.message);
    if (error.message.includes('token')) {
      console.error("\n💡 Tip: Make sure your BLOB_READ_WRITE_TOKEN is correct");
      console.error("   Get it from: Vercel Dashboard → Storage → Blob → Tokens");
    }
    process.exit(1);
  }
}

listBlobFiles()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
