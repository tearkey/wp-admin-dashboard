import { useCallback, useEffect, useState } from "react";

const PREFIX = "wp-admin:";

/**
 * useState backed by localStorage. The stored value is read inside an effect so
 * the server render and the first client render agree (no hydration mismatch).
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable or malformed */
    }
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(PREFIX + key, JSON.stringify(resolved));
        } catch {
          /* storage unavailable */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
