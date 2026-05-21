/** Maps a branch_staff.role enum value to that role's root route. */
export const ROLE_ROUTES: Record<string, string> = {
  pos: "/pos",
  inventory: "/inventory",
  branch_manager: "/branch",
  admin: "/admin",
};

/**
 * Returns the destination route for a given role string.
 * Falls back to `fallback` (default `"/"`) when the role is unknown or absent.
 */
export function roleRoute(role: string | null | undefined, fallback = "/"): string {
  return (role && ROLE_ROUTES[role]) ? ROLE_ROUTES[role] : fallback;
}
