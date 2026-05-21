/**
 * Add / edit supplier. react-hook-form + zod; invalidates suppliers query on success.
 */
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { AppDialog } from "@/components/modals/app-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { selectSupplierForm, useInventoryUI } from "@/stores/inventory-ui";

import { createSupplier, updateSupplier } from "./actions";
import { suppliersQueryKey } from "./query-keys";
import {
  supplierFormSchema,
  toSupplierFormValues,
  type SupplierFormValues,
} from "./types";

export function SupplierFormModal() {
  const queryClient = useQueryClient();
  const { open, supplier } = useInventoryUI(selectSupplierForm);
  const closeSupplierForm = useInventoryUI((s) => s.closeSupplierForm);

  const isEditing = supplier !== null;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: toSupplierFormValues(supplier),
  });

  async function onSubmit(values: SupplierFormValues) {
    setSubmitError(null);

    const result = isEditing
      ? await updateSupplier(supplier.id, values)
      : await createSupplier(values);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
    handleClose();
  }

  function handleClose() {
    setSubmitError(null);
    closeSupplierForm();
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      size="medium"
      header={isEditing ? "Edit supplier" : "Add supplier"}
      description={
        isEditing
          ? "Update vendor contact details and address."
          : "Register a new vendor for purchase orders and stock receipts."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={handleClose}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="supplier-form"
            variant="wood"
            className="rounded-sm"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add supplier"}
          </Button>
        </>
      }
    >
      <form
        id="supplier-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 pe-4"
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="supplier-name">Supplier name</FieldLabel>
                <Input
                  {...field}
                  id="supplier-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Arabica Beans Co."
                  className="rounded-sm"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="contact_person"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="supplier-contact">
                  Primary contact
                </FieldLabel>
                <Input
                  {...field}
                  id="supplier-contact"
                  aria-invalid={fieldState.invalid}
                  placeholder="Contact name"
                  className="rounded-sm"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="supplier-phone">Phone</FieldLabel>
                <Input
                  {...field}
                  id="supplier-phone"
                  type="tel"
                  aria-invalid={fieldState.invalid}
                  placeholder="+63 9XX XXX XXXX"
                  className="rounded-sm"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="supplier-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="supplier-email"
                  type="email"
                  inputMode="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="vendor@example.com"
                  className="rounded-sm"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="supplier-address">Address</FieldLabel>
                <Textarea
                  {...field}
                  id="supplier-address"
                  aria-invalid={fieldState.invalid}
                  placeholder="Business address"
                  className="rounded-sm"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}
      </form>
    </AppDialog>
  );
}
