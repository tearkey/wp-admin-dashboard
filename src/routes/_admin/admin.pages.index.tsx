import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Column, ListTable } from "@/components/cms/ListTable";
import { FilterTabs } from "@/components/cms/ListToolbar";
import { TableControls } from "@/components/cms/TableControls";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useRole } from "@/hooks/use-role";
import { useScrollRestore } from "@/hooks/use-scroll-restore";
import { useTablePrefs } from "@/hooks/use-table-prefs";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { CmsPage } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/pages/")({
  head: () => ({
    meta: [
      { title: "Pages — Techtrick CMS" },
      {
        name: "description",
        content: "Manage static and dynamic pages: content, slugs, templates and publishing.",
      },
      { property: "og:title", content: "Pages — Techtrick CMS" },
      {
        property: "og:description",
        content: "Static and dynamic page management for Techtrick CMS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PagesScreen,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
});

type Tab = "all" | "static" | "dynamic" | "draft" | "trash";

function PagesScreen() {
  const navigate = useNavigate();
  const { pages, counts, duplicate, trash, restore, remove } = useCmsPages();
  const { isSuperadmin } = useRole();
  const prefs = useTablePrefs("pages");
  const [tab, setTab] = usePersistentState<Tab>("pages:tab", "all");
  const [search, setSearch] = usePersistentState("pages:search", "");
  const [selected, setSelected] = useState<string[]>([]);
  useScrollRestore("pages");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages
      .filter((p) => {
        if (tab === "trash") return p.status === "trash";
        if (p.status === "trash") return false;
        if (tab === "static") return p.kind === "static";
        if (tab === "dynamic") return p.kind === "dynamic";
        if (tab === "draft") return p.status === "draft";
        return true;
      })
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [pages, tab, search]);

  const guard = (fn: () => void, message: string) => {
    if (!isSuperadmin) {
      toast.error("Only a superadmin can do that.");
      return;
    }
    fn();
    toast.success(message);
  };

  const columns: Column<CmsPage>[] = [
    {
      id: "title",
      label: "Title",
      className: "md:w-[40%]",
      render: (p) => (
        <>
          <Link
            to="/admin/pages/$id"
            params={{ id: p.id }}
            className="text-left font-semibold text-tt-blue hover:underline"
          >
            {p.title || "(no title)"}
          </Link>
          {p.status !== "publish" && (
            <span className="ml-1.5 font-semibold capitalize"> — {p.status}</span>
          )}
          <div className="text-[12px] break-all text-tt-muted">/{p.slug}</div>
          <div className="mt-0.5 text-[13px] md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
            <Link
              to="/admin/pages/$id"
              params={{ id: p.id }}
              className="text-tt-blue hover:underline"
            >
              Edit
            </Link>
            <span className="text-tt-muted"> | </span>
            <button
              type="button"
              onClick={() => guard(() => duplicate(p.id), "Page duplicated.")}
              className="text-tt-blue hover:underline"
            >
              Duplicate
            </button>
            <span className="text-tt-muted"> | </span>
            {p.status === "trash" ? (
              <>
                <button
                  type="button"
                  onClick={() => guard(() => restore(p.id), "Page restored.")}
                  className="text-tt-blue hover:underline"
                >
                  Restore
                </button>
                <span className="text-tt-muted"> | </span>
                <button
                  type="button"
                  onClick={() => guard(() => remove(p.id), "Page deleted permanently.")}
                  className="text-tt-red hover:underline"
                >
                  Delete permanently
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => guard(() => trash(p.id), "Page moved to Trash.")}
                className="text-tt-red hover:underline"
              >
                Trash
              </button>
            )}
          </div>
        </>
      ),
    },
    {
      id: "kind",
      label: "Type",
      className: "w-[7em]",
      render: (p) => (
        <span
          className={cn(
            "inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize",
            p.kind === "dynamic"
              ? "bg-tt-blue text-tt-menu-text"
              : "border border-tt-border text-tt-muted",
          )}
        >
          {p.kind}
        </span>
      ),
    },
    {
      id: "template",
      label: "Template",
      className: "hidden md:table-cell",
      render: (p) => <span className="text-tt-muted">{p.template}</span>,
    },
    {
      id: "author",
      label: "Author",
      className: "hidden md:table-cell",
      render: (p) => <span className="text-tt-blue">{p.author}</span>,
    },
    {
      id: "date",
      label: "Date",
      className: "hidden w-[12em] md:table-cell",
      render: (p) => (
        <>
          <div>{p.status === "publish" ? "Published" : "Last Modified"}</div>
          <div className="text-tt-muted">{dateFmt.format(new Date(p.updatedAt))}</div>
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
            content: (
              <p>
                Static pages hold fixed content. Dynamic pages are templates bound to a content
                source (archives, search, single post) and render a loop of items.
              </p>
            ),
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">Pages</h1>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/pages/new" })}
          className="h-[26px] rounded border border-tt-blue px-2 text-[13px] text-tt-blue hover:bg-tt-blue hover:text-tt-menu-text"
        >
          Add New Page
        </button>
      </div>
      <ListTable
        rows={rows}
        columns={columns}
        rowKey={(p) => p.id}
        emptyLabel="No pages found."
        hiddenColumnIds={prefs.hidden}
        density={prefs.density}
        selected={selected}
        onSelectionChange={(next) => setSelected(next.map(String))}
        toolbar={
          <div className="mb-2 space-y-2">
            <FilterTabs
              tabs={
                [
                  ["all", "All", counts.all],
                  ["static", "Static", counts.static],
                  ["dynamic", "Dynamic", counts.dynamic],
                  ["draft", "Drafts", counts.draft],
                  ["trash", "Trash", counts.trash],
                ] as const
              }
              value={tab}
              onChange={setTab}
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pages"
                aria-label="Search pages"
                className="min-h-11 flex-1 rounded border border-tt-border bg-tt-surface px-2 text-[13px] md:h-[30px] md:min-h-0 md:max-w-[240px]"
              />
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    guard(() => {
                      selected.forEach(trash);
                      setSelected([]);
                    }, "Selected pages moved to Trash.")
                  }
                  className="min-h-11 rounded border border-tt-border px-3 text-[13px] text-tt-red md:h-[30px] md:min-h-0"
                >
                  Trash selected ({selected.length})
                </button>
              )}
            </div>
            <TableControls
              columns={columns
                .filter((c) => c.id !== "title")
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
