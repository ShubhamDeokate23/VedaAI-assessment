"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { UploadedFileCard } from "@/components/upload/UploadedFileCard";
import { AvatarIllustration } from "@/components/upload/AvatarIllustration";
import { useSessionStore, useActiveAssignment } from "@/store/useSessionStore";
import { fileToPageImages } from "@/lib/pdfToImages";
import type { ExtractedQuestion, ExtractedAnswer, QuestionAnswerPair, PipelineStage } from "@/lib/types";

const IN_PROGRESS_STAGES: PipelineStage[] = ["extracting-questions", "mapping", "grading"];

function formatSize(bytes: number) {
  return `${Math.max(1, Math.round(bytes / (1024 * 1024)))}MB`;
}

/**
 * fetch + JSON, but throws with the server's actual error message on a
 * non-OK response instead of letting callers destructure `undefined` and
 * cascade into confusing downstream errors.
 */
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `${url} failed with status ${res.status}`);
  }
  return data as T;
}

export default function UploadPage() {
  const router = useRouter();
  const {
    questionPaper,
    answerSheet,
    setQuestionPaper,
    setAnswerSheet,
    createAssignment,
    updateAssignment,
    setSidebarCollapsed,
  } = useSessionStore();

  const activeAssignment = useActiveAssignment();

  useEffect(() => {
    setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  // If extraction/mapping/grading is still running on the active assignment
  // (e.g. the teacher clicked away to Home or Assignments mid-extraction),
  // land back on the in-progress view instead of a blank upload form —
  // it only redirects away once that assignment reaches "ready" or "error".
  useEffect(() => {
    if (activeAssignment && IN_PROGRESS_STAGES.includes(activeAssignment.stage)) {
      router.replace("/mapping");
    }
  }, [activeAssignment, router]);

  const [questionPaperBusy, setQuestionPaperBusy] = useState(false);
  const [questionPaperError, setQuestionPaperError] = useState<string | null>(null);
  const [answerSheetBusy, setAnswerSheetBusy] = useState(false);
  const [answerSheetError, setAnswerSheetError] = useState<string | null>(null);

  async function handleQuestionPaper(file: File) {
    setQuestionPaperError(null);
    setQuestionPaperBusy(true);
    try {
      const pages = await fileToPageImages(file);
      setQuestionPaper({ file, pages });
    } catch (err) {
      console.error(err);
      setQuestionPaperError(
        err instanceof Error
          ? `Couldn't read this file: ${err.message}`
          : "Couldn't read this file — try a different PDF or image."
      );
    } finally {
      setQuestionPaperBusy(false);
    }
  }

  async function handleAnswerSheet(file: File) {
    setAnswerSheetError(null);
    setAnswerSheetBusy(true);
    try {
      const pages = await fileToPageImages(file);
      setAnswerSheet({ file, pages });
    } catch (err) {
      console.error(err);
      setAnswerSheetError(
        err instanceof Error
          ? `Couldn't read this file: ${err.message}`
          : "Couldn't read this file — try a different PDF or image."
      );
    } finally {
      setAnswerSheetBusy(false);
    }
  }

  async function startMapping() {
    if (!questionPaper || !answerSheet) return;

    const id = createAssignment({
      title: questionPaper.file.name,
      answerSheetName: answerSheet.file.name,
      questionPaperPages: questionPaper.pages,
      answerSheetPages: answerSheet.pages,
    });

    // Clear the staging area so the next upload starts fresh.
    setQuestionPaper(null);
    setAnswerSheet(null);
    router.push("/mapping");

    try {
      updateAssignment(id, { stage: "extracting-questions" });
      const [{ questions }, { answers }] = await Promise.all([
        postJSON<{ questions: ExtractedQuestion[] }>("/api/extract-questions", {
          pages: questionPaper.pages.map((p) => ({ page: p.page, base64: p.base64 })),
        }),
        postJSON<{ answers: ExtractedAnswer[] }>("/api/extract-answers", {
          pages: answerSheet.pages.map((p) => ({ page: p.page, base64: p.base64 })),
        }),
      ]);

      updateAssignment(id, { stage: "mapping" });
      const mapResult = await postJSON<{
        pairs: QuestionAnswerPair[];
        unmatchedAnswers: ExtractedAnswer[];
      }>("/api/map-answers", { questions, answers });

      if (!Array.isArray(mapResult.pairs)) {
        throw new Error("Mapping step returned no pairs — check the server log for the real cause.");
      }
      const { pairs, unmatchedAnswers } = mapResult;

      updateAssignment(id, { stage: "grading" });
      const { graded } = await postJSON<{
        graded: Record<string, { score: number; maxScore: number; correct: boolean; feedback: string }>;
      }>("/api/grade", { pairs });

      const finalPairs = pairs.map((p) => {
        const g = graded?.[p.question.id];
        return g ? { ...p, score: g.score, maxScore: g.maxScore, correct: g.correct, feedback: g.feedback } : p;
      });

      updateAssignment(id, {
        questions,
        answers,
        pairs: finalPairs,
        unmatchedAnswers,
        stage: "ready",
        errorMessage: null,
      });
    } catch (err) {
      console.error(err);
      updateAssignment(id, {
        stage: "error",
        errorMessage: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  const bothUploaded = Boolean(questionPaper && answerSheet);

  // Render nothing while the redirect effect above is about to fire — this
  // is what actually prevents the one-frame flash of the blank upload form
  // before the in-progress mapping view takes over. The redirect effect
  // still does the navigation; this just stops this page from painting
  // first.
  if (activeAssignment && IN_PROGRESS_STAGES.includes(activeAssignment.stage)) {
    return null;
  }

  return (
    <AppShell breadcrumb="Exams">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-[32px] md:text-[40px] font-bold leading-[1.2] tracking-[-0.04em] text-ink-900">
          Upload{" "}
          <span className="text-brand-500">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="text-sm text-ink-500 mt-2">Upload both files to get started</p>

        <div className="my-8 flex justify-center">
          <AvatarIllustration size={128} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {questionPaper ? (
            <UploadedFileCard
              name={questionPaper.file.name}
              sizeLabel={formatSize(questionPaper.file.size)}
              pageCount={questionPaper.pages.length}
              onRemove={() => setQuestionPaper(null)}
            />
          ) : (
            <UploadDropzone
              label="Question Paper"
              onFile={handleQuestionPaper}
              busy={questionPaperBusy}
              externalError={questionPaperError}
            />
          )}

          {answerSheet ? (
            <UploadedFileCard
              name={answerSheet.file.name}
              sizeLabel={formatSize(answerSheet.file.size)}
              pageCount={answerSheet.pages.length}
              onRemove={() => setAnswerSheet(null)}
            />
          ) : (
            <UploadDropzone
              label="Answer Sheet"
              onFile={handleAnswerSheet}
              busy={answerSheetBusy}
              externalError={answerSheetError}
            />
          )}
        </div>

        <button
          type="button"
          disabled={!bothUploaded}
          onClick={startMapping}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white bg-ink-900 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
        >
          Start Mapping &rarr;
        </button>

        <p className="text-xs text-ink-500 mt-3">
          Once both files are uploaded, you&apos;ll be able to map answers with questions
        </p>
      </div>
    </AppShell>
  );
}
