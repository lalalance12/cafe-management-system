import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { roleRoute } from "@/lib/role-routes";

/**
 * Root route: acts as a smart entry-point.
 *
 * - Authenticated   → redirect to the user's role route
 * - Unauthenticated → redirect to /login
 */
export default async function Home() {
  const supabase = await createClient();
  const { data: jwt } = await supabase.auth.getClaims();

  if (!jwt) {
    redirect("/login");
  }

  const { data: rawStaff } = await supabase
    .from("branch_staff")
    .select("role")
    .eq("profile_id", jwt.claims.sub)
    .single();
  const staffRecord = rawStaff as { role: string } | null;

  redirect(roleRoute(staffRecord?.role, "/login"));
}
