export const purchaseOrdersQueryKey = ["purchase-orders"] as const;

export function purchaseOrderDetailQueryKey(id: string) {
  return ["purchase-orders", id] as const;
}
