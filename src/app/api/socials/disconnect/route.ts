import { NextRequest, NextResponse } from "next/server";

import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
  deletePlatformConnection,
  vendorIdFromUser,
  type SocialPlatform,
} from "@/lib/vendor-social-connections";

export async function POST(req: NextRequest) {
  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  const vendorId = vendorIdFromUser(user);

  if (!user || !vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { platform?: string };
  const platform = body.platform;
  if (platform !== "instagram" && platform !== "facebook") {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  await deletePlatformConnection(payload, vendorId, platform as SocialPlatform);
  return NextResponse.json({ ok: true });
}
