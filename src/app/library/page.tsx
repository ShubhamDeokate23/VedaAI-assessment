"use client";

import { History } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function LibraryPage() {
  return (
    <AppShell breadcrumb="My Library">
      <ComingSoon
        icon={History}
        title="My Library"
        description="A saved library of question banks and templates isn't part of this build yet — graded assignments from this session live under Assignments."
      />
    </AppShell>
  );
}
