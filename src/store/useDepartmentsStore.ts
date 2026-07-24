"use client";

import { create } from "zustand";

interface DepartmentsState {
  open: boolean;
  openDepartments: () => void;
  closeDepartments: () => void;
  toggleDepartments: () => void;
  setOpen: (open: boolean) => void;
}

export const useDepartmentsStore = create<DepartmentsState>((set) => ({
  open: false,
  openDepartments: () => set({ open: true }),
  closeDepartments: () => set({ open: false }),
  toggleDepartments: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
}));
