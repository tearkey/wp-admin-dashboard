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

Other scripts:

```sh
npm run build     # production build
npm run lint      # eslint
npm run format    # prettier
```

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

## License

MIT © 2026 Techtrick Technologies — see [LICENSE](LICENSE).

## Contact

- Website: [www.techtrick.com.bd](https://www.techtrick.com.bd)
- Email: [hello@techtrick.com.bd](mailto:hello@techtrick.com.bd)
