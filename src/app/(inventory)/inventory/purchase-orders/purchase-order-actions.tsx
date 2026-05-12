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

type PurchaseOrderActionsProps = {
  purchaseOrderId: string;
  poLabel: string;
};

/**
 * Three-dot actions menu for a single purchase order row.
 *
 * Lives in its own client component so the page can stay a Server
 * Component.
 */
export function PurchaseOrderActions({
  purchaseOrderId,
  poLabel,
}: PurchaseOrderActionsProps) {
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
          onClick={() => console.log("View purchase order", purchaseOrderId)}
        >
          View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Mark as received</DropdownMenuItem>
        <DropdownMenuItem disabled className="text-destructive">
          Cancel order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
