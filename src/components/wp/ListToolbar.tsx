import { cn } from "@/lib/utils";

/**
 * Sticky-on-mobile wrapper for a list-table's filters, search and bulk actions.
 * Sits just below the fixed 32px admin bar; static from `md` up like wp-admin.
 */
export function ListToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ top: "var(--wp-bar-h, 32px)" }}
      className={cn(
        "sticky z-20 -mx-3 mb-2 border-b border-wp-border bg-wp-body px-3 py-2 sm:-mx-5 sm:px-5",
        "md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Horizontally scrollable status-filter tabs (All | Published | Drafts …). */
export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly (readonly [T, string, number])[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ul className="-mx-1 flex items-center gap-x-1 overflow-x-auto px-1 text-[13px] md:flex-wrap md:overflow-visible">
      {tabs.map(([key, label, count], i) => (
        <li key={key} className="flex shrink-0 items-center gap-1">
          {i > 0 && <span className="text-wp-muted">|</span>}
          <button
            type="button"
            onClick={() => onChange(key)}
            aria-current={value === key ? "true" : undefined}
            className={cn(
              "flex min-h-11 items-center whitespace-nowrap hover:underline md:min-h-0",
              value === key ? "font-semibold text-wp-text" : "text-wp-blue",
            )}
          >
            {label} <span className="ml-1 text-wp-muted">({count})</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
