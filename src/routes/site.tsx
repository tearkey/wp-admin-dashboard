import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useThemeConfig } from "@/hooks/use-theme-config";

export const Route = createFileRoute("/site")({
  component: SiteLayout,
});

function SiteLayout() {
  const { theme } = useThemeConfig();
  const { pages } = useCmsPages();

  return (
    <div className="flex min-h-screen flex-col bg-tt-body font-tt">
      <SiteHeader theme={theme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter theme={theme} pages={pages} />
    </div>
  );
}
