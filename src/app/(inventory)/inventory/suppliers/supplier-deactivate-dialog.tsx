/** Confirm deactivate or reactivate; invalidates suppliers query on success. */
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { AppDialog } from "@/components/modals/app-dialog";
import { Button } from "@/components/ui/button";
import {
  selectSupplierStatusDialog,
  useInventoryUI,
} from "@/stores/inventory-ui";

import { setSupplierStatus } from "./actions";
import { suppliersQueryKey } from "./query-keys";

export function SupplierDeactivateDialog() {
  const queryClient = useQueryClient();
  const supplier = useInventoryUI(selectSupplierStatusDialog).supplier;
  const closeSupplierStatusDialog = useInventoryUI(
    (s) => s.closeSupplierStatusDialog,
  );

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = supplier !== null;
  const isActive = supplier?.is_active ?? true;

  async function handleConfirm() {
    if (!supplier) return;

    setIsPending(true);
    setError(null);

    const result = await setSupplierStatus(supplier.id, !isActive);

    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
    handleClose();
  }

  function handleClose() {
    if (isPending) return;
    setError(null);
    closeSupplierStatusDialog();
  }

  return (
    <AppDialog
      open={isOpen}
      onClose={handleClose}
      size="compact"
      header={
        <span className="flex items-center gap-2">
          <AlertTriangle
            className={
              isActive ? "size-5 text-destructive" : "size-5 text-accent"
            }
            aria-hidden
          />
          {isActive ? "Deactivate supplier" : "Reactivate supplier"}
        </span>
      }
      description={
        isActive ? (
          <>
            <span className="font-medium text-foreground">
              {supplier?.name}
            </span>{" "}
            will be hidden from new purchase orders. Existing records are kept.
          </>
        ) : (
          <>
            Restore{" "}
            <span className="font-medium text-foreground">
              {supplier?.name}
            </span>{" "}
            so they can be selected for purchase orders again.
          </>
        )
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isActive ? "destructive" : "wood"}
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Processing…" : isActive ? "Deactivate" : "Reactivate"}
          </Button>
        </>
      }
    >
      {error ? (
        <p role="alert" className="text-sm text-destructive pe-4">
          {error}
        </p>
      ) : null}
    </AppDialog>
  );
}
