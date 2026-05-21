import { z } from "zod";

export type SupplierRow = {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
};

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required"),
  contact_person: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Invalid email address",
    ).min(1, "Email address is required"),
  address: z.string().trim().min(1, "Address is required"),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export function toSupplierFormValues(
  supplier: SupplierRow | null,
): SupplierFormValues {
  return {
    name: supplier?.name ?? "",
    contact_person: supplier?.contact_person ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
  };
}

export function toSupplierPayload(values: SupplierFormValues) {
  return {
    name: values.name.trim(),
    contact_person: values.contact_person?.trim() || null,
    phone: values.phone?.trim(),
    email: values.email?.trim(),
    address: values.address?.trim(),
  };
}
