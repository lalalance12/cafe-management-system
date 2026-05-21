"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  supplierFormSchema,
  toSupplierPayload,
  type SupplierFormValues,
  type SupplierRow,
} from "./types";

const SUPPLIERS_PATH = "/inventory/suppliers";

type ActionResult = { error: string | null };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: "You must be signed in." };
  }

  return { supabase, user, error: null };
}

function parseFormValues(values: SupplierFormValues): ActionResult | ReturnType<typeof toSupplierPayload> {
  const parsed = supplierFormSchema.safeParse(values);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid supplier details.";
    return { error: message };
  }

  return toSupplierPayload(parsed.data);
}

export async function getSuppliers(): Promise<{
  error: string | null;
  data: SupplierRow[];
}> {
  const auth = await requireUser();
  if (auth.error) return { error: auth.error, data: [] };

  const { data, error } = await auth.supabase
    .from("suppliers")
    .select(
      "id, name, contact_person, phone, email, address, is_active",
    )
    .order("name");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: (data ?? []) as SupplierRow[] };
}

export async function createSupplier(
  values: SupplierFormValues,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error) return { error: auth.error };

  const payload = parseFormValues(values);
  if ("error" in payload) return payload;

  // Cast until Database types are regenerated (types.ts is still a placeholder).
  const { error } = await auth.supabase
    .from("suppliers")
    .insert(payload as never);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(SUPPLIERS_PATH);
  return { error: null };
}

export async function updateSupplier(
  id: string,
  values: SupplierFormValues,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error) return { error: auth.error };

  const payload = parseFormValues(values);
  if ("error" in payload) return payload;

  const { error } = await auth.supabase
    .from("suppliers")
    .update(payload as never)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(SUPPLIERS_PATH);
  return { error: null };
}

export async function setSupplierStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error) return { error: auth.error };

  const { error } = await auth.supabase
    .from("suppliers")
    .update({ is_active: isActive } as never)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(SUPPLIERS_PATH);
  return { error: null };
}
