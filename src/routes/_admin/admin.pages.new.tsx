import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageEditor } from "@/components/cms/PageEditor";
import { useCmsPages } from "@/hooks/use-cms-pages";

export const Route = createFileRoute("/_admin/admin/pages/new")({
  head: () => ({
    meta: [
      { title: "Add New Page — Techtrick CMS" },
      {
        name: "description",
        content: "Create a static page or a dynamic template bound to a content source.",
      },
      { property: "og:title", content: "Add New Page — Techtrick CMS" },
      { property: "og:description", content: "Create a new static or dynamic page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewPageScreen,
});

function NewPageScreen() {
  const navigate = useNavigate();
  const { pages, create } = useCmsPages();

  return (
    <PageEditor
      heading="Add New Page"
      parents={pages.filter((p) => p.kind === "static" && p.status !== "trash")}
      value={{}}
      onSave={(draft) => {
        const page = create(draft);
        toast.success("Page created.");
        navigate({ to: "/admin/pages/$id", params: { id: page.id } });
      }}
    />
  );
}
