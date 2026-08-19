/**
 * Origins allowed to call Payload/tRPC endpoints from a browser.
 *
 * Native mobile clients (Expo) send no `Origin` header and authenticate with
 * `Authorization: JWT <token>`, so they are unaffected by CORS/CSRF. These
 * origins exist for the web app and for Expo web / dev tooling, which do send
 * an `Origin`.
 *
 * Extra origins can be supplied via `PAYLOAD_EXTRA_CORS_ORIGINS`
 * (comma-separated). Setting it to `*` allows any origin.
 */
export function getPayloadCorsOrigins(): string[] | "*" {
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
  }

  const extra = process.env.PAYLOAD_EXTRA_CORS_ORIGINS?.trim();

  if (extra === "*") {
    return "*";
  }

  for (const value of extra?.split(",") ?? []) {
    add(value);
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
