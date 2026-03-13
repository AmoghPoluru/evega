import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { uploadToBlob, deleteFromBlob } from "@/lib/vercel-blob-storage";

// Handle DELETE requests - use Payload's delete method directly
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headersList = await headers();
    const session = await payload.auth({ headers: headersList });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the query string to get IDs
    const { searchParams } = new URL(req.url);
    
    // Payload sends where clause as nested query params: where[and][0][id][in][0]=id1&where[and][0][id][in][1]=id2
    // We need to extract all IDs from this structure
    let ids: string[] = [];
    
    // Method 1: Parse nested query params
    const whereKeys = Array.from(searchParams.keys()).filter(key => key.startsWith('where'));
    if (whereKeys.length > 0) {
      // Extract IDs from where[and][0][id][in][*] pattern
      whereKeys.forEach(key => {
        const match = key.match(/where\[and\]\[0\]\[id\]\[in\]\[(\d+)\]/);
        if (match) {
          const id = searchParams.get(key);
          if (id) {
            ids.push(id);
          }
        }
      });
    }
    
    // Method 2: Try direct id parameter
    if (ids.length === 0) {
      const idParam = searchParams.get("id");
      if (idParam) {
        ids = [idParam];
      }
    }

    // Method 3: Try to parse as JSON if where is a single param
    if (ids.length === 0) {
      const whereParam = searchParams.get("where");
      if (whereParam) {
        try {
          const where = JSON.parse(decodeURIComponent(whereParam));
          if (where.and && Array.isArray(where.and)) {
            const idIn = where.and.find((item: any) => item.id?.in);
            if (idIn?.id?.in) {
              ids = Array.isArray(idIn.id.in) ? idIn.id.in : [idIn.id.in];
            }
          }
        } catch (e) {
          // Not JSON, that's okay
        }
      }
    }

    if (ids.length === 0) {
      console.error("No IDs found in DELETE request. Query params:", Array.from(searchParams.entries()));
      return NextResponse.json({ error: "No IDs found in request" }, { status: 400 });
    }

    // Delete each media item (Payload's delete respects access control)
    const deleted: string[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        // First, fetch the media record to get the Blob URL
        const media = await payload.findByID({
          collection: "media",
          id,
        });

        // Delete from Vercel Blob if URL exists and is a Blob URL
        if (media.url && typeof media.url === "string" && media.url.includes("blob.vercel-storage.com")) {
          try {
            await deleteFromBlob(media.url);
            console.log(`🗑️  Deleted from Vercel Blob: ${media.url}`);
          } catch (blobError: any) {
            // Log but don't fail - file might already be deleted or not exist
            console.warn(`⚠️  Could not delete from Blob (continuing anyway): ${blobError.message}`);
          }
        }

        // Delete from database (this also deletes local file if exists)
        await payload.delete({
          collection: "media",
          id,
        });
        deleted.push(id);
        console.log(`✅ Deleted media record: ${id}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete media ${id}:`, error.message);
        errors.push({ id, error: error.message || "Delete failed" });
      }
    }

    if (errors.length > 0 && deleted.length === 0) {
      return NextResponse.json(
        { 
          errors,
          message: "Failed to delete media items",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `Deleted ${deleted.length} media item(s)`,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headersList = await headers();
    const session = await payload.auth({ headers: headersList });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob Storage if token is available
    let blobUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobResult = await uploadToBlob(
          buffer,
          file.name,
          file.type
        );
        blobUrl = blobResult.url;
        console.log(`✅ Uploaded to Vercel Blob: ${blobUrl}`);
      } catch (error: any) {
        console.error("Vercel Blob upload error:", error);
        // In production, if Blob upload fails, we should still try to save locally
        // Don't throw - allow fallback to local storage
        console.warn("⚠️  Blob upload failed, falling back to local storage:", error.message);
        // Continue with local storage as fallback
      }
    }

    // Create media document with BOTH Blob URL and local file storage
    // This ensures we have a backup in local storage while using Blob for serving
    let media;
    if (blobUrl) {
      // Upload to both: Blob (for serving) and local (for backup)
      // First create with local file (Payload will save it locally)
      media = await payload.create({
        collection: "media",
        data: {
          alt: file.name,
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      });
      
      // Then update with the Blob URL (this becomes the primary URL for serving)
      // The local file is still stored as backup
      // IMPORTANT: We need to use the raw update to ensure URL is set correctly
      const updatedMedia = await payload.update({
        collection: "media",
        id: media.id,
        data: {
          url: blobUrl, // Blob URL takes precedence for serving
          // Local file path is automatically stored by Payload
        },
      });
      
      // Verify the URL was set correctly
      if (updatedMedia.url !== blobUrl) {
        console.warn(`⚠️  URL mismatch! Expected: ${blobUrl}, Got: ${updatedMedia.url}`);
        // Try direct database update as fallback
        const db = (payload as any).db;
        if (db) {
          await db.collections.media.updateOne(
            { _id: media.id },
            { $set: { url: blobUrl } }
          );
          console.log(`✅ Force-updated URL in database`);
        }
      }
      
      media = updatedMedia;
      console.log(`✅ Saved locally as backup: ${media.filename || file.name}`);
      console.log(`✅ Media URL set to: ${media.url}`);
    } else {
      // Fallback: Use Payload's default file upload (local storage only)
      media = await payload.create({
        collection: "media",
        data: {
          alt: file.name,
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      });
      console.log(`✅ Saved locally only (no Blob token): ${media.filename || file.name}`);
    }

    return NextResponse.json({ doc: media });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}
