"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, ExternalLink, PackageX, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStatus } from "@/app/(inventory)/inventory/helpers";

type AlertItem = {
  id: string;
  name: string;
  unit: string;
  on_hand: number;
  low_stock_threshold: number;
};

async function fetchAlertItems(): Promise<AlertItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("branch_inventory")
    .select("on_hand, inventory_items(id, name, unit, low_stock_threshold)");

  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<{
    on_hand: number | string;
    inventory_items: {
      id: string;
      name: string;
      unit: string;
      low_stock_threshold: number | string;
    };
  }>;

  return rows
    .map((r) => ({
      id: r.inventory_items.id,
      name: r.inventory_items.name,
      unit: r.inventory_items.unit,
      on_hand: Number(r.on_hand),
      low_stock_threshold: Number(r.inventory_items.low_stock_threshold),
    }))
    .filter((r) => r.on_hand <= r.low_stock_threshold)
    .sort((a, b) => a.on_hand - b.on_hand);
}

export function LowStockBell() {
  const { data: items = [] } = useQuery({
    queryKey: ["low-stock-alerts"],
    queryFn: fetchAlertItems,
    staleTime: 5 * 60 * 1000,
  });

  const count = items.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-sm"
          aria-label={
            count > 0
              ? `${count} low stock alert${count !== 1 ? "s" : ""}`
              : "No stock alerts"
          }
        >
          <Bell className="size-4" />
          {count > 0 && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Low stock alerts</h3>
          {count > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
              {count} item{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
            <Bell className="text-foreground-muted size-8 opacity-30" />
            <p className="text-foreground-muted text-sm">
              All items are sufficiently stocked.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-72">
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const status = getStatus(item);
                  const isOut = status === "out_of_stock";

                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      {isOut ? (
                        <PackageX className="mt-0.5 size-4 shrink-0 text-red-500" />
                      ) : (
                        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        {isOut ? (
                          <p className="text-xs font-medium text-red-600">
                            Out of stock
                          </p>
                        ) : (
                          <p className="text-foreground-muted text-xs">
                            {item.on_hand} {item.unit} on hand · threshold{" "}
                            {item.low_stock_threshold} {item.unit}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>

            {/* Footer CTA */}
            <div className="border-t border-border p-3">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full rounded-sm"
              >
                <Link href="/inventory/purchase-orders">
                  <ExternalLink className="size-3.5" />
                  Go to Purchase Orders
                </Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
