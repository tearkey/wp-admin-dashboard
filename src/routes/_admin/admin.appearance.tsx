import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PartBlock, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { SOCIAL_NETWORKS, uid, type SocialNetwork } from "@/lib/cms/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/appearance")({
  head: () => ({
    meta: [
      { title: "Theme Customizer — Techtrick CMS" },
      {
        name: "description",
        content:
          "Customize the site header, footer, social icons and dynamic parts with a live preview.",
      },
      { property: "og:title", content: "Theme Customizer — Techtrick CMS" },
      {
        property: "og:description",
        content: "Header, footer, parts and code snippets, edited live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppearanceScreen,
});

const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text";
const label = "block text-[12px] font-semibold text-tt-text";
const smallBtn =
  "inline-flex items-center gap-1 rounded border border-tt-border px-2 py-1 text-[12px] text-tt-blue hover:bg-tt-body";

type Tab = "header" | "footer" | "parts" | "code";
type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

function AppearanceScreen() {
  const { theme, update, reset } = useThemeConfig();
  const { pages } = useCmsPages();
  const [tab, setTab] = useState<Tab>("header");
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p>
                Edit the site chrome and dynamic parts. Changes save instantly to the theme config
                and render on the front end at /site.
              </p>
            ),
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">Theme Customizer</h1>
        <a
          href="/site"
          target="_blank"
          rel="noreferrer"
          className="h-[26px] rounded border border-tt-blue px-2 text-[13px] leading-[24px] text-tt-blue hover:bg-tt-blue hover:text-tt-menu-text"
        >
          View site
        </a>
        <button
          type="button"
          onClick={() => {
            reset();
            toast.success("Theme reset to defaults.");
          }}
          className="h-[26px] rounded border border-tt-border px-2 text-[13px] text-tt-red"
        >
          Reset theme
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Settings rail */}
        <div className="rounded border border-tt-border bg-tt-surface">
          <div className="flex border-b border-tt-border">
            {(["header", "footer", "parts", "code"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-2 text-[13px] capitalize",
                  tab === t
                    ? "border-b-2 border-tt-blue font-semibold text-tt-text"
                    : "text-tt-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-3">
            {tab === "header" && (
              <>
                <div>
                  <label className={label} htmlFor="logo-text">
                    Logo text
                  </label>
                  <input
                    id="logo-text"
                    className={input}
                    value={theme.header.logoText}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        header: { ...p.header, logoText: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={label} htmlFor="logo-url">
                    Logo image URL
                  </label>
                  <input
                    id="logo-url"
                    className={input}
                    placeholder="https://…/logo.svg"
                    value={theme.header.logoUrl}
                    onChange={(e) =>
                      update((p) => ({ ...p, header: { ...p.header, logoUrl: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <label className={label} htmlFor="tagline">
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    className={input}
                    value={theme.header.tagline}
                    onChange={(e) =>
                      update((p) => ({ ...p, header: { ...p.header, tagline: e.target.value } }))
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-[13px] text-tt-text">
                  <input
                    type="checkbox"
                    checked={theme.header.sticky}
                    onChange={(e) =>
                      update((p) => ({ ...p, header: { ...p.header, sticky: e.target.checked } }))
                    }
                  />
                  Sticky header
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label} htmlFor="cta-label">
                      CTA label
                    </label>
                    <input
                      id="cta-label"
                      className={input}
                      value={theme.header.ctaLabel}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          header: { ...p.header, ctaLabel: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="cta-href">
                      CTA link
                    </label>
                    <input
                      id="cta-href"
                      className={input}
                      value={theme.header.ctaHref}
                      onChange={(e) =>
                        update((p) => ({ ...p, header: { ...p.header, ctaHref: e.target.value } }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className={label}>Navigation links</div>
                  <div className="mt-1 space-y-2">
                    {theme.header.nav.map((l, i) => (
                      <div key={l.id} className="flex gap-1">
                        <input
                          aria-label={`Nav label ${i + 1}`}
                          className={input}
                          value={l.label}
                          onChange={(e) =>
                            update((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                nav: p.header.nav.map((n) =>
                                  n.id === l.id ? { ...n, label: e.target.value } : n,
                                ),
                              },
                            }))
                          }
                        />
                        <input
                          aria-label={`Nav link ${i + 1}`}
                          className={input}
                          value={l.href}
                          onChange={(e) =>
                            update((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                nav: p.header.nav.map((n) =>
                                  n.id === l.id ? { ...n, href: e.target.value } : n,
                                ),
                              },
                            }))
                          }
                        />
                        <button
                          type="button"
                          aria-label={`Remove nav link ${i + 1}`}
                          onClick={() =>
                            update((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                nav: p.header.nav.filter((n) => n.id !== l.id),
                              },
                            }))
                          }
                          className="rounded border border-tt-border px-2 text-tt-red"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() =>
                        update((p) => ({
                          ...p,
                          header: {
                            ...p.header,
                            nav: [
                              ...p.header.nav,
                              { id: uid("nav"), label: "New link", href: "/site" },
                            ],
                          },
                        }))
                      }
                    >
                      <Plus size={13} /> Add nav link
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "footer" && (
              <>
                <div>
                  <label className={label} htmlFor="footer-logo">
                    Footer logo text
                  </label>
                  <input
                    id="footer-logo"
                    className={input}
                    value={theme.footer.logoText}
                    onChange={(e) =>
                      update((p) => ({ ...p, footer: { ...p.footer, logoText: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <label className={label} htmlFor="footer-about">
                    About text
                  </label>
                  <textarea
                    id="footer-about"
                    rows={2}
                    className={input}
                    value={theme.footer.about}
                    onChange={(e) =>
                      update((p) => ({ ...p, footer: { ...p.footer, about: e.target.value } }))
                    }
                  />
                </div>

                <div className={label}>Link columns</div>
                {theme.footer.columns.map((col) => (
                  <div key={col.id} className="rounded border border-tt-border p-2">
                    <div className="flex gap-1">
                      <input
                        aria-label="Column title"
                        className={input}
                        value={col.title}
                        onChange={(e) =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              columns: p.footer.columns.map((c) =>
                                c.id === col.id ? { ...c, title: e.target.value } : c,
                              ),
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        aria-label={`Remove column ${col.title}`}
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              columns: p.footer.columns.filter((c) => c.id !== col.id),
                            },
                          }))
                        }
                        className="rounded border border-tt-border px-2 text-tt-red"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {col.links.map((l) => (
                        <div key={l.id} className="flex gap-1">
                          <input
                            aria-label="Footer link label"
                            className={input}
                            value={l.label}
                            onChange={(e) =>
                              update((p) => ({
                                ...p,
                                footer: {
                                  ...p.footer,
                                  columns: p.footer.columns.map((c) =>
                                    c.id === col.id
                                      ? {
                                          ...c,
                                          links: c.links.map((x) =>
                                            x.id === l.id ? { ...x, label: e.target.value } : x,
                                          ),
                                        }
                                      : c,
                                  ),
                                },
                              }))
                            }
                          />
                          <input
                            aria-label="Footer link URL"
                            className={input}
                            value={l.href}
                            onChange={(e) =>
                              update((p) => ({
                                ...p,
                                footer: {
                                  ...p.footer,
                                  columns: p.footer.columns.map((c) =>
                                    c.id === col.id
                                      ? {
                                          ...c,
                                          links: c.links.map((x) =>
                                            x.id === l.id ? { ...x, href: e.target.value } : x,
                                          ),
                                        }
                                      : c,
                                  ),
                                },
                              }))
                            }
                          />
                          <button
                            type="button"
                            aria-label={`Remove link ${l.label}`}
                            onClick={() =>
                              update((p) => ({
                                ...p,
                                footer: {
                                  ...p.footer,
                                  columns: p.footer.columns.map((c) =>
                                    c.id === col.id
                                      ? { ...c, links: c.links.filter((x) => x.id !== l.id) }
                                      : c,
                                  ),
                                },
                              }))
                            }
                            className="rounded border border-tt-border px-2 text-tt-red"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={smallBtn}
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              columns: p.footer.columns.map((c) =>
                                c.id === col.id
                                  ? {
                                      ...c,
                                      links: [
                                        ...c.links,
                                        { id: uid("fl"), label: "New link", href: "/site" },
                                      ],
                                    }
                                  : c,
                              ),
                            },
                          }))
                        }
                      >
                        <Plus size={13} /> Add link
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      footer: {
                        ...p.footer,
                        columns: [
                          ...p.footer.columns,
                          { id: uid("col"), title: "New column", links: [] },
                        ],
                      },
                    }))
                  }
                >
                  <Plus size={13} /> Add column
                </button>

                <div className={label}>Social icons</div>
                <div className="space-y-1">
                  {theme.footer.social.map((s) => (
                    <div key={s.id} className="flex gap-1">
                      <select
                        aria-label="Social network"
                        className={input}
                        value={s.network}
                        onChange={(e) =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              social: p.footer.social.map((x) =>
                                x.id === s.id
                                  ? { ...x, network: e.target.value as SocialNetwork }
                                  : x,
                              ),
                            },
                          }))
                        }
                      >
                        {SOCIAL_NETWORKS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="Social URL"
                        className={input}
                        value={s.href}
                        onChange={(e) =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              social: p.footer.social.map((x) =>
                                x.id === s.id ? { ...x, href: e.target.value } : x,
                              ),
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${s.network}`}
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              social: p.footer.social.filter((x) => x.id !== s.id),
                            },
                          }))
                        }
                        className="rounded border border-tt-border px-2 text-tt-red"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={smallBtn}
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        footer: {
                          ...p.footer,
                          social: [
                            ...p.footer.social,
                            { id: uid("so"), network: "facebook", href: "https://facebook.com" },
                          ],
                        },
                      }))
                    }
                  >
                    <Plus size={13} /> Add social icon
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[13px] text-tt-text">
                  <input
                    type="checkbox"
                    checked={theme.footer.showSitemap}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        footer: { ...p.footer, showSitemap: e.target.checked },
                      }))
                    }
                  />
                  Show sitemap column
                </label>
                <div>
                  <label className={label} htmlFor="copyright">
                    Copyright line
                  </label>
                  <input
                    id="copyright"
                    className={input}
                    value={theme.footer.copyright}
                    onChange={(e) =>
                      update((p) => ({ ...p, footer: { ...p.footer, copyright: e.target.value } }))
                    }
                  />
                </div>
              </>
            )}

            {tab === "parts" && (
              <div className="space-y-3">
                {theme.parts.map((part) => (
                  <div key={part.id} className="rounded border border-tt-border p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-tt-text">{part.label}</span>
                      <label className="flex items-center gap-1 text-[12px] text-tt-muted">
                        <input
                          type="checkbox"
                          checked={part.enabled}
                          onChange={(e) =>
                            update((p) => ({
                              ...p,
                              parts: p.parts.map((x) =>
                                x.id === part.id ? { ...x, enabled: e.target.checked } : x,
                              ),
                            }))
                          }
                        />
                        Enabled
                      </label>
                    </div>
                    <input
                      aria-label={`${part.label} heading`}
                      className={cn(input, "mt-2")}
                      value={part.heading}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          parts: p.parts.map((x) =>
                            x.id === part.id ? { ...x, heading: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                    <textarea
                      aria-label={`${part.label} body`}
                      rows={2}
                      className={cn(input, "mt-1")}
                      value={part.body}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          parts: p.parts.map((x) =>
                            x.id === part.id ? { ...x, body: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      parts: [
                        ...p.parts,
                        {
                          id: uid("part"),
                          label: "New part",
                          enabled: true,
                          heading: "Heading",
                          body: "Body copy",
                        },
                      ],
                    }))
                  }
                >
                  <Plus size={13} /> Add part
                </button>
              </div>
            )}

            {tab === "code" && (
              <div className="space-y-3">
                {(
                  [
                    ["head", "<head> snippet (GTM, verification)"],
                    ["bodyOpen", "After <body> opens"],
                    ["bodyClose", "Before </body> closes"],
                  ] as const
                ).map(([key, text]) => (
                  <div key={key}>
                    <label className={label} htmlFor={`snip-${key}`}>
                      {text}
                    </label>
                    <textarea
                      id={`snip-${key}`}
                      rows={4}
                      spellCheck={false}
                      className={cn(input, "font-mono text-[12px]")}
                      value={theme.snippets[key]}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          snippets: { ...p.snippets, [key]: e.target.value },
                        }))
                      }
                    />
                  </div>
                ))}
                <p className="text-[12px] text-tt-muted">
                  Snippets are stored with the theme config and will be injected by the site root
                  once the hosted backend serves them.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded border border-tt-border bg-tt-body">
          <div className="flex items-center gap-2 border-b border-tt-border bg-tt-surface px-3 py-2">
            <span className="text-[12px] font-semibold text-tt-text">Live preview</span>
            <div className="ml-auto flex gap-1">
              {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={cn(
                    "rounded border px-2 py-1 text-[12px] capitalize",
                    device === d
                      ? "border-tt-blue text-tt-blue"
                      : "border-tt-border text-tt-muted",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto p-3">
            <div
              style={{ width: DEVICE_WIDTH[device] }}
              className="mx-auto overflow-hidden rounded border border-tt-border bg-tt-surface"
            >
              <SiteHeader theme={theme} inert />
              <div className="space-y-3 p-3">
                {theme.parts.map((part) => (
                  <PartBlock key={part.id} part={part} />
                ))}
              </div>
              <SiteFooter theme={theme} pages={pages} inert />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
