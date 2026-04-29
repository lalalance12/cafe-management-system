import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 proxy (formerly known as middleware).
 *
 * Runs before every matched request. Currently it only refreshes the
 * Supabase auth session so that Server Components downstream see a fresh
 * access token. Authorization decisions belong in route handlers, server
 * actions, or layouts — not here.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Match every path except:
   *   - Next.js internals (`_next/...`)
   *   - Common static asset extensions
   *   - The favicon
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
