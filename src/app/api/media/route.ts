import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";

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

    // Create media document
    const media = await payload.create({
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

    return NextResponse.json({ doc: media });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}
