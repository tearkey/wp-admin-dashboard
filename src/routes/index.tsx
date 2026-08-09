import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  // The admin dashboard is the app; / is just an entry point.
  beforeLoad: () => {
    throw redirect({ to: "/wp-admin" });
  },
});
