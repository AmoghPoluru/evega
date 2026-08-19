import { NextRequest, NextResponse } from "next/server";

import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
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

export async function GET(req: NextRequest) {
  try {
    assertInstagramOAuthConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram OAuth is not configured" },
      { status: 500 }
    );
  }

  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  const vendorId = vendorIdFromUser(user);

  if (!user || !vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = createInstagramOAuthState(vendorId);
  const response = NextResponse.redirect(buildInstagramAuthorizeUrl(state));
  response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, state, oauthCookieOptions());
  return response;
}
