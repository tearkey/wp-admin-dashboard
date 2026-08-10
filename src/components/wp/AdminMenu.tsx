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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminPath =
  | "/wp-admin"
  | "/wp-admin/posts"
  | "/wp-admin/pages"
  | "/wp-admin/comments"
  | "/wp-admin/settings";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  to?: AdminPath;
  badge?: number;
  submenu: string[];
}

const MENU: MenuItem[] = [
  { label: "Dashboard", icon: Gauge, to: "/wp-admin", submenu: ["Home", "Updates"] },
  {
    label: "Posts",
    icon: Pin,
    to: "/wp-admin/posts",
    submenu: ["All Posts", "Add New Post", "Categories", "Tags"],
  },
  { label: "Media", icon: ImageIcon, submenu: ["Library", "Add New Media File"] },
  { label: "Pages", icon: FileText, to: "/wp-admin/pages", submenu: ["All Pages", "Add New Page"] },
  { label: "Comments", icon: MessageSquare, to: "/wp-admin/comments", submenu: [] },
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
    to: "/wp-admin/settings",
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

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="fixed inset-0 top-8 z-30 bg-black/40 md:hidden"
        />
      )}
      <nav
        aria-label="Main menu"
        className={cn(
          "fixed top-8 bottom-0 left-0 z-40 flex w-[190px] flex-col bg-wp-menu font-wp text-[13px] text-wp-menu-text transition-transform duration-150 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[36px]" : "md:w-[160px]",
        )}
      >
        <ul className="flex-1 overflow-x-visible overflow-y-auto py-1">
          {MENU.map((item) => {
            const active = item.to
              ? item.to === "/wp-admin"
                ? pathname === "/wp-admin"
                : pathname.startsWith(item.to)
              : false;

            return (
              <li key={item.label} className="group relative">
                <MenuRow
                  item={item}
                  active={active}
                  collapsed={collapsed}
                  onNavigate={onCloseMobile}
                  badge={item.label === "Comments" ? pendingComments : undefined}
                />

                {item.submenu.length > 0 && (
                  <ul className="absolute top-0 left-full z-50 hidden min-w-[160px] bg-wp-menu-hover py-1 shadow-lg md:group-hover:block">
                    <li className="px-3 py-1.5 text-[13px] font-semibold text-wp-menu-text">
                      {item.label}
                    </li>
                    {item.submenu.map((sub) => (
                      <li key={sub}>
                        <span className="block cursor-pointer px-3 py-1.5 text-wp-menu-icon hover:text-wp-blue-hover">
                          {sub}
                        </span>
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
          className="hidden h-[34px] shrink-0 items-center gap-2 px-2 text-wp-menu-icon hover:text-wp-blue-hover md:flex"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
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
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const inner = (
    <>
      <Icon size={18} className="shrink-0" />
      <span className={cn("truncate", collapsed && "md:hidden")}>{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "ml-auto rounded-[10px] bg-wp-red px-1.5 text-[11px] leading-[17px] font-semibold text-wp-menu-text",
            collapsed && "md:hidden",
          )}
        >
          {badge}
        </span>
      )}
    </>
  );

  const className = cn(
    "flex h-[34px] w-full items-center gap-2 border-l-4 px-2 text-left transition-colors",
    active
      ? "border-l-wp-blue bg-wp-menu-hover font-semibold text-wp-menu-text"
      : "border-l-transparent text-wp-menu-icon hover:bg-wp-menu-hover hover:text-wp-blue-hover",
  );

  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onNavigate}>
        {inner}
      </Link>
    );
  }
  return (
    <span className={cn(className, "cursor-pointer")} role="link" tabIndex={0}>
      {inner}
    </span>
  );
}

