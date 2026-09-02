import { useCallback, useMemo } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  DEFAULT_THEME,
  migrateTheme,
  type Device,
  type ThemeConfig,
  type Tiers,
} from "@/lib/cms/theme";

/**
 * Theme config store. Persisted in localStorage (cross-tab synced) so the
 * customizer and the public site stay in sync; swap for API calls when the
 * hosted backend lands. Older saved shapes are migrated on read.
 */
export function useThemeConfig() {
  const [stored, setTheme] = usePersistentState<ThemeConfig>("theme:config", DEFAULT_THEME);
  const theme = useMemo(() => migrateTheme(stored), [stored]);

  const update = useCallback(
    (patch: (prev: ThemeConfig) => ThemeConfig) => setTheme((prev) => patch(migrateTheme(prev))),
    [setTheme],
  );

  const reset = useCallback(() => setTheme(DEFAULT_THEME), [setTheme]);

  /** Write (or clear, when `value` is undefined) a per-device override. */
  const setTierValue = useCallback(
    <T extends object>(
      select: (t: ThemeConfig) => Tiers<T>,
      apply: (t: ThemeConfig, tiers: Tiers<T>) => ThemeConfig,
      device: Device,
      key: keyof T,
      value: T[keyof T] | undefined,
    ) => {
      update((prev) => {
        const tiers = select(prev);
        if (device === "desktop") {
          if (value === undefined) return prev;
          return apply(prev, { ...tiers, desktop: { ...tiers.desktop, [key]: value } });
        }
        const next = { ...tiers[device] } as Partial<T>;
        if (value === undefined) delete next[key];
        else next[key] = value;
        return apply(prev, { ...tiers, [device]: next });
      });
    },
    [update],
  );

  return { theme, setTheme, update, reset, setTierValue };
}
