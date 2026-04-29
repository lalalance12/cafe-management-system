import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase client bound to the current request's cookies.
 *
 * Safe to call from:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers
 *
 * Each call creates a fresh client tied to the current request because the
 * `cookies()` helper from `next/headers` is request-scoped.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored when there is a proxy (`src/proxy.ts`)
            // refreshing user sessions on every request.
          }
        },
      },
    },
  );
}
