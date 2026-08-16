# Techtrick CMS — Pages, Theme Builder, Optimizer, Security, Responsive Admin

A phased build. Each phase ships working screens and can be reviewed before the next starts.

## Data layer decision

You said you can provide space on your own hosting panel. The Lovable preview runs on an edge runtime and cannot open a direct database connection to a cPanel host, so the app will talk to your hosting over HTTPS instead:

- All reads/writes go through a single provider interface (`src/lib/cms/provider.ts`) with two implementations:
  - **Mock provider** — the current in-memory/localStorage data, used in preview and by anyone cloning the repo.
  - **HTTP provider** — calls a REST API on your hosting (`CMS_API_BASE_URL` + `CMS_API_TOKEN`, stored as secrets), used when those env vars are set.
- Every admin screen calls server functions, never the provider directly, so swapping hosts is a config change.
- Phase 1 also ships `docs/api-contract.md`: the exact endpoints/JSON your hosting side must expose (pages, theme, settings, media). You (or I, in a later pass) can implement that PHP endpoint set on your panel.

If you'd rather I skip the self-hosted API and use built-in Lovable Cloud storage instead, say so and I'll swap the provider default.

---

## Phase 1 — Pages: static and dynamic

- `/admin/pages` becomes a real list table with a **Type** column and tabs: All / Static / Dynamic / Drafts / Trash.
- Fields per page: title, url slug (auto-generated, editable, uniqueness-checked), type (static | dynamic), status, parent, template, content, SEO title/description, author, dates.
- **Static page** = fixed content authored in the editor.
- **Dynamic page** = a template bound to a content source (posts archive, category, tag, author, search, single post) with its own layout and query rules.
- `/admin/pages/new` and `/admin/pages/$id` — split editor: form + live preview panel.
- Row actions: Edit, Quick Edit (title/slug/status/type inline), Duplicate, Trash, Restore, Delete permanently. Bulk actions on selection.
- Delete and type changes are gated to the superadmin role.

## Phase 2 — Theme customizer (Elementor-style, scoped)

New `/admin/appearance` section with a left settings rail, a device toolbar (desktop / tablet / mobile) and a live preview iframe.

- **Header builder** — logo upload, layout presets, nav menu builder (drag to reorder, nesting), sticky behaviour, CTA button, per-device visibility.
- **Footer builder** — logo, link columns, social icons, sitemap block, copyright line, widget rows.
- **Parts** — each dynamic part (Home, Single Post, Post Archive, Category Archive, Search Results, 404, Ads slots) is a separately editable entity with its own section stack.
- **Sections** are typed blocks (hero, grid, rich text, image, CTA, ads slot, HTML) with per-section style controls (spacing, background, alignment) driven by the `--tt-*` tokens.
- **Global styles** — colors, typography, container width, radius, all written into the token layer.
- **Theme file editor** — a code panel for head / body-open / body-close snippets (GTM, domain verification, custom CSS/JS), per-environment, with an insert-position picker and a syntax-highlighted textarea. Snippets are stored server-side and rendered by the site root.
- Everything saves as a versioned theme document with revision history and a Publish/Discard bar.

## Phase 3 — Performance & Optimizer plugin

New `/admin/tools/performance`:

- **Speed tests** — real Google PageSpeed Insights API runs for mobile and desktop against a chosen URL. Requires a `PAGESPEED_API_KEY` secret (I'll prompt for it). Results: Core Web Vitals scorecards, a horizontal bar chart of the slowest resources (element, type, transfer size, load ms), and an Opportunities list with the estimated saving and a plain-language "how to fix" for each.
- History of past runs with a trend line so you can see regressions.
- **Image optimizer** — scans media, flags oversize/unoptimised images, converts to WebP/AVIF and regenerates sizes via the hosting API.
- **Cache purge** — one-click purge (site cache + Cloudflare, see Phase 4) with per-URL purge.
- **Database tools** — table sizes, overhead, optimize/repair actions, cleanup of revisions, transients, orphaned rows.
- **File cleanup** — unused uploads, stale logs, temp files, with a dry-run preview before deleting.

## Phase 4 — Security tab + Cloudflare

New `/admin/security`:

- Overview: live threat/event feed, blocked requests, failed logins, file-integrity and permissions checks, SSL/HSTS/header audit with pass-fail rows.
- Controls: login rate-limiting, 2FA enforcement, IP allow/deny lists, security header toggles — each writing through the provider API.
- **Cloudflare submenu** — connect with an API token + Zone ID (stored as secrets, never rendered back), then: zone analytics, firewall/WAF rule list with create/edit/toggle, bot fight and security level, cache purge (all / by URL), Always Use HTTPS and other zone settings. All calls run server-side; the token never reaches the browser.

## Phase 5 — Responsive admin, three tiers

- Distinct layouts rather than one shrinking layout: **desktop** (persistent sidebar + multi-column), **tablet** (icon rail, two-column, drawer sub-panels), **mobile** (bottom tab bar for the top five sections, full-screen drawers, card lists instead of tables, sticky action bar).
- Editors and the customizer get purpose-built mobile flows (stepped panels instead of side-by-side).
- Tap targets ≥44px, safe-area insets, keyboard/focus behaviour audited on each tier.

---

## Technical notes

- Routes under `src/routes/_admin/`, one file per screen, following the existing `createFileRoute("/_admin/admin/...")` convention.
- Server functions in `src/lib/*.functions.ts`; secrets (`CMS_API_BASE_URL`, `CMS_API_TOKEN`, `PAGESPEED_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) read inside handlers only.
- Charts via a light Recharts bar/line setup, themed with `--tt-*` tokens.
- Reuse `ListTable`, `TableControls`, `Postbox`, `use-persistent-state`, `use-table-prefs`.
- Zod validation on every mutation; slug uniqueness and destructive actions checked server-side.
- Brand guard, Prettier, lint, typecheck and build stay green each phase; README gains a section per phase.

## Assumptions

- Superadmin is a single role for now; a full role matrix is out of scope unless you want it.
- Phase 2 renders the public site from the theme document — the current `/` landing page will be rewired to it.
- The PHP/REST side on your hosting is documented by me but not written unless you ask for it as a separate task.
