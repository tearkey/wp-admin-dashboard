# Working on Techtrick CMS

Open-source admin dashboard by Techtrick Technologies (MIT).

- Stack: TanStack Start + TanStack Router/Query, React 19, TypeScript, Tailwind CSS v4.
- Routes live in `src/routes`; admin screens are under `src/routes/_admin`.
  `src/routeTree.gen.ts` is generated — never edit it.
- UI primitives live in `src/components/cms`; mock data in `src/data/cms-mock.ts`.
- Use the `--tt-*` design tokens in `src/styles.css`; never hard-code colors.
- Persisted UI state uses the `techtrick:` localStorage prefix via
  `src/hooks/use-persistent-state.ts` (cross-tab synced, SSR-safe).
- Before opening a PR: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

Contact: hello@techtrick.com.bd · www.techtrick.com.bd
