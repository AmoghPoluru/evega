import { NextRequest, NextResponse } from "next/server";

import { isAppStaff } from "@/lib/access";
import { getCachedPayload } from "@/lib/payload-client";
import { getPayloadSessionFromRequest } from "@/lib/payload-auth-headers";
import {
  INSTAGRAM_OAUTH_RETURN_COOKIE,
  INSTAGRAM_OAUTH_STATE_COOKIE,
  completeInstagramLoginOAuth,
  parseAndVerifyInstagramOAuthState,
  verifyInstagramOAuthState,
} from "@/lib/instagram-oauth";
import {
  upsertInstagramConnection,
  vendorIdFromUser,
} from "@/lib/vendor-social-connections";

function vendorChannelsUrl(req: NextRequest, query: Record<string, string>) {
  const url = new URL("/vendor/connected-channels", req.nextUrl.origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function staffPostToSocialUrl(
  req: NextRequest,
  vendorId: string,
  query: Record<string, string>,
) {
  const url = new URL("/staff/post-to-social", req.nextUrl.origin);
  url.searchParams.set("vendorId", vendorId);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function clearOAuthCookies(req: NextRequest, response: NextResponse) {
  const base = {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, "", base);
  response.cookies.set(INSTAGRAM_OAUTH_RETURN_COOKIE, "", base);
  return response;
}

function redirectAfterOAuth(
  req: NextRequest,
  vendorId: string,
  query: Record<string, string>,
) {
  const returnPath = req.cookies.get(INSTAGRAM_OAUTH_RETURN_COOKIE)?.value || "";
  if (returnPath.startsWith("/staff/post-to-social")) {
    return NextResponse.redirect(staffPostToSocialUrl(req, vendorId, query));
  }
  return NextResponse.redirect(vendorChannelsUrl(req, query));
}

export async function GET(req: NextRequest) {
  const payload = await getCachedPayload();
  const { user } = await getPayloadSessionFromRequest(req, payload);
  const sessionVendorId = vendorIdFromUser(user);
  const staff = isAppStaff(user);

  const oauthError = req.nextUrl.searchParams.get("error");
  if (oauthError) {
    const description =
      req.nextUrl.searchParams.get("error_description") || oauthError;
    const stateVendor =
      parseAndVerifyInstagramOAuthState(
        req.nextUrl.searchParams.get("state") ||
          req.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value ||
          "",
      ) || sessionVendorId || "";
    return clearOAuthCookies(
      req,
      redirectAfterOAuth(req, stateVendor, { error: description }),
    );
  }

  if (!user || (!sessionVendorId && !staff)) {
    return clearOAuthCookies(
      req,
      NextResponse.redirect(
        vendorChannelsUrl(req, {
          error: "Sign in as a vendor or staff to connect Instagram",
        }),
      ),
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const saved = req.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value;
  const stateVendorId = state ? parseAndVerifyInstagramOAuthState(state) : null;
  const cookieOk = Boolean(state && saved && state === saved);

  // Staff may connect for any vendor in a valid state; vendors only for themselves.
  const allowedVendorId =
    stateVendorId &&
    (staff ||
      (sessionVendorId &&
        (verifyInstagramOAuthState(state!, sessionVendorId) ||
          stateVendorId === sessionVendorId)))
      ? stateVendorId
      : null;

  if (!code || !state || !allowedVendorId || (!stateVendorId && !cookieOk)) {
    return clearOAuthCookies(
      req,
      redirectAfterOAuth(req, sessionVendorId || "", { error: "invalid_state" }),
    );
  }

  try {
    const connected = await completeInstagramLoginOAuth(code);
    await upsertInstagramConnection(payload, {
      vendorId: allowedVendorId,
      igUserId: connected.igUserId,
      username: connected.username,
      accessToken: connected.accessToken,
      expiresInSeconds: connected.expiresIn,
    });
    return clearOAuthCookies(
      req,
      redirectAfterOAuth(req, allowedVendorId, { success: "instagram" }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Instagram connect failed";
    return clearOAuthCookies(
      req,
      redirectAfterOAuth(req, allowedVendorId, { error: message }),
    );
  }
}
