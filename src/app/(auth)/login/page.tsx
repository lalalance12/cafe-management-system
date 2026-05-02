"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Maps the branch_staff.role enum value to the role's root route. */
const ROLE_ROUTES: Record<string, string> = {
  pos: "/pos",
  inventory: "/inventory",
  branch_manager: "/branch",
  admin: "/admin",
};

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit({ email, password }: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null);

    const supabase = createClient();

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !authData.user) {
      setAuthError(signInError?.message ?? "Sign in failed. Please try again.");
      setIsLoading(false);
      return;
    }

    // Look up the user's assigned role in branch_staff.
    // One employee = one branch, so .single() is safe for now.
    // Cast needed because Database types are still a placeholder (types.ts).
    const { data: rawStaff } = await supabase
      .from("branch_staff")
      .select("role")
      .eq("profile_id", authData.user.id)
      .single();
    const staffRecord = rawStaff as { role: string } | null;

    const destination = staffRecord?.role
      ? (ROLE_ROUTES[staffRecord.role] ?? "/")
      : "/";

    router.push(destination);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="grid h-full min-h-dvh w-full grid-cols-1 md:grid-cols-2">
        <div className="flex w-full flex-col items-center justify-center gap-6 p-8 sm:p-10 md:p-12">
          <div className="w-full max-w-md space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Cafe Management System
            </h1>
          </div>
          <form
            id="form-login"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col gap-8"
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="form-email"
                      type="email"
                      inputMode="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="rounded-sm"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="form-password"
                        type={isPasswordVisible ? "text" : "password"}
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                        className="pe-10 rounded-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-foreground-muted hover:text-foreground absolute inset-e-0.5 top-1/2 -translate-y-1/2"
                        onClick={() => setIsPasswordVisible((v) => !v)}
                        aria-label={
                          isPasswordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isPasswordVisible}
                      >
                        {isPasswordVisible ? (
                          <EyeOff aria-hidden />
                        ) : (
                          <Eye aria-hidden />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {authError && (
              <p role="alert" className="text-sm text-red-600">
                {authError}
              </p>
            )}
            <Button
              size="lg"
              className="w-full rounded-sm"
              variant="wood"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
        <div className="relative hidden min-h-0 md:block">
          <Image
            src="/images/brew_co_login_image.webp"
            alt="Café ambiance"
            fill
            className="object-cover"
            sizes="(max-width: 767px) 0vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}
