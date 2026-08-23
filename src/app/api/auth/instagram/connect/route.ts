import { NextRequest, NextResponse } from "next/server";

import { isAppStaff } from "@/lib/access";
import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
  INSTAGRAM_OAUTH_RETURN_COOKIE,
  INSTAGRAM_OAUTH_STATE_COOKIE,
  assertInstagramOAuthConfigured,
  buildInstagramAuthorizeUrl,
  createInstagramOAuthState,
  getInstagramRedirectUri,
} from "@/lib/instagram-oauth";
import { vendorIdFromUser } from "@/lib/vendor-social-connections";

function oauthCookieOptions() {
  return {
    httpOnly: true,
    secure: getInstagramRedirectUri().startsWith("https://"),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 20 * 60,
  };
}

/**
 * Vendor: /api/auth/instagram/connect
 * Staff (for a vendor): /api/auth/instagram/connect?vendorId=…&returnTo=staff
 */
export async function GET(req: NextRequest) {
  try {
    assertInstagramOAuthConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram OAuth is not configured" },
      { status: 500 },
    );
  }

  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedVendorId = req.nextUrl.searchParams.get("vendorId")?.trim() || "";
  const returnTo = req.nextUrl.searchParams.get("returnTo")?.trim() || "";
  const sessionVendorId = vendorIdFromUser(user);
  const staff = isAppStaff(user);

  let vendorId: string | null = null;
  let staffReturn = false;

  if (requestedVendorId && staff) {
    try {
      await payload.findByID({
        collection: "vendors",
        id: requestedVendorId,
        depth: 0,
        overrideAccess: true,
      });
    } catch {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
    vendorId = requestedVendorId;
    staffReturn = returnTo === "staff" || returnTo === "post-to-social";
  } else if (sessionVendorId) {
    vendorId = sessionVendorId;
  }

  if (!vendorId) {
    return NextResponse.json(
      { error: "Unauthorized — sign in as a vendor, or as staff with ?vendorId=" },
      { status: 401 },
    );
  }

  const state = createInstagramOAuthState(vendorId);
  const response = NextResponse.redirect(buildInstagramAuthorizeUrl(state));
  response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, state, oauthCookieOptions());
  if (staffReturn) {
    response.cookies.set(
      INSTAGRAM_OAUTH_RETURN_COOKIE,
      `/staff/post-to-social?vendorId=${encodeURIComponent(vendorId)}`,
      oauthCookieOptions(),
    );
  } else {
    response.cookies.set(INSTAGRAM_OAUTH_RETURN_COOKIE, "", {
      ...oauthCookieOptions(),
      maxAge: 0,
    });
  }
  return response;
}
