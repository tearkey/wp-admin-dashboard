import { createFileRoute, redirect } from "@tanstack/react-router";

const LEGACY: Record<
  string,
  "/admin/posts" | "/admin/pages" | "/admin/comments" | "/admin/settings"
> = {
  posts: "/admin/posts",
  pages: "/admin/pages",
  comments: "/admin/comments",
  settings: "/admin/settings",
};

/** Legacy `/wp-admin/*` paths keep working after the rename to Techtrick CMS. */
export const Route = createFileRoute("/wp-admin/$")({
  beforeLoad: ({ params }) => {
    const first = (params._splat ?? "").split("/")[0] ?? "";
    throw redirect({ to: LEGACY[first] ?? "/admin" });
  },
});
