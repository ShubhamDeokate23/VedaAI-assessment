"use client";

import clsx from "clsx";

interface ScoreBadgeProps {
  score?: number;
  maxScore?: number;
  unanswered?: boolean;
}

export function ScoreBadge({ score, maxScore, unanswered }: ScoreBadgeProps) {
  if (unanswered) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-bad-bg text-bad-text shrink-0 whitespace-nowrap">
        Not Answered
      </span>
    );
  }

  if (score === undefined || maxScore === undefined) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 shrink-0">
        Grading&hellip;
      </span>
    );
  }

  const ratio = maxScore === 0 ? 0 : score / maxScore;
  const tone = ratio === 0 ? "bad" : ratio < 1 ? "mid" : "good";

  return (
    <span
      className={clsx(
        "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
        tone === "good" && "bg-good-bg text-good-text",
        tone === "bad" && "bg-bad-bg text-bad-text",
        tone === "mid" && "bg-mid-bg text-mid-text"
      )}
    >
      {score}/{maxScore}
    </span>
  );
}
