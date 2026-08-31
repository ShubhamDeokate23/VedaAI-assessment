"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, FileText, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useSessionStore } from "@/store/useSessionStore";
import { summarizePairs } from "@/lib/summary";

export default function HomePage() {
  const router = useRouter();
  const { assignments, setActiveAssignmentId } = useSessionStore();

  const ready = assignments.filter((a) => a.stage === "ready");
  const totalMarks = ready.reduce((sum, a) => sum + summarizePairs(a.pairs).totalScore, 0);
  const totalMax = ready.reduce((sum, a) => sum + summarizePairs(a.pairs).totalMaxScore, 0);
  const recent = assignments.slice(0, 3);

  return (
    <AppShell breadcrumb="Home">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back, Madhur</h1>
        <p className="text-sm text-ink-500 mt-1">Here&apos;s what&apos;s happening in Exams this session.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl border border-ink-100 p-4">
            <p className="text-xs text-ink-500">Assignments this session</p>
            <p className="text-2xl font-bold text-ink-900 mt-1">{assignments.length}</p>
          </div>
          <div className="rounded-2xl border border-ink-100 p-4">
            <p className="text-xs text-ink-500">Graded</p>
            <p className="text-2xl font-bold text-ink-900 mt-1">{ready.length}</p>
          </div>
          <div className="rounded-2xl border border-ink-100 p-4">
            <p className="text-xs text-ink-500">Total marks awarded</p>
            <p className="text-2xl font-bold text-ink-900 mt-1">
              {totalMax > 0 ? `${totalMarks}/${totalMax}` : "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white bg-ink-900 hover:bg-ink-700 transition-colors"
          >
            <FileText size={16} />
            Upload New Exam
          </button>
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-ink-700 border border-ink-300 hover:bg-ink-100 transition-colors"
          >
            <ClipboardList size={16} />
            View All Assignments
          </button>
        </div>

        {recent.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-ink-900 font-display mb-3">Recent assignments</h2>
            <div className="flex flex-col gap-2">
              {recent.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setActiveAssignmentId(a.id);
                    router.push("/mapping");
                  }}
                  className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3 text-left hover:border-brand-300 transition-colors"
                >
                  <span className="text-sm text-ink-900 truncate">{a.title}</span>
                  <ArrowRight size={15} className="text-ink-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
