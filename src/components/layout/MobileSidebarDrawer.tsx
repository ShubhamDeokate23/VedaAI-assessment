"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { Sidebar } from "./Sidebar";

export function MobileSidebarDrawer() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useSessionStore();

  if (!mobileSidebarOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden
      />
      <Sidebar overlay />
    </div>
  );
}
