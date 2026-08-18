import { useCallback } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { DEFAULT_THEME, type ThemeConfig } from "@/lib/cms/theme";

/**
 * Theme config store. Persisted in localStorage (cross-tab synced) so the
 * customizer and the public site stay in sync; swap for API calls when the
 * hosted backend lands.
 */
export function useThemeConfig() {
  const [theme, setTheme] = usePersistentState<ThemeConfig>("theme:config", DEFAULT_THEME);

  const update = useCallback(
    (patch: (prev: ThemeConfig) => ThemeConfig) => setTheme(patch),
    [setTheme],
  );

  const reset = useCallback(() => setTheme(DEFAULT_THEME), [setTheme]);

  return { theme, setTheme, update, reset };
}
