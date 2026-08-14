import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Column, ListTable, RowActions } from "@/components/wp/ListTable";
import { FilterTabs } from "@/components/wp/ListToolbar";
import { TableControls } from "@/components/wp/TableControls";

import { ScreenMeta } from "@/components/wp/ScreenMeta";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useScrollRestore } from "@/hooks/use-scroll-restore";
import { useTablePrefs } from "@/hooks/use-table-prefs";
import type { PostStatus, WpPost } from "@/data/wp-mock";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_wpadmin/wp-admin/posts")({
  head: () => ({
    meta: [
      { title: "Posts — WP Admin" },
      {
        name: "description",
        content: "Browse, filter and search all posts with the WordPress list-table interface.",
      },
      { property: "og:title", content: "Posts — WP Admin" },
      { property: "og:description", content: "All posts, filterable by status, author and search." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostsScreen,
});

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
});

type Filter = "all" | PostStatus;

function PostsScreen() {
  const { posts } = useDashboardData();
  const [filter, setFilter] = usePersistentState<Filter>("posts:filter", "all");
  const [search, setSearch] = usePersistentState("posts:search", "");

  const statusCounts = useMemo(() => {
    const by = (s: PostStatus) => posts.filter((p) => p.status === s).length;
    return { all: posts.length, publish: by("publish"), draft: by("draft"), pending: by("pending") };
  }, [posts]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (filter === "all" || p.status === filter) && (!q || p.title.toLowerCase().includes(q)),
    );
  }, [posts, filter, search]);

  const columns: Column<WpPost>[] = [
    {
      id: "title",
      label: "Title",
      className: "md:w-[40%]",
      render: (p) => (
        <>
          <button type="button" className="text-left font-semibold text-wp-blue hover:underline">
            {p.title}
          </button>
          {p.status !== "publish" && (
            <span className="ml-1.5 font-semibold text-wp-text">
              — {p.status === "draft" ? "Draft" : "Pending"}
            </span>
          )}
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
      id: "categories",
      label: "Categories",
      className: "hidden lg:table-cell",
      render: (p) => (p.categories.length ? p.categories.join(", ") : "—"),
    },
    { id: "tags", label: "Tags", className: "hidden lg:table-cell", render: (p) => (p.tags.length ? p.tags.join(", ") : "—") },
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
            content: <p>This screen lists all posts. Hover a row to reveal its actions.</p>,
          },
        ]}
      />

      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-wp-text">Posts</h1>
        <button
          type="button"
          className="h-[26px] rounded border border-wp-blue px-2 text-[13px] text-wp-blue hover:bg-wp-blue hover:text-wp-menu-text"
        >
          Add New Post
        </button>
      </div>

      <ListTable
        rows={rows}
        columns={columns}
        rowKey={(p) => p.id}
        emptyLabel="No posts found."
        toolbar={
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <FilterTabs
              tabs={
                [
                  ["all", "All", statusCounts.all],
                  ["publish", "Published", statusCounts.publish],
                  ["draft", "Drafts", statusCounts.draft],
                  ["pending", "Pending", statusCounts.pending],
                ] as const
              }
              value={filter}
              onChange={setFilter}
            />
            <div className="flex w-full items-center gap-1 sm:ml-auto sm:w-auto">
              <label htmlFor="post-search" className="sr-only">
                Search posts
              </label>
              <input
                id="post-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts"
                className="h-11 w-full rounded border border-wp-border bg-wp-surface px-2 text-[16px] outline-none focus:border-wp-blue sm:w-[220px] md:h-[30px] md:text-[13px]"
              />
            </div>
          </div>
        }
      />

    </div>
  );
}
