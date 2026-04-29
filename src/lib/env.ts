/**
 * Centralized access to environment variables.
 *
 * Touching `process.env` directly elsewhere is discouraged: import from here
 * so misconfiguration fails fast with a readable error at the point of use.
 *
 * Validation is lazy on purpose. Doing it at import-time would crash the
 * dev server (and `next build`) before the user has a chance to copy
 * `.env.example` to `.env.local`.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

/**
 * Browser-safe environment variables. Validated on access.
 */
export const env = new Proxy({} as PublicEnv, {
  get(_target, key: string) {
    switch (key) {
      case "NEXT_PUBLIC_SUPABASE_URL":
        return required(
          "NEXT_PUBLIC_SUPABASE_URL",
          process.env.NEXT_PUBLIC_SUPABASE_URL,
        );
      case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
        return required(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );
      default:
        throw new Error(`Unknown public env var requested: ${String(key)}`);
    }
  },
});

type ServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: string;
};

/**
 * Server-only secrets. Importing the result of this function from a client
 * component is a no-op at build time because the secret is only inlined
 * when the function is actually called from a server context.
 */
export function getServerEnv(): ServerEnv {
  return {
    SUPABASE_SERVICE_ROLE_KEY: required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}
