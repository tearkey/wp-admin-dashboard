import { Menu, MessageSquare, Plus, RefreshCw, Search, User } from "lucide-react";
import { site } from "@/data/cms-mock";
import { cn } from "@/lib/utils";


interface AdminBarProps {
  pendingComments: number;
  onToggleMenu?: () => void;
  menuOpen?: boolean;
}

/** The fixed 32px admin toolbar. */
export function AdminBar({ pendingComments, onToggleMenu, menuOpen }: AdminBarProps) {
  return (
    <header
      data-tt-adminbar
      className="fixed inset-x-0 top-0 z-50 flex h-8 items-stretch bg-tt-bar font-tt text-[13px] text-tt-menu-text"
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={!!menuOpen}
          className="flex items-center px-2 text-tt-menu-icon hover:bg-tt-menu-hover hover:text-tt-blue-hover md:hidden"
        >
          <Menu size={18} />
        </button>
        <BarItem title="About Techtrick CMS">
          <WpLogo />
        </BarItem>
        <BarItem title={`Visit ${site.name}`}>
          <span className="flex items-center gap-1.5">
            <HouseGlyph />
            <span className="hidden sm:inline">{site.name}</span>
          </span>
        </BarItem>
        <BarItem title="Updates" className="hidden sm:flex">
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
                  ? "rounded-[10px] bg-tt-red px-1.5 text-[11px] leading-[17px] font-semibold text-tt-menu-text"
                  : "text-tt-menu-icon"
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
        <BarItem title="Search" className="hidden sm:flex">
          <Search size={15} />
        </BarItem>
        <BarItem title="My account">
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">Howdy, {site.user}</span>
            <span className="grid size-[26px] place-items-center rounded-full bg-tt-menu-hover text-tt-menu-icon">
              <User size={14} />
            </span>
          </span>
        </BarItem>
      </div>
    </header>
  );
}

function BarItem({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "flex items-center px-2 text-tt-menu-icon transition-colors hover:bg-tt-menu-hover hover:text-tt-blue-hover sm:px-3",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Techtrick CMS mark: a rounded badge with a "T". */
function BrandLogo() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden>
      <rect x="0" y="0" width="20" height="20" rx="5" fill="currentColor" />
      <path d="M5 6.2h10v2.1h-3.9V15H8.9V8.3H5V6.2Z" className="fill-tt-bar" />
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

