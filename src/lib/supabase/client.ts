import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser-side Supabase client.
 *
 * Use inside Client Components, hooks, and event handlers. It reads the
 * session from cookies set by the proxy / server clients, so it stays in
 * sync across server and client boundaries.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
