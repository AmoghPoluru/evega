import { NextRequest, NextResponse } from "next/server";

import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
  INSTAGRAM_OAUTH_STATE_COOKIE,
  completeInstagramLoginOAuth,
  verifyInstagramOAuthState,
} from "@/lib/instagram-oauth";
import {
  upsertInstagramConnection,
  vendorIdFromUser,
} from "@/lib/vendor-social-connections";

function channelsUrl(req: NextRequest, query: Record<string, string>) {
  const url = new URL("/vendor/connected-channels", req.nextUrl.origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function clearStateCookie(req: NextRequest, response: NextResponse) {
  response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: NextRequest) {
  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  const vendorId = vendorIdFromUser(user);

  const oauthError = req.nextUrl.searchParams.get("error");
  if (oauthError) {
    const description =
      req.nextUrl.searchParams.get("error_description") || oauthError;
    return clearStateCookie(
      req,
      NextResponse.redirect(channelsUrl(req, { error: description }))
    );
  }

  if (!user || !vendorId) {
    return NextResponse.redirect(
      channelsUrl(req, { error: "Sign in as a vendor to connect Instagram" })
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const saved = req.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value;
  const stateOk = Boolean(state && verifyInstagramOAuthState(state, vendorId));
  const cookieOk = Boolean(state && saved && state === saved);

  if (!code || !state || (!stateOk && !cookieOk)) {
    return clearStateCookie(
      req,
      NextResponse.redirect(channelsUrl(req, { error: "invalid_state" }))
    );
  }

  try {
    const connected = await completeInstagramLoginOAuth(code);
    await upsertInstagramConnection(payload, {
      vendorId,
      igUserId: connected.igUserId,
      username: connected.username,
      accessToken: connected.accessToken,
      expiresInSeconds: connected.expiresIn,
    });
    return clearStateCookie(
      req,
      NextResponse.redirect(channelsUrl(req, { success: "instagram" }))
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect Instagram";
    console.error("[instagram.callback]", message);
    return clearStateCookie(
      req,
      NextResponse.redirect(channelsUrl(req, { error: message }))
    );
  }
}
