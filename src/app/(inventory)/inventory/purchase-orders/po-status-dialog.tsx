"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

import { AppDialog } from "@/components/modals/app-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  poActionErrorMessage,
  poCancelledMessage,
  poReceivedMessage,
  poSubmittedMessage,
} from "@/lib/purchase-order-feedback";
import { selectPOStatusDialog, useInventoryUI } from "@/stores/inventory-ui";

import {
  cancelPurchaseOrder,
  getPurchaseOrderDetail,
  receivePurchaseOrder,
  submitPurchaseOrder,
} from "./actions";
import {
  purchaseOrderDetailQueryKey,
  purchaseOrdersQueryKey,
} from "./query-keys";
import type { ReceivePOValues } from "./types";

export function POStatusDialog() {
  const queryClient = useQueryClient();
  const { poId, action } = useInventoryUI(selectPOStatusDialog);
  const closePOStatusDialog = useInventoryUI((s) => s.closePOStatusDialog);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, string>
  >({});

  const isOpen = poId !== null && action !== null;

  const { data: po } = useQuery({
    queryKey: poId ? purchaseOrderDetailQueryKey(poId) : ["purchase-orders", "none"],
    queryFn: async () => {
      if (!poId) return null;
      const result = await getPurchaseOrderDetail(poId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: isOpen,
  });

  function handleClose() {
    if (isPending) return;
    setError(null);
    setExpectedDeliveryDate("");
    setReceiveQuantities({});
    closePOStatusDialog();
  }

  async function handleConfirm() {
    if (!poId || !action) return;

    setIsPending(true);
    setError(null);

    let result: { error: string | null };

    if (action === "submit") {
      result = await submitPurchaseOrder(poId, {
        expected_delivery_date: expectedDeliveryDate || undefined,
      });
    } else if (action === "cancel") {
      result = await cancelPurchaseOrder(poId);
    } else if (!po) {
      result = { error: "Purchase order details are not loaded yet." };
    } else {
      const items: ReceivePOValues["items"] = po.purchase_order_items.map(
        (line) => ({
          id: line.id,
          quantity_received: Number(
            receiveQuantities[line.id] ?? line.quantity_ordered,
          ),
        }),
      );

      result = await receivePurchaseOrder(poId, { items });
    }

    setIsPending(false);

    if (result.error) {
      setError(result.error);
      toast.error(poActionErrorMessage(result.error));
      return;
    }

    if (action === "submit") {
      toast.success(poSubmittedMessage(Boolean(expectedDeliveryDate)));
    } else if (action === "receive") {
      toast.success(poReceivedMessage());
    } else if (action === "cancel") {
      toast.success(poCancelledMessage());
    }

    await queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKey });
    if (poId) {
      await queryClient.invalidateQueries({
        queryKey: purchaseOrderDetailQueryKey(poId),
      });
    }
    handleClose();
  }

  const dialogSize =
    action === "receive" ? ("medium" as const) : ("compact" as const);
  const dialogFitContent = action !== "receive";

  const header =
    action === "submit" ? (
      "Submit purchase order"
    ) : action === "receive" ? (
      "Mark as received"
    ) : (
      <span className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-destructive" aria-hidden />
        Cancel purchase order
      </span>
    );

  const description =
    action === "submit" ? (
      <>
        Send{" "}
        <span className="font-medium text-foreground">
          {po?.suppliers?.name ?? "this order"}
        </span>{" "}
        to the supplier. You can set an expected delivery date.
      </>
    ) : action === "receive" ? (
      "Enter the quantity received for each line item. Stock levels will update automatically."
    ) : (
      <>
        Void{" "}
        <span className="font-medium text-foreground">
          {po?.suppliers?.name ?? "this order"}
        </span>
        . This cannot be undone.
      </>
    );

  return (
    <AppDialog
      open={isOpen}
      onClose={handleClose}
      size={dialogSize}
      fitContent={dialogFitContent}
      header={header}
      description={description}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Back
          </Button>
          <Button
            type="button"
            variant={action === "cancel" ? "destructive" : "wood"}
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={isPending || (action === "receive" && !po)}
          >
            {isPending
              ? "Processing…"
              : action === "submit"
                ? "Submit"
                : action === "receive"
                  ? "Confirm receipt"
                  : "Cancel order"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pe-4">
        {action === "submit" ? (
          <Field>
            <FieldLabel htmlFor="po-expected-delivery">
              Expected delivery date
            </FieldLabel>
            <Input
              id="po-expected-delivery"
              type="date"
              className="rounded-sm"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </Field>
        ) : null}

        {action === "receive" && po ? (
          <ul className="flex flex-col gap-3">
            {po.purchase_order_items.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-end justify-between gap-2 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {line.inventory_items?.name ?? "Item"}
                  </p>
                  <p className="text-foreground-muted text-xs">
                    Ordered: {Number(line.quantity_ordered)}{" "}
                    {line.inventory_items?.unit ?? ""}
                  </p>
                </div>
                <Field className="w-28">
                  <FieldLabel htmlFor={`recv-${line.id}`}>Received</FieldLabel>
                  <Input
                    id={`recv-${line.id}`}
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-sm"
                    value={
                      receiveQuantities[line.id] ??
                      String(line.quantity_ordered)
                    }
                    onChange={(e) =>
                      setReceiveQuantities((prev) => ({
                        ...prev,
                        [line.id]: e.target.value,
                      }))
                    }
                  />
                </Field>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </AppDialog>
  );
}
