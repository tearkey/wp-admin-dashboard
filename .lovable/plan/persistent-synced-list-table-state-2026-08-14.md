# Persistent, synced list-table state

Four upgrades to how wp-admin screens remember what you were doing.

## 1. Scroll position restore per list page

- Each list screen (Posts, Pages, Comments) remembers its scroll position under a per-route key.
- Saved on scroll (throttled via requestAnimationFrame) and restored after the rows render.
- Restore happens after the sticky toolbar offset is measured, so the target row is never hidden under the admin bar — the saved offset accounts for the current `--wp-bar-h`.

## 2. Cross-tab sync

- Sidebar collapsed state, widget expand/collapse, and last-used filters/search update instantly in every open tab.
- Done by listening to the browser `storage` event and re-reading the value; writes in one tab immediately re-render the others.
- Same-tab consumers of the same key also stay in sync.

## 3. "Reset filters and search" button

- Added to each list toolbar (visible on mobile, also available on desktop).
- Clears that screen's stored filter, search, column visibility, density and scroll keys, and restores defaults immediately without a reload.

## 4. Per-table column visibility and density

- A "Columns" control in each list toolbar lets you show/hide non-title columns; the title column always stays.
- A density toggle (Compact / Default) changes row padding and font sizing.
- Both persist per table and restore on reload, on mobile and desktop. Responsive column hiding still applies on top: hiding a column always wins, showing one only reveals it where the screen has room.

## Technical notes

- Extend `usePersistentState` with a shared subscriber registry plus a `storage`-event listener so all hooks on the same key stay in sync across tabs and within a tab. Keep the current hydration-safe pattern (read in effect, not in the state initializer).
- Convert `Postbox` collapse state to `usePersistentState` (key `postbox:{id}`) so widgets get cross-tab sync for free; keep the mobile-default fallback when nothing is stored.
- Convert the sidebar collapse in `src/routes/_wpadmin/route.tsx` — already on `usePersistentState`, so it inherits sync automatically.
- New `useScrollRestore(key)` hook: passive scroll listener on `window`, rAF-throttled write, restore in a layout effect on mount.
- New `useTablePrefs(tableId, columns)` hook returning `{ hiddenColumns, toggleColumn, density, setDensity, reset }`, backed by `usePersistentState`.
- `ListTable` gains `density` and `hiddenColumnIds` props; `ListToolbar` gains a `TableControls` piece rendering the Columns dropdown, density toggle and Reset button with 44px touch targets.
- Posts / Pages / Comments screens wire in the hooks; Reset clears every `wp-admin:{screen}:*` key for that screen.
