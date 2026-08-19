import { NextRequest, NextResponse } from "next/server";

import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
  listPublicVendorSocialConnections,
  vendorIdFromUser,
} from "@/lib/vendor-social-connections";

export async function GET(req: NextRequest) {
  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  const vendorId = vendorIdFromUser(user);

  if (!user || !vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await listPublicVendorSocialConnections(payload, vendorId);
  return NextResponse.json(connections);
}
