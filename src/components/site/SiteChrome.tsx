import { Link } from "@tanstack/react-router";
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SocialNetwork, ThemeConfig } from "@/lib/cms/theme";
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
  return (
    <header
      className={cn(
        "z-20 border-b border-tt-border bg-tt-surface",
        h.sticky && !inert && "sticky top-0",
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          {h.logoUrl ? (
            <img src={h.logoUrl} alt={h.logoText} className="h-8 w-auto" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded bg-tt-blue text-[15px] font-bold text-tt-menu-text">
              {(h.logoText || "T").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-[16px] font-semibold text-tt-text">{h.logoText}</span>
          {h.tagline && (
            <span className="hidden text-[12px] text-tt-muted sm:inline">— {h.tagline}</span>
          )}
        </div>
        <nav aria-label="Site" className="ml-auto flex flex-wrap items-center gap-4">
          {h.nav.map((l) => (
            <Nav key={l.id} href={l.href} label={l.label} inert={inert} />
          ))}
          {h.ctaLabel &&
            (inert ? (
              <span className="rounded bg-tt-blue px-3 py-1.5 text-[13px] text-tt-menu-text">
                {h.ctaLabel}
              </span>
            ) : (
              <a
                href={h.ctaHref}
                className="rounded bg-tt-blue px-3 py-1.5 text-[13px] text-tt-menu-text hover:bg-tt-blue-hover"
              >
                {h.ctaLabel}
              </a>
            ))}
        </nav>
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
    <footer className="mt-10 border-t border-tt-border bg-tt-body">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-[15px] font-semibold text-tt-text">{f.logoText}</div>
          <p className="mt-1 text-[13px] text-tt-muted">{f.about}</p>
          <div className="mt-3 flex gap-2">
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
          <div>
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
    <section className="rounded border border-tt-border bg-tt-surface p-4">
      <h2 className="text-[17px] font-semibold text-tt-text">{part.heading}</h2>
      <p className="mt-1 text-[14px] text-tt-muted">{part.body}</p>
    </section>
  );
}
