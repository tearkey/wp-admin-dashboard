import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageEditor } from "@/components/cms/PageEditor";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/_admin/admin/pages/$id")({
  head: () => ({
    meta: [
      { title: "Edit Page — Techtrick CMS" },
      { name: "description", content: "Edit page content, slug, template, type and SEO fields." },
      { property: "og:title", content: "Edit Page — Techtrick CMS" },
      { property: "og:description", content: "Edit a static or dynamic page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditPageScreen,
});

function EditPageScreen() {
  const { id } = useParams({ from: "/_admin/admin/pages/$id" });
  const navigate = useNavigate();
  const { pages, update, trash } = useCmsPages();
  const { isSuperadmin } = useRole();
  const page = pages.find((p) => p.id === id);

  if (!page) {
    return (
      <div className="px-3 pt-6 sm:px-5">
        <h1 className="text-[23px] text-tt-text">Page not found</h1>
        <Link to="/admin/pages" className="text-[13px] text-tt-blue hover:underline">
          Back to all pages
        </Link>
      </div>
    );
  }

  return (
    <PageEditor
      key={page.id}
      heading="Edit Page"
      value={page}
      parents={pages.filter((p) => p.kind === "static" && p.id !== page.id && p.status !== "trash")}
      canDelete={isSuperadmin}
      onSave={(draft) => {
        update(page.id, draft);
        toast.success("Page saved.");
      }}
      onDelete={() => {
        trash(page.id);
        toast.success("Page moved to Trash.");
        navigate({ to: "/admin/pages" });
      }}
    />
  );
}
