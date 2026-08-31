"use client";

import clsx from "clsx";
import { useSessionStore } from "@/store/useSessionStore";

export function MobileTabs() {
  const { mobileTab, setMobileTab } = useSessionStore();

  return (
    <div className="md:hidden sticky top-0 z-20 bg-white pt-3 pb-3 px-4">
      <div className="flex items-center gap-1 bg-ink-100 rounded-full p-1">
        {(["questions", "answerSheet"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={clsx(
              "flex-1 text-sm py-1.5 rounded-full font-medium transition-colors",
              mobileTab === tab ? "bg-white text-ink-900 shadow-card" : "text-ink-500"
            )}
          >
            {tab === "questions" ? "Questions" : "Answer Sheet"}
          </button>
        ))}
      </div>
    </div>
  );
}
