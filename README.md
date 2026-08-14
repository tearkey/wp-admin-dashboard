# Techtrick CMS

An open-source, TypeScript content-management admin dashboard — a fast, accessible,
fully responsive admin experience built with React and TanStack Start.

Maintained by [Techtrick Technologies](https://www.techtrick.com.bd).

## Features

- Classic admin shell: fixed admin bar, collapsible sidebar with fly-out submenus
- Dashboard widgets — At a Glance, Activity, Quick Draft, Site Health, News and Events
- List tables for Posts, Pages and Comments with bulk actions, filters and row actions
- Per-table column visibility, row density (default / compact) and a one-click reset
- Screen Options and Help drawers
- Mobile-first: off-canvas sidebar with focus trapping, sticky filter bar, collapsible widgets
- All UI state (sidebar, widgets, filters, columns, density, scroll position) persists in
  `localStorage` and syncs live across browser tabs
- Fully typed, SSR-safe, zero backend required (ships with mock data)

## Quick start

```sh
git clone <your-fork-url>
cd techtrick-cms
npm install
npm run dev
```

The app runs at `http://localhost:8080` and `/` redirects to `/admin`.

## Development

### Prerequisites

- Node.js 20 or newer (`node -v`)
- npm 10 or newer (`npm -v`) — pnpm/bun/yarn work too, but CI uses npm

### Run it locally

```sh
git clone https://github.com/techtrick/techtrick-cms.git
cd techtrick-cms
npm install          # install dependencies
npm run dev          # start the dev server with HMR
```

Open `http://localhost:8080`. The root path `/` redirects to `/admin`; legacy
`/wp-admin/*` URLs permanently redirect to their `/admin/*` equivalent.
No environment variables or backend are required — the app ships with mock data.

### Scripts

| Script                | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Dev server with hot module replacement on port 8080           |
| `npm run build`       | Production build                                              |
| `npm run build:dev`   | Production build in development mode (source maps, no minify) |
| `npm run preview`     | Serve the built output locally                                |
| `npm run lint`        | ESLint (includes Prettier rules)                              |
| `npm run format`      | Rewrite files with Prettier                                   |
| `npm run check:brand` | Fail on retired branding strings (see below)                  |
| `npx tsc --noEmit`    | Type check                                                    |

### Before opening a pull request

```sh
npm run lint
npx tsc --noEmit
npm run check:brand
npm run build
```

All four run in CI on every push and pull request.

### Brand guard

`scripts/check-brand.mjs` scans every tracked file and fails the build if retired
branding (WordPress references, old `--wp-*` tokens, Lovable ownership text) is
reintroduced. Legitimate exceptions — the legacy redirect routes and the one-time
`localStorage` migration — are listed in the `RULES[].allowedIn` arrays at the top of
that script. Add a new entry there only with a clear reason.

### Conventions

- Routing is file-based under `src/routes`. Create the route file before linking to it,
  and never hand-edit the generated `src/routeTree.gen.ts`.
- Admin screens live in `src/routes/_admin`; UI primitives in `src/components/cms`.
- Use the `--tt-*` design tokens in `src/styles.css` (`bg-tt-*`, `text-tt-*`) — no
  hard-coded colors.
- Persisted UI state goes through `src/hooks/use-persistent-state.ts` with the
  `techtrick:` prefix (cross-tab synced and SSR-safe).
- Keep the app SSR-safe: read `localStorage`, `window`, and dates inside effects, never
  during render, and format dates with an explicit `timeZone` to avoid hydration
  mismatches.

## Self-hosting

### Build

```sh
npm ci
npm run build
```

The build emits a server bundle plus hashed client assets into `.output/`
(`.output/public` holds the static assets). Serve the built app locally to verify:

```sh
npm run preview
```

### Deploying

- **Node / container hosts** — copy `.output/` and run the generated server entry
  (`node .output/server/index.mjs`) behind your process manager. Any Node 20+ runtime works.
- **Edge platforms (Cloudflare Workers, Netlify, Vercel)** — point the platform at
  `npm run build` and let it pick up `.output/`. The app targets an edge-compatible
  runtime out of the box.
- **Static-only hosting** — the demo has no server logic, so `.output/public` can be
  served as a static site provided you enable SPA fallback to `index.html`.

### Configuration

- **Environment variables:** none required today. Client-side variables must be prefixed
  `VITE_` to reach the browser; server-only values stay in `process.env`.
- **Reverse proxy:** forward the whole host to the app and preserve the original path —
  the router owns `/admin/*` and the legacy `/wp-admin/*` redirects. Set
  `X-Forwarded-Proto` so absolute URLs resolve correctly.
- **HTTPS and headers:** terminate TLS at your proxy and add your own security headers
  (HSTS, CSP, `X-Content-Type-Options`) there.

### Swapping in real data

Every screen reads from `src/data/cms-mock.ts` through `src/hooks/use-dashboard-data.ts`.
Replace that module with real API or database calls (TanStack Query is already wired up)
and no other change is needed. Add authentication before exposing the admin publicly —
the demo has none.

## Project structure

```text
src/
  components/cms/   admin shell + list-table primitives (AdminBar, AdminMenu, ListTable, ...)
  data/             cms-mock.ts — replace with your own data source
  hooks/            persistence, focus trap, table prefs, scroll restore
  routes/
    __root.tsx      app shell and document head
    index.tsx       redirects to /admin
    _admin/         admin layout and screens (/admin, /admin/posts, ...)
  styles.css        design tokens (--tt-*) and Tailwind theme
```

## Using your own data

Every screen reads from `src/data/cms-mock.ts` through `src/hooks/use-dashboard-data.ts`.
Swap that module for API calls (TanStack Query is already installed) and the UI needs
no other change.

## Tech stack

TanStack Start · TanStack Router · TanStack Query · React 19 · TypeScript · Tailwind CSS v4 · Vite

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

## License

MIT © 2026 Techtrick Technologies — see [LICENSE](LICENSE).

## Contact

- Website: [www.techtrick.com.bd](https://www.techtrick.com.bd)
- Email: [hello@techtrick.com.bd](mailto:hello@techtrick.com.bd)
