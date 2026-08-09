import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostboxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

/** The wp-admin "postbox" metabox panel: header with a collapse toggle. */
export function Postbox({ title, children, className, action }: PostboxProps) {
  const [open, setOpen] = useState(true);

  return (
    <section
      className={cn(
        "mb-4 border border-wp-border bg-wp-surface shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-wp-border px-3 py-2">
        <h2 className="flex-1 text-[14px] leading-tight font-semibold text-wp-text">{title}</h2>
        {action}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          className="rounded p-1 text-wp-muted hover:text-wp-text"
        >
          <ChevronUp size={16} className={cn("transition-transform", !open && "rotate-180")} />
        </button>
      </div>
      {open && <div className="px-3 py-3 text-[13px] text-wp-text">{children}</div>}
    </section>
  );
}
