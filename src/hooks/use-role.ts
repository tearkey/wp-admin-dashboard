import { usePersistentState } from "@/hooks/use-persistent-state";

export type Role = "superadmin" | "editor";

/**
 * Current admin role. Front-end gate only — when the hosted API lands, the
 * same checks must be enforced server-side before any destructive action.
 */
export function useRole() {
  const [role, setRole] = usePersistentState<Role>("role", "superadmin");
  return { role, setRole, isSuperadmin: role === "superadmin" };
}
