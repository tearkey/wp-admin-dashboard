import { createFileRoute } from "@tanstack/react-router";
import { Column, ListTable, RowActions } from "@/components/wp/ListTable";
import { TableControls } from "@/components/wp/TableControls";
import { ScreenMeta } from "@/components/wp/ScreenMeta";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useScrollRestore } from "@/hooks/use-scroll-restore";
import { useTablePrefs } from "@/hooks/use-table-prefs";
import type { WpPage } from "@/data/wp-mock";


export const Route = createFileRoute("/_wpadmin/wp-admin/pages")({
  head: () => ({
    meta: [
      { title: "Pages — WP Admin" },
      { name: "description", content: "Manage every static page on the site from one list table." },
      { property: "og:title", content: "Pages — WP Admin" },
      { property: "og:description", content: "All pages with authors, comment counts and dates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PagesScreen,
});

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function PagesScreen() {
  const { pages } = useDashboardData();

  const columns: Column<WpPage>[] = [
    {
      id: "title",
      label: "Title",
      className: "md:w-[45%]",
      render: (p) => (
        <>
          <button type="button" className="text-left font-semibold text-wp-blue hover:underline">
            {p.title}
          </button>
          {p.status === "draft" && <span className="ml-1.5 font-semibold"> — Draft</span>}
          <RowActions
            actions={[
              { label: "Edit" },
              { label: "Quick Edit" },
              { label: "Trash", danger: true },
              { label: "View" },
            ]}
          />
        </>
      ),
    },
    { id: "author", label: "Author", className: "hidden md:table-cell", render: (p) => <span className="text-wp-blue">{p.author}</span> },
    {
      id: "comments",
      label: "Comments",
      className: "hidden w-[6em] text-center sm:table-cell",
      render: (p) => <span className="text-wp-muted">{p.comments}</span>,
    },
    {
      id: "date",
      label: "Date",
      className: "hidden w-[12em] md:table-cell",
      render: (p) => (
        <>
          <div>{p.status === "publish" ? "Published" : "Last Modified"}</div>
          <div className="text-wp-muted">{dateFmt.format(new Date(p.date))}</div>
        </>
      ),
    },
  ];

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: <p>Pages are static and sit outside the chronological post stream.</p>,
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-wp-text">Pages</h1>
        <button
          type="button"
          className="h-[26px] rounded border border-wp-blue px-2 text-[13px] text-wp-blue hover:bg-wp-blue hover:text-wp-menu-text"
        >
          Add New Page
        </button>
      </div>
      <ListTable rows={pages} columns={columns} rowKey={(p) => p.id} emptyLabel="No pages found." />
    </div>
  );
}
