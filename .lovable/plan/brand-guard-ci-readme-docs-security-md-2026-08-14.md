# Brand guard CI, README docs, SECURITY.md

## 1. Banned-string CI check

New script `scripts/check-brand.mjs` (Node, no new dependencies) run via a new
`npm run check:brand` script and a CI step.

- Walks the repo with `git ls-files`, skipping `node_modules`, `dist`, `.output`,
  `package-lock.json`, `src/routeTree.gen.ts`, `.lovable/plan/**` (archived plans are history),
  and the script itself.
- Fails (exit 1) with `file:line` output for any match of:
  - `WordPress` / `wordpress` / `wp-admin:` (localStorage prefix) / `--wp-` / `wp-mock`
  - `Lovable App`, `Lovable Generated Project`, `lovable-error-reporting`,
    "Made with Lovable"-style ownership text, `lovable.app` URLs in docs/source
  - stale contact info: any email that is not `hello@techtrick.com.bd`
    (restricted to a simple check for `@lovable.dev` and `@wordpress.org`)
- Explicit allowlist so legitimate code keeps passing:
  - `src/routes/wp-admin.index.tsx` and `src/routes/wp-admin.$.tsx` — legacy redirect routes
  - `@lovable.dev/vite-tanstack-config` in `package.json` (build toolchain dependency)
  - `src/hooks/use-persistent-state.ts` legacy-key migration constant
    The allowlist lives at the top of the script as a small array of `{ pattern, allowedIn }`
    entries so future exceptions are one line.

CI: add `- run: npm run check:brand` to `.github/workflows/ci.yml` right after `npm ci`,
so a reintroduced string fails fast before lint/typecheck/build.

## 2. README — Development and Self-hosting

Add two new sections after "Quick start":

**Development**

- Prerequisites (Node 20+, npm 10+), clone/install/run steps, dev URL `http://localhost:8080`
- Full script table: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`, `check:brand`
- Pre-PR checklist (`npm run lint`, `npx tsc --noEmit`, `npm run check:brand`, `npm run build`)
- Conventions: routes are file-based in `src/routes` (never edit `routeTree.gen.ts`),
  design tokens `--tt-*`, `techtrick:` localStorage prefix, SSR-safe browser API usage

**Self-hosting**

- Build with `npm run build`, what lands in the output directory
- Serving the production build locally with `npm run preview`
- Deploy notes for a static/node host and for edge platforms, environment variables
  (none required today — the app ships with mock data), and where to swap in a real
  data source (`src/data/cms-mock.ts`)
- Reverse-proxy/base-path notes and a reminder that `/` redirects to `/admin`

## 3. SECURITY.md

New root file with: supported versions table (1.x supported), private reporting via
[hello@techtrick.com.bd](mailto:hello@techtrick.com.bd) with the subject prefix
`[SECURITY]`, what to include in a report (version, steps, impact, PoC),
response targets (acknowledge within 3 business days, triage within 7, fix or
mitigation plan within 30), coordinated-disclosure policy, out-of-scope items
(mock data, missing backend auth — this is a front-end demo), and a note that
GitHub private security advisories are also accepted.

`CONTRIBUTING.md` and `.github/ISSUE_TEMPLATE/bug_report.md` get one line each
pointing at SECURITY.md instead of public issues for vulnerabilities.

## Verification

Run `npm run check:brand` (expect pass), then temporarily grep-verify it catches a
planted "WordPress" string, and re-run typecheck.
