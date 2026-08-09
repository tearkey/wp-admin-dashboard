# WordPress Admin Dashboard Clone (TypeScript)

Rebuild the WordPress `wp-admin` dashboard as a pixel-faithful TypeScript/React app in this project.

## Assumptions (please correct any that are wrong)

- The request says "implement in PHP" but also "write it in TypeScript". This project is a TanStack Start + React + TypeScript app and cannot run PHP, so the deliverable is **TypeScript**. No PHP will be written.
- Scope is the **admin dashboard shell + Dashboard home screen** (`/wp-admin/index.php`), not the entire wp-admin (no full post editor, media library uploader, or plugin installer).
- Data is **local mock data** in typed modules to start. No backend, no new dependencies beyond what the project already has (React, TanStack Router/Query, Tailwind, shadcn, lucide-react).
- If you later want it wired to a real WordPress site, the project has a WordPress connector available — that is a follow-up, not part of this build.

## What gets built

### Admin chrome (matches wp-admin layout)

```text
+--------------------------------------------------------------+
| Admin bar (dark #1d2327): W logo, site name, comments, +New  |
+---------+----------------------------------------------------+
| Sidebar | Screen title "Dashboard"  [Screen Options] [Help]  |
| menu    +----------------------------------------------------+
| (#1d2327| Widget grid (2 cols, draggable-looking postboxes)  |
|  links, |  - At a Glance                                     |
|  icons, |  - Activity                                        |
|  flyout |  - Quick Draft                                     |
|  submenu|  - WordPress Events and News                       |
|  on     |  - Site Health Status                              |
|  hover) |                                                    |
+---------+----------------------------------------------------+
```

- **Admin bar**: fixed top, 32px, WP logo menu, site name with "Visit Site", comment bubble count, "+ New" dropdown, "Howdy, admin" with avatar.
- **Sidebar menu**: Dashboard, Posts, Media, Pages, Comments, Appearance, Plugins, Users, Tools, Settings — each with the correct Dashicon-equivalent icon, active-state highlight (blue left border + `#2271b1` background), expandable submenus, and a "Collapse menu" toggle at the bottom that shrinks to the icon-only rail.
- **Responsive**: below 782px the sidebar collapses to icons/off-canvas, matching WP's mobile behavior.

### Dashboard widgets

- **At a Glance** — post/page/comment counts, WP version + theme line.
- **Activity** — Recently Published list, Recent Comments with hover row actions (Approve, Reply, Edit, Spam, Trash).
- **Quick Draft** — title input, content textarea, "Save Draft" button, "Your Recent Drafts" list. Saving appends to in-memory state and shows in the drafts list.
- **WordPress Events and News** — location line + event/news feed items.
- **Site Health Status** — status donut + "Should be improved" summary with issue counts.
- **Screen Options** panel — toggles which widgets are visible and 1/2-column layout; state persists to `localStorage`.
- **Help** panel — collapsible tab drawer like wp-admin.

### Routes

```
/                    -> redirect to /wp-admin
/wp-admin            -> Dashboard home (widgets)
/wp-admin/posts      -> Posts list table (WP list-table styling)
/wp-admin/pages      -> Pages list table
/wp-admin/comments   -> Comments list table
/wp-admin/settings   -> General Settings form
```

Non-dashboard routes get realistic WP list tables (bulk-action select, column headers, row actions, pagination, "N items") so sidebar navigation isn't dead. Each route defines its own `head()` metadata.

## Technical notes

- `src/routes/_wpadmin/` pathless layout renders the admin bar + sidebar + `<Outlet />`; every admin screen is a child of it.
- Design tokens added to `src/styles.css` as semantic oklch variables mirroring the WP admin palette (`--wp-admin-bg #1d2327`, `--wp-blue #2271b1`, `--wp-highlight #2c3338`, `--wp-body #f0f0f1`, `--wp-border #c3c4c7`). No hardcoded hex in components.
- Typography: system font stack (`-apple-system, "Segoe UI", Roboto, ...`) exactly as WP uses; 13px base for admin chrome.
- Icons: `lucide-react` mapped one-to-one to the Dashicons WP uses (no icon-font dependency).
- Mock data lives in `src/data/wp-mock.ts` with exported TS interfaces (`Post`, `Comment`, `SiteHealthIssue`, `ActivityItem`); widgets read from it via a small `useDashboardData()` hook so swapping in a real API later is a one-file change.
- Widget visibility/column state in a `useScreenOptions()` hook backed by `localStorage`, read inside `useEffect` to avoid hydration mismatch.
- Postbox open/closed toggling and Quick Draft submission are local React state — no server round-trip.
- No new npm packages.

## Build order

1. Design tokens + admin layout shell (admin bar, sidebar, collapse toggle, responsive rules).
2. Postbox primitive + widget grid with Screen Options.
3. The five dashboard widgets with mock data.
4. List-table primitive + Posts / Pages / Comments screens.
5. Settings screen, Help drawer, per-route metadata, final polish pass against wp-admin reference.
