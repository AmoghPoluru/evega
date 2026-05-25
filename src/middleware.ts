import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Preserve the requested path for server-side auth redirects (e.g. sign-in → return to /vendor/products/new).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname + request.nextUrl.search;
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/vendor/:path*", "/staff/:path*"],
};
