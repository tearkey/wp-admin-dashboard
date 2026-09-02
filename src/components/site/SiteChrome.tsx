import { useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Menu,
  Twitter,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  themeStylesheet,
  themeVars,
  type Device,
  type SocialNetwork,
  type ThemeConfig,
} from "@/lib/cms/theme";
import type { CmsPage } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const SOCIAL_ICON: Record<SocialNetwork, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
};

interface ChromeProps {
  theme: ThemeConfig;
  /** Render plain anchors (used inside the customizer preview). */
  inert?: boolean;
}

/**
 * Emits the theme's CSS custom properties. On the real site the stylesheet
 * carries media-query overrides so each device tier applies without JS; inside
 * the customizer preview a single tier is pinned via inline variables.
 */
export function themeScopeProps(theme: ThemeConfig, device?: Device) {
  return device
    ? { "data-tt-site": "", style: themeVars(theme, device) as CSSProperties }
    : { "data-tt-site": "" };
}

export function ThemeStyle({ theme, device }: { theme: ThemeConfig; device?: Device }) {
  if (device) return null;
  return <style dangerouslySetInnerHTML={{ __html: themeStylesheet(theme) }} />;
}

function Nav({ href, label, inert }: { href: string; label: string; inert?: boolean }) {
  if (inert) {
    return (
      <span className="cursor-default text-[14px] text-tt-muted hover:text-tt-blue">{label}</span>
    );
  }
  return (
    <a href={href} className="text-[14px] text-tt-muted hover:text-tt-blue">
      {label}
    </a>
  );
}

