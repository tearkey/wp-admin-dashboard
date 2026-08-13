# Mobile polish: sticky filters, accessible drawer, collapsible widgets

Three focused improvements to the wp-admin clone on small screens.

## 1. Sticky filter/search bar on list tables

On Posts, Pages and Comments, the status tabs, search field and bulk-action row scroll away immediately on a phone.

- Wrap the filter/tabs/search block and the bulk-actions row in a shared `ListToolbar` container that is `sticky` just below the 32px admin bar on mobile, with the page background and a bottom hairline so it reads as a bar when pinned.
- Static (non-sticky) from the `md` breakpoint up, matching real wp-admin.
- Touch sizing: controls get a minimum 44px tap height on mobile (tabs, select, Apply button, search input), shrinking to the current compact 26-30px on desktop.
- Status tabs become a horizontally scrollable row on mobile instead of wrapping to three lines.

## 2. Accessible off-canvas sidebar

The drawer currently opens and closes but keyboard and screen-reader users can escape into the page behind it.

- Mark the open mobile drawer as a modal dialog (`role="dialog"`, `aria-modal`, labelled "Main menu") and replace the backdrop `<button>` with a plain overlay plus a real close control inside the drawer.
- Focus moves into the drawer on open, cycles inside it while open (Tab/Shift+Tab trap), and returns to the toolbar menu button on close.
- Escape closes the drawer; body scroll is locked while it is open.
- Menu items without a destination become real focusable buttons instead of `role="link"` spans, and their submenus open on focus/Enter as well as hover so keyboards can reach them.
- The collapse control and badge counts get accurate labels (e.g. "Comments, 3 pending").

## 3. Collapsible widget cards on mobile

`Postbox` already has a collapse toggle; the dashboard just opens everything at once.

- Add an `defaultCollapsedOnMobile` behaviour: below `md`, every widget except "At a Glance" starts collapsed, so the dashboard fits roughly one screen and users expand what they need.
- Desktop keeps all widgets expanded as today.
- The whole header row becomes the toggle target on mobile (larger tap area) while keeping the chevron button semantics for assistive tech.
- Collapse state per widget persists in the existing screen-options localStorage so choices survive a reload.

## Technical notes

- New `src/components/wp/ListToolbar.tsx`; `ListTable` gains an optional `toolbar` slot so the bulk-action row can join the sticky region.
- Focus trap implemented inline in `AdminMenu` with a small `useFocusTrap` hook in `src/hooks/` — no new dependencies.
- Sticky offset uses `top-8` to sit under the fixed admin bar; z-index stays below the drawer (z-40) and bar (z-50).
- Postbox collapse state keys off the widget id already used by `use-screen-options`.
- No data, routing or backend changes.
