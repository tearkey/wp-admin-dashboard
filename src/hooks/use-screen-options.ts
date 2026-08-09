import { useCallback, useEffect, useState } from "react";

export const DASHBOARD_WIDGETS = [
  { id: "at-a-glance", label: "At a Glance" },
  { id: "activity", label: "Activity" },
  { id: "quick-draft", label: "Quick Draft" },
  { id: "events-news", label: "WordPress Events and News" },
  { id: "site-health", label: "Site Health Status" },
] as const;

export type WidgetId = (typeof DASHBOARD_WIDGETS)[number]["id"];

export interface ScreenOptionsState {
  hidden: WidgetId[];
  columns: 1 | 2;
}

const STORAGE_KEY = "wp-admin:screen-options";
const DEFAULT_STATE: ScreenOptionsState = { hidden: [], columns: 2 };

/**
 * Screen Options persistence. Storage is read inside an effect so the server
 * render and the first client render agree (no hydration mismatch).
 */
export function useScreenOptions() {
  const [state, setState] = useState<ScreenOptionsState>(DEFAULT_STATE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ScreenOptionsState>;
      setState({
        hidden: Array.isArray(parsed.hidden) ? (parsed.hidden as WidgetId[]) : [],
        columns: parsed.columns === 1 ? 1 : 2,
      });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = useCallback((next: ScreenOptionsState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleWidget = useCallback(
    (id: WidgetId) => {
      persist({
        ...state,
        hidden: state.hidden.includes(id)
          ? state.hidden.filter((w) => w !== id)
          : [...state.hidden, id],
      });
    },
    [persist, state],
  );

  const setColumns = useCallback(
    (columns: 1 | 2) => persist({ ...state, columns }),
    [persist, state],
  );

  const isVisible = useCallback((id: WidgetId) => !state.hidden.includes(id), [state.hidden]);

  return { ...state, toggleWidget, setColumns, isVisible };
}
