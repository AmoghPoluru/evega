import type { NextRequest } from "next/server";

/**
 * Use the incoming request's headers for Payload auth in Route Handlers.
 * Prefer this over `headers()` from `next/headers` so Cookie is reliably present
 * (fixes 401 on /api/media uploads in some deployments/browsers).
 */
export function getPayloadAuthHeaders(req: NextRequest): Headers {
  return req.headers;
}
