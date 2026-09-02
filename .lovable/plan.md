# Responsive Tiers, Cloudflare Security, Performance Optimizer

Three phases. Live integrations are built for real APIs; screens show a clear "Not connected" state with realistic sample data until you add credentials.

## Shared foundation

A single HTTP provider layer handles everything that needs a real backend:

- `src/lib/cms/provider.ts` — one interface, two implementations: mock (default, current localStorage behaviour) and HTTP (calls your hosting when `CMS_API_BASE_URL` + `CMS_API_TOKEN` are set).
- `docs/api-contract.md` — the exact endpoints/JSON your hosting side must expose for media, database and file tools.
- All third-party calls run in server functions; tokens never reach the browser.
- Every screen has three states: not connected, connected, and error, so nothing looks broken before keys exist.

---

## Phase 1 — Device tiers with per-device overrides

**Theme config**
Each header, footer and part setting gains an optional tablet and mobile override on top of the desktop base value: visibility, layout preset, alignment, spacing, font size, logo variant, nav mode (inline / drawer / bottom bar). Unset overrides inherit from the tier above (mobile ← tablet ← desktop).

**Customizer**
- Device toolbar (desktop / tablet / mobile) resizes the live preview to real widths and switches which tier the controls write to.
- Each control shows an "inherited" badge with a Reset-to-inherit button when it holds an override.
- Header builder gains mobile-specific nav behaviour (drawer, bottom bar, collapsed logo) and footer gains column stacking order per tier.

**Public site**
`SiteChrome` and part renderers resolve values per breakpoint from the theme config, emitting responsive classes and a small scoped style block so overrides apply without JS.

**Admin shell**
Three distinct layouts, not one shrinking one: desktop (persistent sidebar, multi-column), tablet (icon rail, drawer sub-panels), mobile (bottom tab bar for the top five sections, full-screen drawers, card lists instead of tables, sticky action bar). Tap targets 44px+, safe-area insets, focus order audited per tier.

---

## Phase 2 — Security tab + Cloudflare

New `/admin/security`:

- **Overview** — security posture cards: SSL/HSTS/header audit rows with pass-fail, failed-login and blocked-request counters, file-integrity and permissions checks (via the hosting API).
- **Controls** — login rate limiting, 2FA enforcement, IP allow/deny lists, security header toggles.
- **Cloudflare submenu** (`/admin/security/cloudflare`) — connect with an API token + Zone ID stored as secrets and never rendered back. Once connected it loads live from Cloudflare:
  - zone overview and analytics (requests, bandwidth, threats blocked, cached ratio) with charts,
  - firewall / WAF rule list with create, edit, enable, disable,
  - managed rulesets and premium settings exposed by your plan, read from the API rather than hard-coded,
  - security level, Bot Fight Mode, Always Use HTTPS, Under Attack mode,
  - cache purge: everything, or by URL / prefix / tag.
- A Test connection button verifies the token and reports the zone name and plan.

---

## Phase 3 — Performance optimizer

New `/admin/tools/performance`:

- **Speed tests** — real Google PageSpeed Insights runs for mobile and desktop against a chosen URL. Core Web Vitals scorecards (LCP, CLS, INP, TTFB, FCP), a horizontal bar chart of the slowest resources (element, type, transfer size, load ms) and a grouped mobile-vs-desktop comparison chart.
- **Opportunities** — each with estimated saving and a plain-language "how to fix".
- **History** — past runs stored per URL with a trend line so regressions are visible.
- **Image optimizer** — scans media, flags oversize/unoptimised images, converts to WebP/AVIF and regenerates sizes through the hosting API, with a dry run first.
- **Cache purge** — one click for the site cache plus Cloudflare purge from Phase 2, and per-URL purge.
- **Database tools** — table sizes, overhead, optimize/repair, cleanup of revisions, transients and orphaned rows, all through the hosting API.
- **File cleanup** — unused uploads, stale logs, temp files, with a dry-run preview before any delete.

Destructive actions (purge, optimize, delete) are superadmin-gated in the UI and re-checked server-side.

---

## Credentials I'll need later

Added as secrets when you have them; nothing breaks in the meantime:
`PAGESPEED_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CMS_API_BASE_URL`, `CMS_API_TOKEN`.

## Technical notes

- Routes under `src/routes/_admin/`, following the existing `createFileRoute("/_admin/admin/...")` convention; menu entries added to `AdminMenu.tsx`.
- Server functions in `src/lib/*.functions.ts`; `process.env` read inside `.handler()` only; Zod validation on every input.
- Charts with the installed Recharts, themed via `--tt-*` tokens — no hard-coded colors.
- Theme config gains a version field and a migration so existing saved themes keep working.
- Brand guard, lint, typecheck, build and Prettier stay green each phase; README gains a section per phase.

## Assumptions

- The hosting API for media/database/file tools is documented by me and implemented on your panel separately unless you ask me to write it.
- Cloudflare "premium" features shown are whatever your zone plan returns from the API; nothing is faked.
- PageSpeed runs are on-demand (with cached recent results), not scheduled, unless you want a cron endpoint too.
