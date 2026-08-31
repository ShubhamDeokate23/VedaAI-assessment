"use client";

import { Sparkles } from "lucide-react";

export function AIFeedbackPanel({ feedback }: { feedback: string }) {
  return (
    <div className="mt-2 rounded-xl bg-brand-50 border border-brand-100 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <Sparkles size={13} />
        AI Feedback
      </p>
      <p className="text-sm text-ink-700 mt-1 leading-snug">{feedback}</p>
    </div>
  );
}
