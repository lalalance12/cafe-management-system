"use client";

import Image from "next/image";
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

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have at least 8 characters"),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
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
                    <Input
                      {...field}
                      id="form-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <Button size="lg" className="w-full" variant="wood" type="submit">
              Login
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
