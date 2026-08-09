import { Link } from "@tanstack/react-router";
import { MessageSquare, Plus, RefreshCw, Search, User } from "lucide-react";
import { site } from "@/data/wp-mock";

interface AdminBarProps {
  pendingComments: number;
}

/** The fixed 32px wp-admin toolbar. */
export function AdminBar({ pendingComments }: AdminBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-8 items-stretch bg-wp-bar font-wp text-[13px] text-wp-menu-text">
      <div className="flex items-stretch">
        <BarItem title="About WordPress">
          <WpLogo />
        </BarItem>
        <BarItem title={`Visit ${site.name}`}>
          <span className="flex items-center gap-1.5">
            <HouseGlyph />
            <span className="hidden sm:inline">{site.name}</span>
          </span>
        </BarItem>
        <BarItem title="Updates">
          <span className="flex items-center gap-1.5">
            <RefreshCw size={15} />
            <span>{site.updates}</span>
          </span>
        </BarItem>
        <BarItem title="Comments in moderation">
          <span className="flex items-center gap-1.5">
            <MessageSquare size={15} />
            <span
              className={
                pendingComments > 0
                  ? "rounded-[10px] bg-wp-red px-1.5 text-[11px] leading-[17px] font-semibold text-wp-menu-text"
                  : "text-wp-menu-icon"
              }
            >
              {pendingComments}
            </span>
          </span>
        </BarItem>
        <BarItem title="Add new">
          <span className="flex items-center gap-1.5">
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
          </span>
        </BarItem>
      </div>

      <div className="ml-auto flex items-stretch">
        <BarItem title="Search">
          <Search size={15} />
        </BarItem>
        <BarItem title="My account">
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">Howdy, {site.user}</span>
            <span className="grid size-[26px] place-items-center rounded-full bg-wp-menu-hover text-wp-menu-icon">
              <User size={14} />
            </span>
          </span>
        </BarItem>
      </div>
    </header>
  );
}

function BarItem({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className="flex items-center px-2 text-wp-menu-icon transition-colors hover:bg-wp-menu-hover hover:text-wp-blue-hover sm:px-3"
    >
      {children}
    </button>
  );
}

function WpLogo() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM1.02 10a8.98 8.98 0 0 0 5.06 8.08L1.85 6.55A8.94 8.94 0 0 0 1.02 10Zm15.05-.45c0-1.1-.4-1.87-.74-2.47-.45-.74-.88-1.37-.88-2.11 0-.83.63-1.6 1.51-1.6h.12A8.96 8.96 0 0 0 10 1.02a8.97 8.97 0 0 0-7.5 4.03h.57c.94 0 2.4-.11 2.4-.11.48-.03.54.68.06.74 0 0-.49.06-1.03.09l3.27 9.73 1.97-5.9-1.4-3.83a16.2 16.2 0 0 1-.95-.09c-.48-.03-.43-.77.06-.74 0 0 1.48.11 2.37.11.94 0 2.4-.11 2.4-.11.49-.03.55.68.06.74 0 0-.49.06-1.03.09l3.25 9.65.9-3a10.6 10.6 0 0 0 .67-3.87ZM10.16 10.8l-2.7 7.83a8.99 8.99 0 0 0 5.52-.14.8.8 0 0 1-.06-.13l-2.76-7.56Zm7.73-5.09c.04.29.06.6.06.93 0 .92-.17 1.95-.69 3.24l-2.75 7.96A8.98 8.98 0 0 0 17.89 5.7Z" />
    </svg>
  );
}

function HouseGlyph() {
  return (
    <svg viewBox="0 0 20 20" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M10 2 2 9h2v9h5v-6h2v6h5V9h2L10 2Z" />
    </svg>
  );
}

/** Non-interactive placeholder kept out of the bar so the file stays presentational. */
export function AdminBarSiteLink() {
  return (
    <Link to="/wp-admin" className="text-wp-blue hover:underline">
      Dashboard
    </Link>
  );
}
