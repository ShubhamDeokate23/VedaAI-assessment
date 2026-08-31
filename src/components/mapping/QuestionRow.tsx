"use client";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { ScoreBadge } from "./ScoreBadge";
import { AIFeedbackPanel } from "./AIFeedbackPanel";
import type { QuestionAnswerPair } from "@/lib/types";

interface QuestionRowProps {
  pair: QuestionAnswerPair;
  displayNumber: string; // "11" or "11 a."
  isSubpart: boolean;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export function QuestionRow({
  pair,
  displayNumber,
  isSubpart,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: QuestionRowProps) {
  const { question, answer, score, maxScore, feedback } = pair;

  return (
    <div className={clsx(isSubpart && "ml-8")}>
      <button
        type="button"
        onClick={() => {
          onSelect();
          onToggleExpand();
        }}
        className={clsx(
          "w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors border-l-4",
          selected
            ? "border-brand-500 bg-brand-50/60"
            : "border-transparent hover:bg-ink-100/60"
        )}
      >
        <span
          className={clsx(
            "shrink-0 w-6 h-6 rounded-full grid place-items-center text-xs font-semibold mt-0.5",
            isSubpart ? "bg-transparent text-ink-500" : "bg-ink-900 text-white"
          )}
        >
          {isSubpart ? displayNumber.trim().slice(-2, -1) : displayNumber}
        </span>

        <span className="flex-1 text-sm text-ink-900 leading-snug line-clamp-2">
          {question.text}
        </span>

        <ScoreBadge score={score} maxScore={maxScore} unanswered={!answer} />

        <ChevronDown
          size={16}
          className={clsx(
            "shrink-0 text-ink-500 transition-transform mt-0.5",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-3 -mt-1">
          {!answer && (
            <p className="text-xs text-bad-text font-medium">Not answered on the answer sheet &mdash; 0 marks.</p>
          )}
          {feedback && <AIFeedbackPanel feedback={feedback} />}
        </div>
      )}
    </div>
  );
}
