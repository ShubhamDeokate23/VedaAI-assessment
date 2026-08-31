"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";
import { Topbar } from "./Topbar";
import { useSessionStore } from "@/store/useSessionStore";

interface AppShellProps {
  breadcrumb: string;
  onBack?: () => void;
  children: React.ReactNode;
  /** Set false for screens (like the mapping workspace) that manage their own scroll/height. */
  padded?: boolean;
}

const NARROW_WINDOW_THRESHOLD = 1100;

export function AppShell({ breadcrumb, onBack, children, padded = true }: AppShellProps) {
  const setSidebarCollapsed = useSessionStore((s) => s.setSidebarCollapsed);

  // Collapse the full sidebar automatically if the browser window itself is
  // resized narrower (not just phone-vs-desktop) — e.g. a snapped/half-width
  // window on a laptop. Only attaches after mount, and only ever collapses
  // (never force-expands), so it never fights a page's own initial state.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < NARROW_WINDOW_THRESHOLD) {
        setSidebarCollapsed(true);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="flex">
      <Sidebar />
      <MobileSidebarDrawer />
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        <Topbar breadcrumb={breadcrumb} onBack={onBack} />
        {padded ? <main className="flex-1">{children}</main> : children}
      </div>
    </div>
  );
}
