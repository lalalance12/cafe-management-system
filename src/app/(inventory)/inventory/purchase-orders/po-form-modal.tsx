"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

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
import { cn } from "@/lib/utils";
import { selectPOForm, useInventoryUI } from "@/stores/inventory-ui";

import { getSuppliers } from "../suppliers/actions";
import { suppliersQueryKey } from "../suppliers/query-keys";
import { formatPhpAmount } from "../helpers";
import {
  createPurchaseOrder,
  getBranchInventoryItems,
  submitPurchaseOrder,
} from "./actions";
import { purchaseOrdersQueryKey } from "./query-keys";
import {
  computeLineTotal,
  computePOTotal,
  emptyPOFormValues,
  poFormSchema,
  type BranchInventoryItemRow,
  type POFormValues,
} from "./types";

type ItemPickerTab = "low_stock" | "all";

export function POFormModal() {
  const queryClient = useQueryClient();
  const { open } = useInventoryUI(selectPOForm);
  const closePOForm = useInventoryUI((s) => s.closePOForm);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [itemTab, setItemTab] = useState<ItemPickerTab>("low_stock");

  const form = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: emptyPOFormValues(),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const supplierId = form.watch("supplier_id");
  const watchedItems = form.watch("items");

  const { data: suppliers = [] } = useQuery({
    queryKey: suppliersQueryKey,
    queryFn: async () => {
      const result = await getSuppliers();
      if (result.error) throw new Error(result.error);
      return result.data.filter((s) => s.is_active);
    },
    enabled: open,
  });

  const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["branch-inventory-items"],
    queryFn: async () => {
      const result = await getBranchInventoryItems();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: open && Boolean(supplierId),
  });

  const supplierLocked = Boolean(supplierId);

  const addedItemIds = useMemo(
    () => new Set(watchedItems.map((item) => item.inventory_item_id)),
    [watchedItems],
  );

  const filteredPickerItems = useMemo(() => {
    const available = inventoryItems.filter(
      (item) => !addedItemIds.has(item.inventory_item_id),
    );
    if (itemTab === "low_stock") {
      return available.filter(
        (item) => item.on_hand <= item.low_stock_threshold,
      );
    }
    return available;
  }, [inventoryItems, addedItemIds, itemTab]);

  const lineItemsWithMeta = useMemo(() => {
    const byId = new Map(
      inventoryItems.map((item) => [item.inventory_item_id, item]),
    );
    return fields.map((field, index) => ({
      field,
      index,
      meta: byId.get(field.inventory_item_id),
    }));
  }, [fields, inventoryItems]);

  const runningTotal = computePOTotal(watchedItems);

  function handleAddItem(item: BranchInventoryItemRow) {
    append({
      inventory_item_id: item.inventory_item_id,
      quantity_ordered: 1,
      unit_cost: 0,
    });
  }

  async function persistPO(submitAfterCreate: boolean) {
    setSubmitError(null);
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    const createResult = await createPurchaseOrder(values);
    if (createResult.error || !createResult.id) {
      setSubmitError(createResult.error ?? "Failed to create purchase order.");
      return;
    }

    if (submitAfterCreate) {
      const submitResult = await submitPurchaseOrder(createResult.id);
      if (submitResult.error) {
        setSubmitError(submitResult.error);
        return;
      }
    }

    await queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKey });
    handleClose();
  }

  function handleClose() {
    setSubmitError(null);
    closePOForm();
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      size="xlarge"
      header="New purchase order"
      description="Pick one supplier, add line items from your branch stock list, then save as draft or submit to the supplier."
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
            type="button"
            variant="outline"
            className="rounded-sm"
            disabled={form.formState.isSubmitting}
            onClick={() => persistPO(false)}
          >
            {form.formState.isSubmitting ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="wood"
            className="rounded-sm"
            disabled={form.formState.isSubmitting}
            onClick={() => persistPO(true)}
          >
            {form.formState.isSubmitting ? "Submitting…" : "Submit order"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 pe-4">
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.supplier_id}>
            <FieldLabel htmlFor="po-supplier">Supplier</FieldLabel>
            <select
              id="po-supplier"
              className={cn(
                "border-input bg-background text-foreground flex h-9 w-full rounded-sm border px-3 text-sm shadow-xs",
                supplierLocked && "cursor-not-allowed opacity-70",
              )}
              value={supplierId}
              disabled={supplierLocked}
              onChange={(e) => {
                form.setValue("supplier_id", e.target.value, {
                  shouldValidate: true,
                });
              }}
            >
              <option value="">Select a supplier…</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {supplierLocked ? (
              <p className="text-foreground-muted text-xs">
                Supplier is locked for this order. Start a new PO to change
                vendor.
              </p>
            ) : null}
            {form.formState.errors.supplier_id && (
              <FieldError errors={[form.formState.errors.supplier_id]} />
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="po-notes">Notes</FieldLabel>
            <Textarea
              id="po-notes"
              className="rounded-sm"
              placeholder="Internal notes for this order"
              {...form.register("notes")}
            />
          </Field>
        </FieldGroup>

        {supplierId ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Add items</h3>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={itemTab === "low_stock" ? "wood" : "outline"}
                    className="rounded-sm"
                    onClick={() => setItemTab("low_stock")}
                  >
                    Low stock
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={itemTab === "all" ? "wood" : "outline"}
                    className="rounded-sm"
                    onClick={() => setItemTab("all")}
                  >
                    All items
                  </Button>
                </div>
              </div>

              {inventoryLoading ? (
                <p className="text-foreground-muted text-sm">Loading items…</p>
              ) : filteredPickerItems.length === 0 ? (
                <p className="text-foreground-muted text-sm">
                  No items available in this tab.
                </p>
              ) : (
                <ul className="flex max-h-64 flex-col gap-1 overflow-auto rounded-md border border-border p-2">
                  {filteredPickerItems.map((item) => (
                    <li key={item.inventory_item_id}>
                      <button
                        type="button"
                        className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm"
                        onClick={() => handleAddItem(item)}
                      >
                        <span>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-foreground-muted ms-2 text-xs">
                            {item.on_hand} {item.unit} on hand
                          </span>
                        </span>
                        <span className="text-accent text-xs">Add</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Line items</h3>
              {fields.length === 0 ? (
                <p className="text-foreground-muted text-sm">
                  Add at least one item to continue.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {lineItemsWithMeta.map(({ field, index, meta }) => (
                    <li
                      key={field.id}
                      className="rounded-md border border-border p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {meta?.name ?? "Item"}
                          </p>
                          {meta ? (
                            <p className="text-foreground-muted text-xs">
                              Unit: {meta.unit} · On hand: {meta.on_hand}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove line item"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field>
                          <FieldLabel htmlFor={`qty-${field.id}`}>
                            Quantity
                          </FieldLabel>
                          <Input
                            id={`qty-${field.id}`}
                            type="number"
                            min={0}
                            step="any"
                            className="rounded-sm"
                            value={watchedItems[index]?.quantity_ordered ?? ""}
                            onChange={(e) => {
                              update(index, {
                                ...watchedItems[index],
                                quantity_ordered: Number(e.target.value),
                              });
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`cost-${field.id}`}>
                            Unit cost (PHP)
                          </FieldLabel>
                          <Input
                            id={`cost-${field.id}`}
                            type="number"
                            min={0}
                            step="0.01"
                            className="rounded-sm"
                            value={watchedItems[index]?.unit_cost ?? ""}
                            onChange={(e) => {
                              update(index, {
                                ...watchedItems[index],
                                unit_cost: Number(e.target.value),
                              });
                            }}
                          />
                        </Field>
                      </div>
                      <p className="text-foreground-muted mt-2 text-xs">
                        Line total:{" "}
                        {formatPhpAmount(
                          computeLineTotal(
                            Number(watchedItems[index]?.quantity_ordered ?? 0),
                            Number(watchedItems[index]?.unit_cost ?? 0),
                          ),
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {form.formState.errors.items && (
                <FieldError errors={[form.formState.errors.items]} />
              )}
            </section>
          </div>
        ) : (
          <p className="text-foreground-muted text-sm">
            Select a supplier to browse branch inventory items.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-medium">Order total</span>
          <span className="text-lg font-semibold">
            {formatPhpAmount(runningTotal)}
          </span>
        </div>

        {submitError ? (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        ) : null}
      </div>
    </AppDialog>
  );
}
