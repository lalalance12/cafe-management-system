import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { roleRoute } from "@/lib/role-routes";
import { LoginForm } from "./login-form";

/**
 * Server Component guard: if the visitor already has a valid session, send
 * them straight to their role route so they never see the login form again.
 * Otherwise, render the client-side login form.
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const { data: jwt } = await supabase.auth.getClaims();

  if (jwt) {
    // Cast needed because Database types are still a placeholder (types.ts).
    const { data: rawStaff } = await supabase
      .from("branch_staff")
      .select("role")
      .eq("profile_id", jwt.claims.sub)
      .single();
    const staffRecord = rawStaff as { role: string } | null;

    redirect(roleRoute(staffRecord?.role));
  }

  return <LoginForm />;
}
