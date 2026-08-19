import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { getPayloadCorsOrigins } from '@/lib/payload-cors-origins';

/**
 * Cross-origin headers for clients that are not the Next.js app itself
 * (Expo web, other first-party front-ends). Native mobile sends no `Origin`
 * and is unaffected.
 */
function corsHeaders(req: Request): Headers {
  const headers = new Headers();
  const origin = req.headers.get('origin');

  if (!origin) {
    return headers;
  }

  const allowed = getPayloadCorsOrigins();

  if (allowed !== '*' && !allowed.includes(origin)) {
    return headers;
  }

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type,x-trpc-source');
  headers.set('Vary', 'Origin');

  return headers;
}

export const maxDuration = 120;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    responseMeta: () => ({ headers: corsHeaders(req) }),
  });

const optionsHandler = (req: Request) =>
  new Response(null, { status: 204, headers: corsHeaders(req) });

export { handler as GET, handler as POST, optionsHandler as OPTIONS };
