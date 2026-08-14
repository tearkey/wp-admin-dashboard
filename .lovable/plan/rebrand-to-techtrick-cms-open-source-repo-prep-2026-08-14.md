# Rebrand to Techtrick CMS + open-source repo prep

Full rebrand: every visible "WordPress" string, every internal `wp-*` name, and all Lovable
ownership references become Techtrick CMS / Techtrick Technologies.

## Brand values used everywhere

- Product name: **Techtrick CMS**
- Author / copyright: **Techtrick Technologies**
- Website: **www.techtrick.com.bd**
- Contact: **hello@techtrick.com.bd**
- License: MIT (2026, Techtrick Technologies)

## 1. Visible text and metadata

- Admin bar "About WordPress" → "About Techtrick CMS"; site tagline "Just another WordPress
  site" → "Just another Techtrick CMS site".
- Dashboard welcome copy, "WordPress Events and News" widget → "Techtrick News and Events",
  "WordPress {version} running…" → "Techtrick CMS {version} running…".
- Settings: "WordPress Address (URL)" → "Techtrick CMS Address (URL)".
- Mock data: commenter name, sample emails, meetup/news items reworded to Techtrick.
- Route `head()` metadata on every screen (dashboard, posts, pages, comments, settings)
  rewritten with Techtrick titles/descriptions; `__root.tsx` gets author
  "Techtrick Technologies" and generic Techtrick CMS defaults instead of "Lovable App".

## 2. URLs

- `/wp-admin/*` becomes `/admin/*` (dashboard, posts, pages, comments, settings).
- `/` keeps redirecting to the dashboard, now `/admin`.
- A catch-all route keeps old `/wp-admin/...` links working via permanent redirect to the
  matching `/admin/...` path.

## 3. Internal names (code-level)

- Route files: `src/routes/_wpadmin/` → `src/routes/_admin/`, files renamed
  `admin.index.tsx`, `admin.posts.tsx`, etc., with matching `createFileRoute` strings.
- Components: `src/components/wp/` → `src/components/cms/`; imports updated.
- Data: `src/data/wp-mock.ts` → `src/data/cms-mock.ts`.
- CSS tokens: `--wp-*` / `bg-wp-*` / `text-wp-*` → `--tt-*` / `bg-tt-*` …; the sticky-offset
  variable `--wp-bar-h` → `--tt-bar-h`; `font-wp` → `font-tt`; `data-wp-adminbar` →
  `data-tt-adminbar`.
- localStorage prefix `wp-admin:` → `techtrick:`, with a one-time migration on first load
  that copies existing `wp-admin:*` keys to the new prefix so saved filters, column
  visibility, density, sidebar and widget states survive the rename.

## 4. Remove Lovable ownership

- `src/lib/lovable-error-reporting.ts` → `src/lib/error-reporting.ts`: keep the same
  behaviour but with neutral naming (`reportError`, internal `globalThis` hooks kept
  optional so nothing breaks) and no Lovable branding in comments.
- `AGENTS.md`: drop the Lovable sync block; replace with contributor-facing notes.
- `README.md`: rewritten from scratch (see below).
- `package.json` `name` → `techtrick-cms`, plus `description`, `author`, `homepage`,
  `repository`, `bugs`, `license: MIT`.

## 5. Open-source repo files

- `LICENSE` — MIT, "Copyright (c) 2026 Techtrick Technologies".
- `README.md` — what Techtrick CMS is, screenshot-free feature list, quick start
  (`npm i`, `npm run dev`), project structure, tech stack, license, and contact
  (www.techtrick.com.bd / hello@techtrick.com.bd).
- `CONTRIBUTING.md` — branch/PR flow, lint + typecheck commands, commit style, contact.
- `CODE_OF_CONDUCT.md` — Contributor Covenant, enforcement email hello@techtrick.com.bd.
- `.github/workflows/ci.yml` — Node 20, install, `npm run lint`, `npm run build` on push/PR.
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`, plus
  `.github/pull_request_template.md`.

## Notes and assumptions

- This stays a front-end demo with mock data; no PHP and no backend is introduced.
- Devendency `@lovable.dev/vite-tanstack-config` stays — it is the build toolchain this
  project runs on and removing it would break the app. It is a build dependency, not an
  ownership claim.
- Verification: typecheck, then a browser pass over `/admin`, `/admin/posts` and
  `/admin/comments` at mobile and desktop widths to confirm styling tokens and persisted
  state still work after the rename.

## On GitHub

Yes — GitHub is the right home for this. Once the rebrand lands, connect the project to
GitHub from the chat "+" menu → GitHub; that pushes the full codebase to a repo you own,
where the LICENSE, CI workflow and issue templates above take effect immediately.
