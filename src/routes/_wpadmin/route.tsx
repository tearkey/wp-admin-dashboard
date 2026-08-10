import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminBar } from "@/components/wp/AdminBar";
import { AdminMenu } from "@/components/wp/AdminMenu";
import { comments } from "@/data/wp-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_wpadmin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pendingComments = comments.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-wp-body font-wp text-[13px] text-wp-text">
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

