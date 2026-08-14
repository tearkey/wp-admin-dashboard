import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path kept alive after the rename to Techtrick CMS. */
export const Route = createFileRoute("/wp-admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
