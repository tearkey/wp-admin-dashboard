import { useEffect } from "react";

/**
 * Keeps the CSS variable `--wp-bar-h` in sync with the real rendered height of
 * the fixed admin bar, so sticky toolbars never overlap it. Recalculates on
 * resize, orientation change and any size change of the bar itself.
 */
export function useAdminBarOffset() {
  useEffect(() => {
    const root = document.documentElement;
    const bar = document.querySelector<HTMLElement>("[data-wp-adminbar]");
    if (!bar) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      // Batch into a frame so scroll/resize stay smooth.
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--wp-bar-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
      });
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(bar);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      ro.disconnect();
    };
  }, []);
}
