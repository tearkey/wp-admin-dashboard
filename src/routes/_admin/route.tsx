import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminBar } from "@/components/cms/AdminBar";
import { AdminBottomBar } from "@/components/cms/AdminBottomBar";
import { AdminMenu } from "@/components/cms/AdminMenu";
import { comments } from "@/data/cms-mock";
import { useAdminBarOffset } from "@/hooks/use-admin-bar-offset";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [collapsed, setCollapsed] = usePersistentState("menu-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tier = useDeviceTier();
  useAdminBarOffset();
  const pendingComments = comments.filter((c) => c.status === "pending").length;

  // Tablet uses an icon rail; mobile hides the sidebar behind the bottom bar.
  const railCollapsed = tier === "tablet" ? true : collapsed;

  return (
    <div className="min-h-screen bg-tt-body font-tt text-[13px] text-tt-text">
      <AdminBar
        pendingComments={pendingComments}
        onToggleMenu={() => setMobileOpen((v) => !v)}
        menuOpen={mobileOpen}
      />
      <AdminMenu
        collapsed={railCollapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        pendingComments={pendingComments}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main
        className={cn(
          "pt-8 pb-20 transition-[padding] duration-150 md:pb-0",
          railCollapsed ? "md:pl-[36px]" : "md:pl-[160px]",
        )}
      >
        {/* Required: nested admin screens render here. */}
        <Outlet />
      </main>
      <AdminBottomBar onOpenMenu={() => setMobileOpen(true)} />
    </div>
  );
}
