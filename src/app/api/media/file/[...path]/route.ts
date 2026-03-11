import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Route handler to serve local media files
 * This is a fallback for when Blob URLs aren't available
 * 
 * Note: In production on Vercel, this won't work for serverless functions.
 * Use Blob storage URLs instead.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const filename = pathArray.join("/");
    
    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Security: Prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Try to get media record from database first
    const payload = await getPayload({ config });
    const mediaResult = await payload.find({
      collection: "media",
      where: {
        filename: {
          equals: decodeURIComponent(filename),
        },
      },
      limit: 1,
    });

    if (mediaResult.docs.length > 0) {
      const media = mediaResult.docs[0];
      
      // Priority 1: Use Blob URL if available
      if (
        media.url &&
        typeof media.url === "string" &&
        media.url.startsWith("http") &&
        // Only redirect if it's a REAL Blob/remote URL, not this same route
        !media.url.includes("/api/media/file/")
      ) {
        // Redirect to Blob URL (e.g. https://...blob.vercel-storage.com/...)
        return NextResponse.redirect(media.url);
      }
      
      // Priority 2: Serve local file if exists
      const mediaDir = join(process.cwd(), "media");
      const filePath = join(mediaDir, filename);
      
      if (existsSync(filePath)) {
        const fileBuffer = await readFile(filePath);
        const mimeType = media.mimeType || "application/octet-stream";
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Fallback: Try to serve from media directory directly
    const mediaDir = join(process.cwd(), "media");
    const filePath = join(mediaDir, filename);
    
    if (existsSync(filePath)) {
      const fileBuffer = await readFile(filePath);
      const ext = filename.split(".").pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
      };
      const mimeType = ext ? mimeTypes[ext] || "application/octet-stream" : "application/octet-stream";
      
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (error: any) {
    console.error("[Media File Route] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to serve file" },
      { status: 500 }
    );
  }
}
