import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { SiteFooter, SiteHeader, ThemeStyle, themeScopeProps } from "@/components/site/SiteChrome";
import { LiveEditProvider } from "@/components/site/live-edit";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useThemeConfig } from "@/hooks/use-theme-config";

export const Route = createFileRoute("/site")({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === "1" || search.edit === true ? true : undefined,
  }),
  component: SiteLayout,
});

function SiteLayout() {
  const { theme, update } = useThemeConfig();
  const { pages } = useCmsPages();
  const { edit } = Route.useSearch();
  const editing = Boolean(edit);

  return (
    <LiveEditProvider editing={editing} update={update}>
      <div {...themeScopeProps(theme)} className="flex min-h-screen flex-col bg-tt-body font-tt">
        <ThemeStyle theme={theme} />
        {editing && (
          <div className="flex flex-wrap items-center gap-2 bg-tt-blue px-4 py-2 text-[13px] text-tt-menu-text">
            <span>Live editing — click any dashed text to change it. Edits save instantly.</span>
            <Link
              to="/site"
              className="ml-auto rounded border border-tt-menu-text/60 px-2 py-1 text-[12px]"
            >
              Done
            </Link>
            <Link
              to="/admin/theme-parts"
              className="rounded border border-tt-menu-text/60 px-2 py-1 text-[12px]"
            >
              Theme parts
            </Link>
          </div>
        )}
        <SiteHeader theme={theme} />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter theme={theme} pages={pages} />
      </div>
    </LiveEditProvider>
  );
}
