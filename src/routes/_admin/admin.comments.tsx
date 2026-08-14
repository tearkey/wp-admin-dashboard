import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Column, ListTable } from "@/components/cms/ListTable";
import { FilterTabs } from "@/components/cms/ListToolbar";
import { TableControls } from "@/components/cms/TableControls";

import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useScrollRestore } from "@/hooks/use-scroll-restore";
import { useTablePrefs } from "@/hooks/use-table-prefs";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import type { CommentStatus, WpComment } from "@/data/cms-mock";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_admin/admin/comments")({
  head: () => ({
    meta: [
      { title: "Comments — WP Admin" },
      {
        name: "description",
        content: "Moderate comments: approve, unapprove, mark as spam or move to trash.",
      },
      { property: "og:title", content: "Comments — WP Admin" },
      { property: "og:description", content: "The Techtrick CMS comment moderation queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommentsScreen,
});

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Filter = "all" | CommentStatus;

function CommentsScreen() {
  const { comments, counts, setCommentStatus } = useDashboardData();
  const [filter, setFilter] = usePersistentState<Filter>("comments:filter", "all");
  const prefs = useTablePrefs("comments");
  useScrollRestore("comments");


  const rows = useMemo(
    () =>
      comments.filter((c) =>
        filter === "all" ? c.status !== "spam" && c.status !== "trash" : c.status === filter,
      ),
    [comments, filter],
  );

  const columns: Column<WpComment>[] = [
    {
      id: "author",
      label: "Author",
      className: "w-[10em] sm:w-[15em]",
      render: (c) => (
        <>
          <div className="font-semibold text-tt-text">{c.author}</div>
          <div className="text-tt-muted">{c.authorEmail}</div>
        </>
      ),
    },
    {
      id: "comment",
      label: "Comment",
      render: (c) => (
        <>
          <div className="mb-1 text-tt-muted">{dateFmt.format(new Date(c.date))}</div>
          <p className="text-tt-text">{c.content}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-1 text-[13px] opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
            {c.status === "pending" ? (
              <Act onClick={() => setCommentStatus(c.id, "approved")}>Approve</Act>
            ) : (
              <Act onClick={() => setCommentStatus(c.id, "pending")}>Unapprove</Act>
            )}
            <Sep />
            <Act>Reply</Act>
            <Sep />
            <Act>Edit</Act>
            <Sep />
            <Act danger onClick={() => setCommentStatus(c.id, "spam")}>
              Spam
            </Act>
            <Sep />
            <Act danger onClick={() => setCommentStatus(c.id, "trash")}>
              Trash
            </Act>
          </div>
        </>
      ),
    },
    {
      id: "post",
      label: "In response to",
      className: "hidden w-[14em] md:table-cell",
      render: (c) => (
        <button type="button" className="text-left text-tt-blue hover:underline">
          {c.postTitle}
        </button>
      ),
    },
  ];

  const tabs = [
    ["all", "All", comments.filter((c) => c.status === "approved" || c.status === "pending").length],
    ["pending", "Pending", counts.pendingComments],
    ["approved", "Approved", counts.comments],
    ["spam", "Spam", counts.spamComments],
    ["trash", "Trash", comments.filter((c) => c.status === "trash").length],
  ] as const;

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "moderating",
            label: "Moderating Comments",
            content: (
              <p>
                Hover a comment row to reveal the moderation actions. Status changes apply
                immediately and update the counts above.
              </p>
            ),
          },
        ]}
      />
      <h1 className="mt-1 mb-3 text-[23px] leading-[1.3] font-normal text-tt-text">Comments</h1>

      <ListTable
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        bulkActions={["Bulk actions", "Approve", "Mark as spam", "Move to Trash"]}
        emptyLabel="No comments found."
        hiddenColumnIds={prefs.hidden}
        density={prefs.density}
        toolbar={
          <div className="mb-2 space-y-2">
            <FilterTabs tabs={tabs} value={filter} onChange={setFilter} />
            <TableControls
              columns={columns
                .filter((c) => c.id !== "comment")
                .map((c) => ({ id: c.id, label: c.label }))}
              hidden={prefs.hidden}
              onToggleColumn={prefs.toggleColumn}
              density={prefs.density}
              onDensityChange={prefs.setDensity}
              onReset={prefs.reset}
            />
          </div>
        }
      />

    </div>
  );
}

function Sep() {
  return <span className="text-tt-muted">|</span>;
}

function Act({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("hover:underline", danger ? "text-tt-red" : "text-tt-blue")}
    >
      {children}
    </button>
  );
}
