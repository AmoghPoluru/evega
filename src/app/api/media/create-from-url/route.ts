import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";

/**
 * POST /api/media/create-from-url
 *
 * Create a Payload `media` document from an existing Blob URL.
 * This is part of the direct-to-Vercel-Blob architecture:
 * 1) Browser uploads file directly to Vercel Blob.
 * 2) Frontend calls this endpoint with { url, filename, mimeType, filesize, alt }.
 * 3) We create a `media` record that the rest of the app can use.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headersList = await headers();
    const session = await payload.auth({ headers: headersList });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { url, filename, mimeType, filesize, alt } = body as {
      url?: string;
      filename?: string;
      mimeType?: string;
      filesize?: number;
      alt?: string;
    };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'url' field" },
        { status: 400 }
      );
    }

    // Basic sanity check: ensure this looks like a Vercel Blob URL
    if (!url.includes("blob.vercel-storage.com")) {
      console.warn(
        "[media/create-from-url] Non-Blob URL received, continuing but this is unexpected:",
        url,
      );
    }

    const safeFilename =
      typeof filename === "string" && filename.trim().length > 0
        ? filename
        : url.split("/").pop() || "uploaded-file";

    const mediaDocData: any = {
      alt: alt && typeof alt === "string" && alt.trim().length > 0 ? alt : safeFilename,
      filename: safeFilename,
      url,
    };

    if (mimeType && typeof mimeType === "string") {
      mediaDocData.mimeType = mimeType;
    }

    if (typeof filesize === "number" && filesize > 0) {
      mediaDocData.filesize = filesize;
    }

    const media = await payload.create({
      collection: "media",
      data: mediaDocData,
    });

    return NextResponse.json({ doc: media });
  } catch (error: any) {
    console.error("Media create-from-url error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create media from URL" },
      { status: 500 },
    );
  }
}

