import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Gauge, Menu, Paintbrush, Pin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BarPath = "/admin" | "/admin/posts" | "/admin/pages" | "/admin/appearance";

const ITEMS: { label: string; icon: LucideIcon; to: BarPath }[] = [
  { label: "Home", icon: Gauge, to: "/admin" },
  { label: "Posts", icon: Pin, to: "/admin/posts" },
  { label: "Pages", icon: FileText, to: "/admin/pages" },
  { label: "Theme", icon: Paintbrush, to: "/admin/appearance" },
];

/** Mobile-tier primary navigation: five fixed tabs, the last opens the drawer. */
export function AdminBottomBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-tt-border bg-tt-menu pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {ITEMS.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
              active ? "text-tt-menu-text" : "text-tt-menu-icon",
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-tt-menu-icon"
      >
        <Menu size={18} aria-hidden="true" />
        More
      </button>
    </nav>
  );
}