export function SiteHeader({ theme, inert }: ChromeProps) {
  const h = theme.header;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cta = h.ctaLabel ? (
    inert ? (
      <span
        style={{ display: "var(--tt-h-cta, inline-flex)" }}
        className="rounded bg-tt-blue px-3 py-1.5 text-[13px] text-tt-menu-text"
      >
        {h.ctaLabel}
      </span>
    ) : (
      <a
        href={h.ctaHref}
        style={{ display: "var(--tt-h-cta, inline-flex)" }}
        className="items-center rounded bg-tt-blue px-3 py-1.5 text-[13px] text-tt-menu-text hover:bg-tt-blue-hover"
      >
        {h.ctaLabel}
      </a>
    )
  ) : null;

  return (
    <header
      style={{
        display: "var(--tt-h-display, block)",
        paddingBlock: "var(--tt-h-pad, 12px)",
        fontSize: "calc(14px * var(--tt-h-scale, 1))",
      }}
      className={cn(
        "z-20 border-b border-tt-border bg-tt-surface",
        h.sticky && !inert && "sticky top-0",
      )}
    >
      <div
        style={{ justifyContent: "var(--tt-h-justify, flex-start)" }}
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4"
      >
        <div className="flex min-w-0 items-center gap-2">
          {h.logoUrl ? (
            <img
              src={h.logoUrl}
              alt={h.logoText}
              style={{ height: "var(--tt-h-logo, 32px)" }}
              className="w-auto shrink-0"
            />
          ) : (
            <span
              style={{ height: "var(--tt-h-logo, 32px)", width: "var(--tt-h-logo, 32px)" }}
              className="flex shrink-0 items-center justify-center rounded bg-tt-blue text-[15px] font-bold text-tt-menu-text"
            >
              {(h.logoText || "T").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-[16px] font-semibold text-tt-text">{h.logoText}</span>
          {h.tagline && (
            <span
              style={{ display: "var(--tt-h-tagline, inline)" }}
              className="truncate text-[12px] text-tt-muted"
            >
              — {h.tagline}
            </span>
          )}
        </div>

        <nav
          aria-label="Site"
          style={{ display: "var(--tt-h-nav, flex)" }}
          className="ml-auto flex-wrap items-center gap-4"
        >
          {h.nav.map((l) => (
            <Nav key={l.id} href={l.href} label={l.label} inert={inert} />
          ))}
          {cta}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          style={{ display: "var(--tt-h-toggle, none)" }}
          className="ml-auto size-11 items-center justify-center rounded border border-tt-border text-tt-text"
        >
          <Menu size={18} />
        </button>
      </div>

      {drawerOpen && (
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pt-3">
          {h.nav.map((l) => (
            <Nav key={l.id} href={l.href} label={l.label} inert={inert} />
          ))}
          {cta}
        </div>
      )}

      <div
        style={{ display: "var(--tt-h-bottombar, none)" }}
        className={cn(
          "inset-x-0 bottom-0 z-30 items-center justify-around border-t border-tt-border bg-tt-surface pb-[env(safe-area-inset-bottom)]",
          inert ? "static mt-3" : "fixed",
        )}
      >
        {h.nav.slice(0, 5).map((l) => (
          <span key={l.id} className="flex min-h-11 items-center px-2">
            <Nav href={l.href} label={l.label} inert={inert} />
          </span>
        ))}
      </div>
    </header>
  );
}

export function SiteFooter({
  theme,
  inert,
  pages = [],
}: ChromeProps & { pages?: Pick<CmsPage, "id" | "title" | "slug" | "status">[] }) {
  const f = theme.footer;
  const sitemap = pages.filter((p) => p.status === "publish");
  return (
    <footer
      style={{
        display: "var(--tt-f-display, block)",
        textAlign: "var(--tt-f-align, left)" as CSSProperties["textAlign"],
        fontSize: "calc(14px * var(--tt-f-scale, 1))",
      }}
      className="mt-10 border-t border-tt-border bg-tt-body"
    >
      <div
        style={{
          gridTemplateColumns: "repeat(var(--tt-f-cols, 4), minmax(0, 1fr))",
          paddingBlock: "var(--tt-f-pad, 32px)",
        }}
        className="mx-auto grid max-w-5xl gap-6 px-4"
      >
        <div>
          <div className="text-[15px] font-semibold text-tt-text">{f.logoText}</div>
          <p className="mt-1 text-[13px] text-tt-muted">{f.about}</p>
          <div
            style={{ display: "var(--tt-f-social, flex)" }}
            className="mt-3 flex-wrap gap-2"
          >
            {f.social.map((s) => {
              const Icon = SOCIAL_ICON[s.network];
              const inner = <Icon size={16} />;
              return inert ? (
                <span
                  key={s.id}
                  aria-label={s.network}
                  className="flex size-8 items-center justify-center rounded border border-tt-border text-tt-muted"
                >
                  {inner}
                </span>
              ) : (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.network}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="flex size-8 items-center justify-center rounded border border-tt-border text-tt-muted hover:text-tt-blue"
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </div>

        {f.columns.map((col) => (
          <div key={col.id}>
            <div className="text-[13px] font-semibold text-tt-text">{col.title}</div>
            <ul className="mt-2 space-y-1">
              {col.links.map((l) => (
                <li key={l.id}>
                  <Nav href={l.href} label={l.label} inert={inert} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {f.showSitemap && (
          <div style={{ display: "var(--tt-f-sitemap, block)" }}>
            <div className="text-[13px] font-semibold text-tt-text">Sitemap</div>
            <ul className="mt-2 space-y-1">
              {sitemap.length === 0 && <li className="text-[13px] text-tt-muted">No pages yet.</li>}
              {sitemap.map((p) =>
                inert ? (
                  <li key={p.id} className="text-[14px] text-tt-muted">
                    {p.title}
                  </li>
                ) : (
                  <li key={p.id}>
                    {p.slug ? (
                      <Link
                        to="/site/$slug"
                        params={{ slug: p.slug }}
                        className="text-[14px] text-tt-muted hover:text-tt-blue"
                      >
                        {p.title}
                      </Link>
                    ) : (
                      <Link to="/site" className="text-[14px] text-tt-muted hover:text-tt-blue">
                        {p.title}
                      </Link>
                    )}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-tt-border py-3 text-center text-[12px] text-tt-muted">
        {f.copyright}
      </div>
    </footer>
  );
}

export function PartBlock({ part }: { part: ThemeConfig["parts"][number] }) {
  if (!part.enabled) return null;
  return (
    <section
      style={{
        display: `var(--tt-p-${part.id}-display, block)`,
        textAlign: `var(--tt-p-${part.id}-align, left)` as CSSProperties["textAlign"],
        paddingBlock: `var(--tt-p-${part.id}-pad, 16px)`,
        fontSize: `calc(14px * var(--tt-p-${part.id}-scale, 1))`,
      }}
      className="rounded border border-tt-border bg-tt-surface px-4"
    >
      <h2 className="text-[17px] font-semibold text-tt-text">{part.heading}</h2>
      <p className="mt-1 text-[14px] text-tt-muted">{part.body}</p>
    </section>
  );
}
