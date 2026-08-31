"use client";

import { Sparkles } from "lucide-react";
import type { PipelineStage } from "@/lib/types";

export function LoadingState({ stage: _stage }: { stage: PipelineStage }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <Sparkles size={56} className="text-brand-500" />
      <div>
        <p className="text-lg font-bold text-ink-900 font-display">Extracting&hellip;</p>
        <p className="text-sm text-ink-500 mt-1">This may take a while</p>
      </div>
    </div>
  );
}
