# Contributing to Techtrick CMS

Thanks for helping improve Techtrick CMS. This project is maintained by
Techtrick Technologies and released under the MIT license.

## Getting started

```sh
npm install
npm run dev
```

## Workflow

1. Fork the repository and create a branch: `feat/short-description` or `fix/short-description`.
2. Make focused changes — one concern per pull request.
3. Run the checks below before pushing.
4. Open a pull request describing the change, the motivation, and how you tested it.
   Include before/after screenshots for UI changes (mobile and desktop where relevant).

## Checks

```sh
npm run lint
npm run build
npx tsc --noEmit
npm run format
```

All three must pass. Please keep the app SSR-safe: read `localStorage` and other
browser APIs inside effects, never during render.

## Commit style

Conventional commits are preferred:

```text
feat: add bulk edit to the posts table
fix: keep sticky toolbar offset correct on orientation change
docs: clarify data source swap in README
```

## Code style

- TypeScript everywhere; avoid `any`.
- Use the design tokens in `src/styles.css` (`bg-tt-*`, `text-tt-*`) instead of hard-coded colors.
- Keep components small and colocated under `src/components/cms/`.
- Preserve accessibility: keyboard navigation, ARIA labels, focus management, 44px tap targets.

## Reporting issues

Use the GitHub issue templates. For security concerns, email
[hello@techtrick.com.bd](mailto:hello@techtrick.com.bd) instead of opening a public issue.

## Questions

- Website: [www.techtrick.com.bd](https://www.techtrick.com.bd)
- Email: [hello@techtrick.com.bd](mailto:hello@techtrick.com.bd)
