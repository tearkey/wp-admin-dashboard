import { createFileRoute } from "@tanstack/react-router";
import { ScreenMeta } from "@/components/wp/ScreenMeta";
import {
  ActivityWidget,
  AtAGlanceWidget,
  EventsNewsWidget,
  QuickDraftWidget,
  SiteHealthWidget,
} from "@/components/wp/widgets";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DASHBOARD_WIDGETS, useScreenOptions, type WidgetId } from "@/hooks/use-screen-options";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_wpadmin/wp-admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WP Admin" },
      {
        name: "description",
        content:
          "WordPress admin dashboard with At a Glance, Activity, Quick Draft, Site Health and Events widgets.",
      },
      { property: "og:title", content: "Dashboard — WP Admin" },
      {
        property: "og:description",
        content: "A faithful WordPress wp-admin dashboard rebuilt in TypeScript.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardScreen,
});

function DashboardScreen() {
  const data = useDashboardData();
  const { columns, hidden, toggleWidget, setColumns, isVisible } = useScreenOptions();

  const widgets: { id: WidgetId; node: React.ReactNode }[] = [
    { id: "at-a-glance", node: <AtAGlanceWidget data={data} /> },
    { id: "activity", node: <ActivityWidget data={data} /> },
    { id: "quick-draft", node: <QuickDraftWidget data={data} /> },
    { id: "events-news", node: <EventsNewsWidget data={data} /> },
    { id: "site-health", node: <SiteHealthWidget data={data} /> },
  ];

  const visible = widgets.filter((w) => isVisible(w.id));
  const left = columns === 1 ? visible : visible.filter((_, i) => i % 2 === 0);
  const right = columns === 1 ? [] : visible.filter((_, i) => i % 2 === 1);

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        screenOptions={
          <div className="space-y-3">
            <fieldset>
              <legend className="mb-1.5 font-semibold text-wp-text">Boxes</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {DASHBOARD_WIDGETS.map((w) => (
                  <label key={w.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={!hidden.includes(w.id)}
                      onChange={() => toggleWidget(w.id)}
                    />
                    {w.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-1.5 font-semibold text-wp-text">Layout</legend>
              <div className="flex gap-4">
                {([1, 2] as const).map((n) => (
                  <label key={n} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="columns"
                      checked={columns === n}
                      onChange={() => setColumns(n)}
                    />
                    {n} column{n > 1 ? "s" : ""}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        }
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p>
                Welcome to your WordPress Dashboard. Use Screen Options to show or hide boxes and
                choose a one- or two-column layout. Drag-free widgets keep their state per browser.
              </p>
            ),
          },
          {
            id: "help-navigation",
            label: "Navigation",
            content: (
              <p>
                The left-hand menu holds every admin section. Hover a top-level item to reveal its
                submenu, and collapse the menu with the control at the bottom.
              </p>
            ),
          },
        ]}
      />

      <h1 className="mt-1 mb-4 text-[23px] leading-[1.3] font-normal text-wp-text">Dashboard</h1>

      <div className={cn("grid gap-4", columns === 2 ? "md:grid-cols-2" : "grid-cols-1")}>
        <div>{left.map((w) => <div key={w.id}>{w.node}</div>)}</div>
        {columns === 2 && <div>{right.map((w) => <div key={w.id}>{w.node}</div>)}</div>}
      </div>
    </div>
  );
}
