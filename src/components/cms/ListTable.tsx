import { ListToolbar } from "@/components/cms/ListToolbar";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  label: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface ListTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  bulkActions?: string[];
  emptyLabel?: string;
  /** Filters/search rendered above the bulk-action row, inside the sticky bar. */
  toolbar?: React.ReactNode;
  /** Column ids hidden by the user's persisted preferences. */
  hiddenColumnIds?: string[];
  /** Row padding/typography density. */
  density?: "default" | "compact";
  /** Controlled row selection (opt-in). */
  selected?: (string | number)[];
  onSelectionChange?: (next: (string | number)[]) => void;
}

/** WP list-table: bulk-action bar, sortable-looking headers, row actions, count. */
export function ListTable<T>({
  rows,
  columns,
  rowKey,
  bulkActions = ["Bulk actions", "Edit", "Move to Trash"],
  emptyLabel = "No items found.",
  toolbar,
  hiddenColumnIds = [],
  density = "default",
  selected,
  onSelectionChange,
}: ListTableProps<T>) {
  const visibleColumns = columns.filter((c) => !hiddenColumnIds.includes(c.id));
  const cell = density === "compact" ? "px-2 py-1 text-[12px]" : "px-2 py-2";
  const allKeys = rows.map(rowKey);
  const allSelected = selected !== undefined && allKeys.length > 0 && allKeys.every((k) => selected.includes(k));

  return (
    <>
      <ListToolbar>
        {toolbar}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-11 rounded border border-tt-border bg-tt-surface px-2 text-[13px] text-tt-text md:h-[30px]"
            aria-label="Bulk actions"
            defaultValue={bulkActions[0]}
          >
            {bulkActions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <button
            type="button"
            className="h-11 rounded border border-tt-border bg-tt-surface px-3 text-[13px] text-tt-text hover:border-tt-blue hover:text-tt-blue md:h-[30px]"
          >
            Apply
          </button>
          <span className="ml-auto shrink-0 text-[13px] text-tt-muted">{rows.length} items</span>
        </div>
      </ListToolbar>

      <div className="-mx-3 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[320px] border-collapse border border-tt-border bg-tt-surface text-[13px]">
          <thead>
            <tr className="border-b border-tt-border text-left">
              <th scope="col" className={cn("w-[2.2em] align-top", cell)}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="align-middle"
                  checked={allSelected}
                  onChange={(e) => onSelectionChange?.(e.target.checked ? allKeys : [])}
                />

              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn("font-semibold text-tt-text", cell, col.className)}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="px-2 py-6 text-center text-tt-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                className={cn("group border-b border-tt-border", i % 2 === 1 && "bg-tt-body/60")}
              >
                <td className={cn("align-top", cell)}>
                  <input
                    type="checkbox"
                    aria-label="Select row"
                    className="align-middle"
                    checked={selected?.includes(rowKey(row)) ?? false}
                    onChange={(e) => {
                      const k = rowKey(row);
                      const cur = selected ?? [];
                      onSelectionChange?.(
                        e.target.checked ? [...cur, k] : cur.filter((x) => x !== k),
                      );
                    }}
                  />

                </td>
                {visibleColumns.map((col) => (
                  <td key={col.id} className={cn("align-top", cell, col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** The hover-revealed "Edit | Quick Edit | Trash | View" strip under a row title. */
export function RowActions({ actions }: { actions: { label: string; danger?: boolean }[] }) {
  return (
    <div className="mt-0.5 text-[13px] opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
      {actions.map((a, i) => (
        <span key={a.label}>
          {i > 0 && <span className="text-tt-muted"> | </span>}
          <button
            type="button"
            className={cn("hover:underline", a.danger ? "text-tt-red" : "text-tt-blue")}
          >
            {a.label}
          </button>
        </span>
      ))}
    </div>
  );
}
