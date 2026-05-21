import { create } from "zustand";

import type { SupplierRow } from "@/app/(inventory)/inventory/suppliers/types";

type SupplierFormState = {
  open: boolean;
  supplier: SupplierRow | null;
};

type SupplierStatusDialogState = {
  supplier: SupplierRow | null;
};

type InventoryUIState = {
  supplierForm: SupplierFormState;
  supplierStatusDialog: SupplierStatusDialogState;
};

type InventoryUIActions = {
  openSupplierForm: (supplier?: SupplierRow) => void;
  closeSupplierForm: () => void;
  openSupplierStatusDialog: (supplier: SupplierRow) => void;
  closeSupplierStatusDialog: () => void;
  resetInventoryUI: () => void;
};

const initialState: InventoryUIState = {
  supplierForm: { open: false, supplier: null },
  supplierStatusDialog: { supplier: null },
};

export const useInventoryUI = create<InventoryUIState & InventoryUIActions>(
  (set) => ({
    ...initialState,
    openSupplierForm: (supplier) =>
      set({
        supplierForm: { open: true, supplier: supplier ?? null },
      }),
    closeSupplierForm: () =>
      set({ supplierForm: { open: false, supplier: null } }),
    openSupplierStatusDialog: (supplier) =>
      set({ supplierStatusDialog: { supplier } }),
    closeSupplierStatusDialog: () =>
      set({ supplierStatusDialog: { supplier: null } }),
    resetInventoryUI: () => set(initialState),
  }),
);

export const selectSupplierForm = (state: InventoryUIState) => state.supplierForm;
export const selectSupplierStatusDialog = (state: InventoryUIState) =>
  state.supplierStatusDialog;
