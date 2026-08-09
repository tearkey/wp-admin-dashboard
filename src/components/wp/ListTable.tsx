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
}

/** WP list-table: bulk-action bar, sortable-looking headers, row actions, count. */
export function ListTable<T>({
  rows,
  columns,
  rowKey,
  bulkActions = ["Bulk actions", "Edit", "Move to Trash"],
  emptyLabel = "No items found.",
}: ListTableProps<T>) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select
          className="h-[30px] rounded border border-wp-border bg-wp-surface px-2 text-[13px] text-wp-text"
          aria-label="Bulk actions"
          defaultValue={bulkActions[0]}
        >
          {bulkActions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button
          type="button"
          className="h-[30px] rounded border border-wp-border bg-wp-surface px-3 text-[13px] text-wp-text hover:border-wp-blue hover:text-wp-blue"
        >
          Apply
        </button>
        <span className="ml-auto text-[13px] text-wp-muted">{rows.length} items</span>
      </div>

      <table className="w-full border-collapse border border-wp-border bg-wp-surface text-[13px]">
        <thead>
          <tr className="border-b border-wp-border text-left">
            <th scope="col" className="w-[2.2em] px-2 py-2">
              <input type="checkbox" aria-label="Select all" className="align-middle" />
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={cn("px-2 py-2 font-semibold text-wp-text", col.className)}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="px-2 py-6 text-center text-wp-muted">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              className={cn("group border-b border-wp-border", i % 2 === 1 && "bg-wp-body/60")}
            >
              <td className="px-2 py-2 align-top">
                <input type="checkbox" aria-label="Select row" className="align-middle" />
              </td>
              {columns.map((col) => (
                <td key={col.id} className={cn("px-2 py-2 align-top", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** The hover-revealed "Edit | Quick Edit | Trash | View" strip under a row title. */
export function RowActions({ actions }: { actions: { label: string; danger?: boolean }[] }) {
  return (
    <div className="mt-0.5 text-[13px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      {actions.map((a, i) => (
        <span key={a.label}>
          {i > 0 && <span className="text-wp-muted"> | </span>}
          <button
            type="button"
            className={cn("hover:underline", a.danger ? "text-wp-red" : "text-wp-blue")}
          >
            {a.label}
          </button>
        </span>
      ))}
    </div>
  );
}
