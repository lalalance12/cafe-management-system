/** Per-row dropdown; opens modals via Zustand (no prop drilling from the table). */
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

import type { SupplierRow } from "./types";

type SupplierActionsProps = {
  supplier: SupplierRow;
};

export function SupplierActions({ supplier }: SupplierActionsProps) {
  const openSupplierForm = useInventoryUI((s) => s.openSupplierForm);
  const openSupplierStatusDialog = useInventoryUI(
    (s) => s.openSupplierStatusDialog,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${supplier.name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled>View details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openSupplierForm(supplier)}>
          Edit supplier
        </DropdownMenuItem>
        <DropdownMenuItem
          className={supplier.is_active ? "text-destructive" : undefined}
          onClick={() => openSupplierStatusDialog(supplier)}
        >
          {supplier.is_active ? "Deactivate" : "Reactivate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
