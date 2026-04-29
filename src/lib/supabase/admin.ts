import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env, getServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role Supabase client.
 *
 * Bypasses Row Level Security. Use ONLY from trusted server contexts
 * (Route Handlers, Server Actions, background jobs) where you have already
 * authorized the caller. Never expose this client to the browser.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
