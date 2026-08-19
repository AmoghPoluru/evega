/**
 * Origins allowed for Payload JWT cookie auth (see payload extractJWT "cookie" strategy).
 * If the request Origin is not listed, the cookie token is ignored → 401 on /api/media.
 *
 * Clients sending `Authorization: JWT <token>` (native mobile) are not subject
 * to this check. Extra origins may be added via `PAYLOAD_EXTRA_CORS_ORIGINS`.
 */
export function getPayloadCsrfOrigins(): string[] {
  const origins = new Set<string>();

  const add = (value?: string) => {
    if (!value?.trim()) return;
    try {
      origins.add(new URL(value.trim()).origin);
    } catch {
      // ignore invalid URLs
    }
  };

  add(process.env.NEXT_PUBLIC_APP_URL);
  add(process.env.NEXTAUTH_URL);

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/^\.+/, "");

  if (root && root !== "localhost") {
    add(`https://${root}`);
    add(`https://www.${root}`);
    add(`http://${root}`);
    add(`http://www.${root}`);
  }

  for (const value of process.env.PAYLOAD_EXTRA_CORS_ORIGINS?.split(",") ?? []) {
    if (value.trim() !== "*") add(value);
  }

  if (process.env.NODE_ENV === "development") {
    add("http://localhost:3000");
    add("https://localhost:3000");
    add("http://127.0.0.1:3000");
    add("https://127.0.0.1:3000");
    add("http://localhost:8081");
    add("http://localhost:19006");
  }

  return [...origins];
}
