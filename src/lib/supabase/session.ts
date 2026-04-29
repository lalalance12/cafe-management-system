import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Refresh the Supabase auth session for the incoming request.
 *
 * This must be called from `src/proxy.ts`. It both:
 *   1. Forwards request cookies into the Supabase client so it can read the
 *      session, and
 *   2. Writes any rotated cookies back onto the outgoing response so the
 *      browser stays signed in.
 *
 * IMPORTANT: do not run any logic between `createServerClient` and
 * `getClaims()` / `getUser()` — Supabase relies on this call to refresh
 * expired access tokens before downstream code runs.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getClaims` validates the JWT (locally when possible, otherwise via the
  // Auth server) and is preferred over `getSession()` for any read that may
  // influence routing or authorization.
  await supabase.auth.getClaims();

  return response;
}
