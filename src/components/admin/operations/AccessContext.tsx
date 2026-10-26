"use client";
import { createContext, useContext } from "react";
import type { AccessSession } from "@/src/lib/operations-api";
export const AdminAccessContext = createContext<AccessSession | null>(null);
export function useAdminAccess() {
  const access = useContext(AdminAccessContext);
  return access ?? { user_id: "", enabled: false, groups: [], permissions: [] };
}
