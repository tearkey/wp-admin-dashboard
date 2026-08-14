import { useCallback, useEffect, useState } from "react";

export const PREFIX = "techtrick:";

type Listener = (raw: string | null) => void;
const listeners = new Map<string, Set<Listener>>();

function subscribe(key: string, fn: Listener) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) listeners.delete(key);
  };
}

/** Notify every hook (this tab) bound to `key`. */
export function broadcast(key: string, raw: string | null) {
  listeners.get(key)?.forEach((fn) => fn(raw));
}

/** Remove every stored key starting with `techtrick:{prefix}` and sync listeners. */
export function clearPersisted(prefix: string) {
  try {
    const full = PREFIX + prefix;
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(full)) doomed.push(k);
    }
    doomed.forEach((k) => {
      window.localStorage.removeItem(k);
      broadcast(k.slice(PREFIX.length), null);
    });
  } catch {
    /* storage unavailable */
  }
}

// One window-level listener translates cross-tab writes into local broadcasts.
let wired = false;
function ensureStorageListener() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    broadcast(e.key.slice(PREFIX.length), e.newValue);
  });
}

/**
 * useState backed by localStorage, synced across hooks and browser tabs.
 * The stored value is read inside an effect so the server render and the first
 * client render agree (no hydration mismatch).
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    ensureStorageListener();
    const apply = (raw: string | null) => {
      if (raw === null) {
        setValue(initial);
        return;
      }
      try {
        setValue(JSON.parse(raw) as T);
      } catch {
        /* malformed */
      }
    };
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw !== null) apply(raw);
    } catch {
      /* storage unavailable */
    }
    return subscribe(key, apply);
    // `initial` is only used as the reset fallback; keep the effect keyed on `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        const raw = JSON.stringify(resolved);
        try {
          window.localStorage.setItem(PREFIX + key, raw);
        } catch {
          /* storage unavailable */
        }
        // Sync sibling hooks in this tab (storage events only fire elsewhere).
        queueMicrotask(() => broadcast(key, raw));
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
