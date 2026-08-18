import { createFileRoute, Link } from "@tanstack/react-router";
import { PartBlock } from "@/components/site/SiteChrome";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useThemeConfig } from "@/hooks/use-theme-config";

export const Route = createFileRoute("/site/")({
  head: () => ({
    meta: [
      { title: "Techtrick CMS — Live site preview" },
      {
        name: "description",
        content:
          "The public front end rendered from your Techtrick CMS theme config and published pages.",
      },
      { property: "og:title", content: "Techtrick CMS — Live site preview" },
      {
        property: "og:description",
        content: "Header, footer and page content rendered live from the CMS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SiteHome,
});

function SiteHome() {
  const { theme } = useThemeConfig();
  const { pages } = useCmsPages();
  const home = pages.find((p) => p.slug === "" && p.status === "publish");
  const published = pages.filter((p) => p.status === "publish" && p.slug);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <article className="rounded border border-tt-border bg-tt-surface p-6">
        <h1 className="text-[26px] font-semibold text-tt-text">{home?.title ?? "Home"}</h1>
        <p className="mt-2 whitespace-pre-wrap text-[15px] text-tt-muted">
          {home?.content ?? "No published home page yet."}
        </p>
      </article>

      {theme.parts.map((part) => (
        <PartBlock key={part.id} part={part} />
      ))}

      <section className="rounded border border-tt-border bg-tt-surface p-4">
        <h2 className="text-[17px] font-semibold text-tt-text">Pages</h2>
        <ul className="mt-2 space-y-1">
          {published.length === 0 && (
            <li className="text-[14px] text-tt-muted">No published pages.</li>
          )}
          {published.map((p) => (
            <li key={p.id}>
              <Link
                to="/site/$slug"
                params={{ slug: p.slug }}
                className="text-[14px] text-tt-blue hover:underline"
              >
                {p.title}
              </Link>
              <span className="ml-2 text-[12px] text-tt-muted">/{p.slug}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
