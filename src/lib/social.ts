/**
 * Meta (Facebook Page + Instagram) posting service.
 *
 * Mirrors the provider pattern in `src/lib/email.ts`: `META_GRAPH_API_VERSION`
 * is read on module load as a platform default, per-vendor credentials are
 * passed per call, and callers are expected to handle/log errors.
 *
 * Instagram publishing is a two-step flow (create media container, then
 * publish) and requires a publicly hosted image URL — pass the product media URL.
 */

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";

function graphUrl(pathname: string): string {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${pathname}`;
}

async function graphPost(
  pathname: string,
  params: Record<string, string | undefined>
): Promise<Record<string, unknown>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  }

  const res = await fetch(graphUrl(pathname), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: search.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
  } & Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      `Meta Graph API error (${res.status}): ${data?.error?.message || "unknown error"}`
    );
  }

  return data;
}

export interface PostToFacebookPageArgs {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageUrl?: string;
}

/**
 * Post to a Facebook Page feed. If `imageUrl` is provided, publishes a photo
 * post; otherwise a text status update. Returns the created post/photo id.
 */
export async function postToFacebookPage(
  args: PostToFacebookPageArgs
): Promise<{ id: string }> {
  if (!args.pageId || !args.pageAccessToken) {
    throw new Error("Facebook Page not configured (missing pageId or pageAccessToken).");
  }

  if (args.imageUrl) {
    const data = await graphPost(`${args.pageId}/photos`, {
      url: args.imageUrl,
      caption: args.message,
      access_token: args.pageAccessToken,
    });
    return { id: String((data.post_id as string) || (data.id as string)) };
  }

  const data = await graphPost(`${args.pageId}/feed`, {
    message: args.message,
    access_token: args.pageAccessToken,
  });
  return { id: String(data.id) };
}

export interface PostToInstagramArgs {
  igBusinessId: string;
  pageAccessToken: string;
  caption: string;
  imageUrl: string;
}

export interface PostToInstagramWithLoginTokenArgs {
  igUserId: string;
  instagramAccessToken: string;
  caption: string;
  imageUrl: string;
}

function instagramGraphUrl(pathname: string): string {
  return `https://graph.instagram.com/${GRAPH_API_VERSION}/${pathname}`;
}

async function instagramGraphPost(
  pathname: string,
  params: Record<string, string | undefined>
): Promise<Record<string, unknown>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  }

  const res = await fetch(instagramGraphUrl(pathname), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: search.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
  } & Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      `Instagram API error (${res.status}): ${data?.error?.message || "unknown error"}`
    );
  }

  return data;
}

/**
 * Publish via Instagram API with Instagram Login (IGAA… token).
 * Uses graph.instagram.com — no Facebook Page token required.
 */
export async function postToInstagramWithLoginToken(
  args: PostToInstagramWithLoginTokenArgs
): Promise<{ id: string }> {
  if (!args.igUserId || !args.instagramAccessToken) {
    throw new Error(
      "Instagram not configured (missing Instagram user ID or access token)."
    );
  }
  if (!args.imageUrl) {
    throw new Error("Instagram requires a publicly hosted image URL.");
  }

  const container = await instagramGraphPost(`${args.igUserId}/media`, {
    image_url: args.imageUrl,
    caption: args.caption,
    access_token: args.instagramAccessToken,
  });

  const creationId = container.id as string | undefined;
  if (!creationId) {
    throw new Error("Instagram media container creation returned no id.");
  }

  const published = await instagramGraphPost(`${args.igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: args.instagramAccessToken,
  });

  return { id: String(published.id) };
}

/**
 * Publish a single image to an Instagram Business account via Facebook Graph API
 * (EAA… Page token + linked IG Business ID).
 */
export async function postToInstagram(
  args: PostToInstagramArgs
): Promise<{ id: string }> {
  if (!args.igBusinessId || !args.pageAccessToken) {
    throw new Error(
      "Instagram not configured (missing instagramBusinessId or pageAccessToken)."
    );
  }
  if (!args.imageUrl) {
    throw new Error("Instagram requires a publicly hosted image URL.");
  }

  // Step 1: create a media container.
  const container = await graphPost(`${args.igBusinessId}/media`, {
    image_url: args.imageUrl,
    caption: args.caption,
    access_token: args.pageAccessToken,
  });

  const creationId = container.id as string | undefined;
  if (!creationId) {
    throw new Error("Instagram media container creation returned no id.");
  }

  // Step 2: publish the container.
  const published = await graphPost(`${args.igBusinessId}/media_publish`, {
    creation_id: creationId,
    access_token: args.pageAccessToken,
  });

  return { id: String(published.id) };
}
