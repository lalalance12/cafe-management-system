"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInventoryUI } from "@/stores/inventory-ui";

import type { PORow } from "./types";

type PurchaseOrderActionsProps = {
  purchaseOrder: PORow;
  poLabel: string;
};

export function PurchaseOrderActions({
  purchaseOrder,
  poLabel,
}: PurchaseOrderActionsProps) {
  const openPODetail = useInventoryUI((s) => s.openPODetail);
  const openPOStatusDialog = useInventoryUI((s) => s.openPOStatusDialog);

  const canSubmit = purchaseOrder.status === "draft";
  const canReceive =
    purchaseOrder.status === "submitted" ||
    purchaseOrder.status === "partial";
  const canCancel =
    purchaseOrder.status === "draft" ||
    purchaseOrder.status === "submitted";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${poLabel}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => openPODetail(purchaseOrder.id)}
        >
          View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canSubmit}
          onClick={() => openPOStatusDialog(purchaseOrder.id, "submit")}
        >
          Submit order
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canReceive}
          onClick={() => openPOStatusDialog(purchaseOrder.id, "receive")}
        >
          Mark as received
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canCancel}
          className="text-destructive"
          onClick={() => openPOStatusDialog(purchaseOrder.id, "cancel")}
        >
          Cancel order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
