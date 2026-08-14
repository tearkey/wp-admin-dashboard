import { ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

interface PostboxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  /** Stable id used to persist the collapsed state per browser. */
  id?: string;
  /** Start collapsed on small screens (until the user says otherwise). */
  collapsedOnMobile?: boolean;
}

/** The wp-admin "postbox" metabox panel: header with a collapse toggle. */
export function Postbox({
  title,
  children,
  className,
  action,
  id,
  collapsedOnMobile,
}: PostboxProps) {
  const isMobile = useIsMobile();
  // null = never toggled, so fall back to the responsive default.
  const [stored, setStored] = usePersistentState<boolean | null>(
    `postbox:${id ?? title}`,
    null,
  );
  const open = stored ?? !(isMobile && collapsedOnMobile);

  const toggle = () => setStored(!open);


  const panelId = `postbox-${(id ?? title).replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section
      className={cn(
        "mb-4 border border-tt-border bg-tt-surface shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-tt-border px-3">
        <h2 className="min-w-0 flex-1 text-[14px] leading-tight font-semibold text-tt-text">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex min-h-11 w-full items-center py-2 text-left md:min-h-0 md:cursor-default"
          >
            <span className="truncate">{title}</span>
          </button>
        </h2>
        {action}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          className="-mr-1 flex size-11 shrink-0 items-center justify-center rounded text-tt-muted hover:text-tt-text md:size-7"
        >
          <ChevronUp size={16} className={cn("transition-transform", !open && "rotate-180")} />
        </button>
      </div>
      <div id={panelId} hidden={!open} className="px-3 py-3 text-[13px] text-tt-text">
        {children}
      </div>
    </section>
  );
}
