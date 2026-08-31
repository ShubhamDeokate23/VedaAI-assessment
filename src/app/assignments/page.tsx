"use client";

import { useRouter } from "next/navigation";
import { FileText, ClipboardX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useSessionStore } from "@/store/useSessionStore";
import { summarizePairs } from "@/lib/summary";

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments, setActiveAssignmentId } = useSessionStore();

  function openAssignment(id: string) {
    setActiveAssignmentId(id);
    router.push("/mapping");
  }

  return (
    <AppShell breadcrumb="Assignments">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Assignments</h1>
            <p className="text-sm text-ink-500 mt-1">
              Every question paper you&apos;ve mapped this session, saved here automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full px-4 py-2 text-sm font-medium text-white bg-ink-900 hover:bg-ink-700 transition-colors shrink-0"
          >
            + New Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center">
            <ClipboardX size={28} className="mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              No assignments yet. Upload a question paper and answer sheet from Exams to get started.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-4 text-sm font-medium text-brand-600 hover:underline"
            >
              Go to Exams &rarr;
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {assignments.map((a) => {
              const summary = summarizePairs(a.pairs);
              const isReady = a.stage === "ready";
              const isError = a.stage === "error";
              const isProcessing = !isReady && !isError;

              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openAssignment(a.id)}
                  className="text-left rounded-2xl border border-ink-100 bg-white p-4 hover:border-brand-300 hover:shadow-card transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-500 grid place-items-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{a.title}</p>
                      <p className="text-xs text-ink-500 truncate">
                        Answer sheet: {a.answerSheetName} &bull; {formatDate(a.createdAt)}
                      </p>
                    </div>

                    {isProcessing && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500 shrink-0">
                        <Loader2 size={13} className="animate-spin" />
                        Processing
                      </span>
                    )}
                    {isError && (
                      <span className="text-xs font-semibold text-bad-text bg-bad-bg px-2 py-1 rounded-full shrink-0">
                        Failed
                      </span>
                    )}
                    {isReady && (
                      <span className="text-xs font-semibold text-good-text bg-good-bg px-2 py-1 rounded-full shrink-0">
                        {summary.totalScore}/{summary.totalMaxScore} marks
                      </span>
                    )}
                  </div>

                  {isReady && (
                    <div className="mt-3 flex gap-4 text-xs text-ink-500 pl-[52px]">
                      <span>{summary.totalQuestions} questions</span>
                      <span>{summary.answered} answered</span>
                      {summary.unanswered > 0 && (
                        <span className="text-bad-text font-medium">{summary.unanswered} not answered</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
