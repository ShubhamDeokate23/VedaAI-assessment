"use client";

import { GraduationCap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ClassroomPage() {
  return (
    <AppShell breadcrumb="My Classroom">
      <ComingSoon
        icon={GraduationCap}
        title="My Classroom"
        description="Class rosters and student profiles aren't part of this build yet — this assignment focuses on the Exams flow: uploading, mapping, and grading."
      />
    </AppShell>
  );
}
