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

type SupplierActionsProps = {
  supplierId: string;
  supplierName: string;
};

/**
 * Three-dot actions menu for a single supplier row.
 *
 * Kept in its own client component so the parent page stays a Server
 * Component. Write operations (edit, deactivate) are placeholders for now
 */
export function SupplierActions({
  supplierId,
  supplierName,
}: SupplierActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${supplierName}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => console.log("View supplier", supplierId)}
        >
          View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Edit supplier</DropdownMenuItem>
        <DropdownMenuItem disabled className="text-destructive">
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
