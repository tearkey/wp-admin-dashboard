import { useEffect } from "react";

const PREFIX = "techtrick:scroll:";

/**
 * Remembers the window scroll position for a screen and restores it on reload.
 * The restore is deferred to two frames so rows and the sticky toolbar have
 * been measured, and it clamps to the document height.
 */
export function useScrollRestore(key: string, ready = true) {
  useEffect(() => {
    if (!ready) return;
    const storageKey = PREFIX + key;

    // Take over from the browser so our value wins.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    let raf = 0;
    const restore = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          const raw = window.localStorage.getItem(storageKey);
          const y = raw ? Number(raw) : 0;
          if (y > 0) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: Math.min(y, Math.max(max, 0)), behavior: "instant" as never });
          }
        } catch {
          /* storage unavailable */
        }
      }),
    );

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try {
          window.localStorage.setItem(storageKey, String(Math.round(window.scrollY)));
        } catch {
          /* storage unavailable */
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(restore);
      window.removeEventListener("scroll", onScroll);
    };
  }, [key, ready]);
}
