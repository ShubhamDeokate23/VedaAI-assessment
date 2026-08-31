"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { QuestionRow } from "./QuestionRow";
import type { AssignmentSession } from "@/lib/types";

export function QuestionList({ assignment }: { assignment: AssignmentSession }) {
  const { pairs, unmatchedAnswers } = assignment;
  const { selectedQuestionId, selectQuestion, setActiveAnswerPage } = useSessionStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const allExpanded = pairs.length > 0 && pairs.every((p) => expandedIds.has(p.question.id));

  function toggleOne(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setExpandedIds(allExpanded ? new Set() : new Set(pairs.map((p) => p.question.id)));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 sticky top-0 z-10 bg-white">
        <h2 className="text-sm font-semibold text-ink-900 font-display">
          Extracted Questions <span className="text-ink-500 font-normal">(from question paper)</span>
        </h2>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-brand-600 hover:underline shrink-0"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {pairs.map((pair) => {
          const { question } = pair;
          const displayNumber = question.subpart
            ? `${question.number} ${question.subpart}.`
            : question.number;

          return (
            <QuestionRow
              key={question.id}
              pair={pair}
              displayNumber={displayNumber}
              isSubpart={Boolean(question.subpart)}
              selected={selectedQuestionId === question.id}
              expanded={expandedIds.has(question.id)}
              onSelect={() => {
                selectQuestion(question.id);
                if (pair.answer) setActiveAnswerPage(pair.answer.page);
              }}
              onToggleExpand={() => toggleOne(question.id)}
            />
          );
        })}

        {unmatchedAnswers.length > 0 && (
          <div className="mt-4 px-3">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
              Unmatched answers
            </p>
            {unmatchedAnswers.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActiveAnswerPage(a.page)}
                className="w-full text-left rounded-lg border border-dashed border-ink-300 px-3 py-2 mb-2 text-xs text-ink-700 hover:border-brand-400"
              >
                <span className="font-medium text-ink-900">Page {a.page}: </span>
                {a.text.slice(0, 80)}
                {a.text.length > 80 ? "…" : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
