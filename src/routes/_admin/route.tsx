import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminBar } from "@/components/cms/AdminBar";
import { AdminMenu } from "@/components/cms/AdminMenu";
import { comments } from "@/data/cms-mock";
import { useAdminBarOffset } from "@/hooks/use-admin-bar-offset";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [collapsed, setCollapsed] = usePersistentState("menu-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useAdminBarOffset();
  const pendingComments = comments.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-tt-body font-tt text-[13px] text-tt-text">
      <AdminBar
        pendingComments={pendingComments}
        onToggleMenu={() => setMobileOpen((v) => !v)}
        menuOpen={mobileOpen}
      />
      <AdminMenu
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        pendingComments={pendingComments}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main
        className={cn(
          "pt-8 transition-[padding] duration-150",
          collapsed ? "md:pl-[36px]" : "md:pl-[160px]",
        )}
      >
        {/* Required: nested admin screens render here. */}
        <Outlet />
      </main>
    </div>
  );
}
