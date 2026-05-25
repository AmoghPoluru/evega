/**
 * Origins allowed for Payload JWT cookie auth (see payload extractJWT "cookie" strategy).
 * If the request Origin is not listed, the cookie token is ignored → 401 on /api/media.
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

  if (process.env.NODE_ENV === "development") {
    add("http://localhost:3000");
  }

  return [...origins];
}
