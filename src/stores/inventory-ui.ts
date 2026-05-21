import { create } from "zustand";

import type { SupplierRow } from "@/app/(inventory)/inventory/suppliers/types";

type SupplierFormState = {
  open: boolean;
  supplier: SupplierRow | null;
};

type SupplierStatusDialogState = {
  supplier: SupplierRow | null;
};

type POFormState = {
  open: boolean;
};

type PODetailState = {
  poId: string | null;
};

export type POStatusAction = "submit" | "receive" | "cancel";

type POStatusDialogState = {
  poId: string | null;
  action: POStatusAction | null;
};

type InventoryUIState = {
  supplierForm: SupplierFormState;
  supplierStatusDialog: SupplierStatusDialogState;
  poForm: POFormState;
  poDetail: PODetailState;
  poStatusDialog: POStatusDialogState;
};

type InventoryUIActions = {
  openSupplierForm: (supplier?: SupplierRow) => void;
  closeSupplierForm: () => void;
  openSupplierStatusDialog: (supplier: SupplierRow) => void;
  closeSupplierStatusDialog: () => void;
  openPOForm: () => void;
  closePOForm: () => void;
  openPODetail: (poId: string) => void;
  closePODetail: () => void;
  openPOStatusDialog: (poId: string, action: POStatusAction) => void;
  closePOStatusDialog: () => void;
  resetInventoryUI: () => void;
};

const initialState: InventoryUIState = {
  supplierForm: { open: false, supplier: null },
  supplierStatusDialog: { supplier: null },
  poForm: { open: false },
  poDetail: { poId: null },
  poStatusDialog: { poId: null, action: null },
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
    openPOForm: () => set({ poForm: { open: true } }),
    closePOForm: () => set({ poForm: { open: false } }),
    openPODetail: (poId) => set({ poDetail: { poId } }),
    closePODetail: () => set({ poDetail: { poId: null } }),
    openPOStatusDialog: (poId, action) =>
      set({ poStatusDialog: { poId, action } }),
    closePOStatusDialog: () =>
      set({ poStatusDialog: { poId: null, action: null } }),
    resetInventoryUI: () => set(initialState),
  }),
);

export const selectSupplierForm = (state: InventoryUIState) => state.supplierForm;
export const selectSupplierStatusDialog = (state: InventoryUIState) =>
  state.supplierStatusDialog;
export const selectPOForm = (state: InventoryUIState) => state.poForm;
export const selectPODetail = (state: InventoryUIState) => state.poDetail;
export const selectPOStatusDialog = (state: InventoryUIState) =>
  state.poStatusDialog;
