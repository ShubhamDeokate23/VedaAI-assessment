"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/upload/LoadingState";
import { QuestionList } from "@/components/mapping/QuestionList";
import { AnswerSheetViewer } from "@/components/mapping/AnswerSheetViewer";
import { MobileTabs } from "@/components/mapping/MobileTabs";
import { useSessionStore, useActiveAssignment } from "@/store/useSessionStore";

export default function MappingPage() {
  const router = useRouter();
  const { mobileTab, setSidebarCollapsed } = useSessionStore();
  const assignment = useActiveAssignment();

  // Matches the Figma "Loading state" / "Question - Answer mapping screen" frames,
  // where the sidebar is always the collapsed icon rail on this screen.
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  if (!assignment) {
    return (
      <AppShell breadcrumb="Exams" onBack={() => router.push("/")}>
        <div className="max-w-md mx-auto text-center py-24">
          <p className="text-sm text-ink-500">
            No assignment selected.{" "}
            <button className="text-brand-600 font-medium underline" onClick={() => router.push("/")}>
              Go back to upload
            </button>
            .
          </p>
        </div>
      </AppShell>
    );
  }

  const isLoading = !["ready", "error"].includes(assignment.stage);

  return (
    <AppShell breadcrumb="Exams" onBack={() => router.push("/")} padded={false}>
      <div className="flex-1 flex flex-col">
        {isLoading && <LoadingState stage={assignment.stage} />}

        {assignment.stage === "error" && (
          <div className="max-w-md mx-auto text-center py-24">
            <p className="text-sm text-bad-text">{assignment.errorMessage ?? "Something went wrong."}</p>
            <button
              className="mt-4 text-sm text-brand-600 font-medium underline"
              onClick={() => router.push("/")}
            >
              Try again
            </button>
          </div>
        )}

        {assignment.stage === "ready" && (
          <>
            <MobileTabs />
            <div className="flex-1 grid md:grid-cols-[clamp(280px,30vw,380px)_1fr] overflow-hidden">
              <div className={`${mobileTab === "questions" ? "block" : "hidden"} md:block border-r border-ink-100 overflow-hidden`}>
                <QuestionList assignment={assignment} />
              </div>
              <div className={`${mobileTab === "answerSheet" ? "block" : "hidden"} md:block overflow-hidden`}>
                <AnswerSheetViewer assignment={assignment} />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
