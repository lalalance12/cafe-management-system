"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Printer } from "lucide-react";

import { AppDialog } from "@/components/modals/app-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectPODetail, useInventoryUI } from "@/stores/inventory-ui";

import {
  formatPhpAmount,
  PURCHASE_ORDER_STATUS_CLASSES,
  PURCHASE_ORDER_STATUS_LABEL,
  purchaseOrderLabel,
  resolvePurchaseOrderStatus,
} from "../helpers";
import { getPurchaseOrderDetail } from "./actions";
import { purchaseOrderDetailQueryKey } from "./query-keys";

export function PODetailDialog() {
  const printRef = useRef<HTMLDivElement>(null);
  const { poId } = useInventoryUI(selectPODetail);
  const closePODetail = useInventoryUI((s) => s.closePODetail);

  const isOpen = poId !== null;

  const { data: po, isLoading, error } = useQuery({
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
    closePODetail();
  }

  function handlePrint() {
    window.print();
  }

  const status = po ? resolvePurchaseOrderStatus(po) : null;

  return (
    <AppDialog
      open={isOpen}
      onClose={handleClose}
      size="large"
      header={
        po ? `Purchase order ${purchaseOrderLabel(po.id)}` : "Purchase order"
      }
      description={
        po?.suppliers?.name
          ? `Supplier: ${po.suppliers.name}`
          : "Loading order details…"
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm print:hidden"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="wood"
            className="rounded-sm print:hidden"
            onClick={handlePrint}
            disabled={!po}
          >
            <Printer />
            Print receipt
          </Button>
        </>
      }
      bodyClassName="print:p-0"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .po-print-area, .po-print-area * { visibility: visible; }
          .po-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div ref={printRef} className="po-print-area flex flex-col gap-4 pe-4">
        {isLoading ? (
          <p className="text-foreground-muted text-sm">Loading…</p>
        ) : error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : po ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {status ? (
                <Badge
                  variant="outline"
                  className={PURCHASE_ORDER_STATUS_CLASSES[status]}
                >
                  {PURCHASE_ORDER_STATUS_LABEL[status]}
                </Badge>
              ) : null}
              <span className="text-foreground-muted text-sm">
                Ordered {dayjs(po.created_at).format("MMM D, YYYY")}
              </span>
              <span className="text-foreground-muted text-sm">
                Expected{" "}
                {po.expected_delivery_date
                  ? dayjs(po.expected_delivery_date).format("MMM D, YYYY")
                  : "—"}
              </span>
            </div>

            {po.notes ? (
              <p className="text-sm">
                <span className="font-medium">Notes:</span> {po.notes}
              </p>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty ordered</TableHead>
                  <TableHead>Unit cost</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.purchase_order_items.map((line) => {
                  const qty = Number(line.quantity_ordered);
                  const cost = Number(line.unit_cost);
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">
                        {line.inventory_items?.name ?? "—"}
                        {line.inventory_items?.unit ? (
                          <span className="text-foreground-muted ms-1 text-xs">
                            ({line.inventory_items.unit})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{qty}</TableCell>
                      <TableCell>{formatPhpAmount(cost)}</TableCell>
                      <TableCell>
                        {line.quantity_received != null
                          ? Number(line.quantity_received)
                          : "—"}
                      </TableCell>
                      <TableCell>{formatPhpAmount(qty * cost)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end border-t border-border pt-3">
              <div className="text-end">
                <p className="text-foreground-muted text-xs">Order total</p>
                <p className="text-lg font-semibold">
                  {formatPhpAmount(Number(po.total_amount ?? 0))}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-foreground-muted text-sm">Purchase order not found.</p>
        )}
      </div>
    </AppDialog>
  );
}
