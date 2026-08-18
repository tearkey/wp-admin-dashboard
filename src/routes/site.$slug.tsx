import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCmsPages } from "@/hooks/use-cms-pages";

export const Route = createFileRoute("/site/$slug")({
  head: () => ({
    meta: [
      { title: "Page — Techtrick CMS site" },
      { name: "description", content: "A published page rendered from Techtrick CMS content." },
      { property: "og:title", content: "Page — Techtrick CMS site" },
      {
        property: "og:description",
        content: "A published page rendered from Techtrick CMS content.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SitePage,
});

function SitePage() {
  const { slug } = useParams({ from: "/site/$slug" });
  const { pages } = useCmsPages();
  const page = pages.find((p) => p.slug === slug && p.status === "publish");

  if (!page) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-[24px] font-semibold text-tt-text">Page not found</h1>
        <p className="mt-2 text-[14px] text-tt-muted">
          No published page matches /{slug}.{" "}
          <Link to="/site" className="text-tt-blue hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded border border-tt-border bg-tt-surface p-6">
        <h1 className="text-[26px] font-semibold text-tt-text">{page.title}</h1>
        <div className="mt-1 text-[12px] text-tt-muted">
          {page.kind} page · /{page.slug} · {page.template}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[15px] text-tt-text">{page.content}</p>
      </div>
    </article>
  );
}
