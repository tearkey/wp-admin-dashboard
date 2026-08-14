import { useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  FileText,
  Gauge,
  Image as ImageIcon,
  MessageSquare,
  Paintbrush,
  Pin,
  Plug,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

type AdminPath =
  | "/admin"
  | "/admin/posts"
  | "/admin/pages"
  | "/admin/comments"
  | "/admin/settings";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  to?: AdminPath;
  badge?: number;
  submenu: string[];
}

const MENU: MenuItem[] = [
  { label: "Dashboard", icon: Gauge, to: "/admin", submenu: ["Home", "Updates"] },
  {
    label: "Posts",
    icon: Pin,
    to: "/admin/posts",
    submenu: ["All Posts", "Add New Post", "Categories", "Tags"],
  },
  { label: "Media", icon: ImageIcon, submenu: ["Library", "Add New Media File"] },
  { label: "Pages", icon: FileText, to: "/admin/pages", submenu: ["All Pages", "Add New Page"] },
  { label: "Comments", icon: MessageSquare, to: "/admin/comments", submenu: [] },
  {
    label: "Appearance",
    icon: Paintbrush,
    submenu: ["Themes", "Editor", "Patterns"],
  },
  { label: "Plugins", icon: Plug, submenu: ["Installed Plugins", "Add New Plugin"] },
  { label: "Users", icon: Users, submenu: ["All Users", "Add New User", "Profile"] },
  { label: "Tools", icon: Wrench, submenu: ["Available Tools", "Import", "Export", "Site Health"] },
  {
    label: "Settings",
    icon: Settings,
    to: "/admin/settings",
    submenu: ["General", "Writing", "Reading", "Discussion", "Permalinks"],
  },
];

interface AdminMenuProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  pendingComments: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminMenu({
  collapsed,
  onToggleCollapsed,
  pendingComments,
  mobileOpen,
  onCloseMobile,
}: AdminMenuProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const drawerRef = useRef<HTMLElement>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useFocusTrap(drawerRef, mobileOpen, onCloseMobile);

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 top-8 z-30 bg-black/40 md:hidden"
        />
      )}
      <nav
        ref={drawerRef}
        aria-label="Main menu"
        {...(mobileOpen ? { role: "dialog", "aria-modal": true } : {})}
        className={cn(
          "fixed top-8 bottom-0 left-0 z-40 flex w-[190px] flex-col bg-tt-menu font-tt text-[13px] text-tt-menu-text transition-transform duration-150 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[36px]" : "md:w-[160px]",
        )}
      >
        <div className="flex h-11 shrink-0 items-center justify-between px-2 md:hidden">
          <span className="font-semibold">Menu</span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="flex size-11 items-center justify-center text-tt-menu-icon hover:text-tt-blue-hover"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="flex-1 overflow-x-visible overflow-y-auto py-1">
          {MENU.map((item) => {
            const active = item.to
              ? item.to === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.to)
              : false;
            const submenuOpen = openSubmenu === item.label;
            const submenuId = `tt-submenu-${item.label.toLowerCase()}`;

            return (
              <li
                key={item.label}
                className="group relative"
                onMouseEnter={() => setOpenSubmenu(item.label)}
                onMouseLeave={() => setOpenSubmenu((v) => (v === item.label ? null : v))}
                onFocus={() => setOpenSubmenu(item.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpenSubmenu((v) => (v === item.label ? null : v));
                  }
                }}
              >
                <MenuRow
                  item={item}
                  active={active}
                  collapsed={collapsed}
                  onNavigate={onCloseMobile}
                  badge={item.label === "Comments" ? pendingComments : undefined}
                  submenuId={item.submenu.length ? submenuId : undefined}
                  submenuOpen={submenuOpen}
                  onToggleSubmenu={() => setOpenSubmenu(submenuOpen ? null : item.label)}
                />

                {item.submenu.length > 0 && (
                  <ul
                    id={submenuId}
                    className={cn(
                      "z-50 min-w-[160px] bg-tt-menu-hover py-1 shadow-lg md:absolute md:top-0 md:left-full",
                      submenuOpen ? "block" : "hidden md:group-hover:block md:group-focus-within:block",
                    )}
                  >
                    <li className="px-3 py-1.5 text-[13px] font-semibold text-tt-menu-text">
                      {item.label}
                    </li>
                    {item.submenu.map((sub) => (
                      <li key={sub}>
                        <button
                          type="button"
                          className="flex min-h-11 w-full items-center px-3 text-left text-tt-menu-icon hover:text-tt-blue-hover md:min-h-0 md:py-1.5"
                        >
                          {sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden h-[34px] shrink-0 items-center gap-2 px-2 text-tt-menu-icon hover:text-tt-blue-hover md:flex"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          aria-pressed={collapsed}
        >
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse menu</span>}
        </button>
      </nav>
    </>
  );
}

function MenuRow({
  item,
  active,
  collapsed,
  badge,
  onNavigate,
  submenuId,
  submenuOpen,
  onToggleSubmenu,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onNavigate: () => void;
  submenuId?: string;
  submenuOpen: boolean;
  onToggleSubmenu: () => void;
}) {
  const Icon = item.icon;
  const inner = (
    <>
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && "md:hidden")}>{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "ml-auto rounded-[10px] bg-tt-red px-1.5 text-[11px] leading-[17px] font-semibold text-tt-menu-text",
            collapsed && "md:hidden",
          )}
        >
          {badge}
          <span className="sr-only"> pending</span>
        </span>
      )}
    </>
  );

  const className = cn(
    "flex min-h-11 w-full items-center gap-2 border-l-4 px-2 text-left transition-colors md:h-[34px] md:min-h-0",
    active
      ? "border-l-tt-blue bg-tt-menu-hover font-semibold text-tt-menu-text"
      : "border-l-transparent text-tt-menu-icon hover:bg-tt-menu-hover hover:text-tt-blue-hover",
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        className={className}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-expanded={submenuId ? submenuOpen : undefined}
      aria-controls={submenuId}
      onClick={onToggleSubmenu}
    >
      {inner}
    </button>
  );
}
