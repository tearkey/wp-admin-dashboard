import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy `/wp-admin/*` paths keep working after the rename to Techtrick CMS. */
export const Route = createFileRoute("/wp-admin/$")({
  beforeLoad: ({ params }) => {
    const rest = params._splat ?? "";
    throw redirect({ to: rest ? `/admin/${rest}` : "/admin" });
  },
});
