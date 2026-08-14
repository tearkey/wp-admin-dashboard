import { useCallback } from "react";
import { clearPersisted, usePersistentState } from "@/hooks/use-persistent-state";

export type Density = "default" | "compact";

/**
 * Per-table column visibility + row density, persisted in localStorage and
 * synced across tabs. `reset` also clears the screen's filters/search/scroll.
 */
export function useTablePrefs(tableId: string) {
  const [hidden, setHidden] = usePersistentState<string[]>(`${tableId}:columns`, []);
  const [density, setDensity] = usePersistentState<Density>(`${tableId}:density`, "default");

  const toggleColumn = useCallback(
    (id: string) =>
      setHidden((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])),
    [setHidden],
  );

  const reset = useCallback(() => {
    clearPersisted(`${tableId}:`);
    try {
      window.localStorage.removeItem(`wp-admin:scroll:${tableId}`);
    } catch {
      /* storage unavailable */
    }
    window.scrollTo({ top: 0 });
  }, [tableId]);

  return { hidden, toggleColumn, density, setDensity, reset };
}
