import { useEffect, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { Density } from "@/hooks/use-table-prefs";
import { cn } from "@/lib/utils";

export interface ToggleableColumn {
  id: string;
  label: string;
}

const btn =
  "flex h-11 items-center gap-1.5 rounded border border-wp-border bg-wp-surface px-2.5 text-[13px] text-wp-text hover:border-wp-blue hover:text-wp-blue md:h-[30px]";

/** Columns dropdown, density toggle and "Reset filters and search" button. */
export function TableControls({
  columns,
  hidden,
  onToggleColumn,
  density,
  onDensityChange,
  onReset,
}: {
  columns: ToggleableColumn[];
  hidden: string[];
  onToggleColumn: (id: string) => void;
  density: Density;
  onDensityChange: (d: Density) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={wrap} className="relative">
        <button
          type="button"
          className={btn}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Columns
        </button>
        {open && (
          <div className="absolute left-0 z-30 mt-1 w-56 rounded border border-wp-border bg-wp-surface p-2 shadow-lg">
            <fieldset>
              <legend className="mb-1 px-1 text-[12px] font-semibold text-wp-muted">Columns</legend>
              {columns.map((c) => (
                <label
                  key={c.id}
                  className="flex min-h-11 items-center gap-2 px-1 text-[13px] md:min-h-0 md:py-1"
                >
                  <input
                    type="checkbox"
                    checked={!hidden.includes(c.id)}
                    onChange={() => onToggleColumn(c.id)}
                  />
                  {c.label}
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </div>

      <div
        role="group"
        aria-label="Row density"
        className="flex overflow-hidden rounded border border-wp-border"
      >
        {(["default", "compact"] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={density === d}
            onClick={() => onDensityChange(d)}
            className={cn(
              "h-11 px-2.5 text-[13px] capitalize md:h-[30px]",
              density === d
                ? "bg-wp-blue text-wp-menu-text"
                : "bg-wp-surface text-wp-text hover:text-wp-blue",
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <button type="button" className={btn} onClick={onReset}>
        <RotateCcw size={14} aria-hidden="true" />
        Reset filters and search
      </button>
    </div>
  );
}
