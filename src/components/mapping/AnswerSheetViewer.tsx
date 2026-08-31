"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { HighlightBox } from "./HighlightBox";
import type { AssignmentSession } from "@/lib/types";

export function AnswerSheetViewer({ assignment }: { assignment: AssignmentSession }) {
  const { pairs, unmatchedAnswers, answerSheetPages: pages } = assignment;
  const { selectedQuestionId, activeAnswerPage, setActiveAnswerPage } = useSessionStore();
  const [zoom, setZoom] = useState(100);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const highlightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const pageCount = pages.length;

  // Continuous scroll: figure out which page is closest to the top of the
  // viewport as the user scrolls, and keep the "Page X of N" indicator in sync.
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;

    let closestPage = activeAnswerPage;
    let closestDistance = Infinity;
    for (const [pageStr, el] of Object.entries(pageRefs.current)) {
      if (!el) continue;
      const distance = Math.abs(el.getBoundingClientRect().top - containerTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = Number(pageStr);
      }
    }
    if (closestPage !== activeAnswerPage) setActiveAnswerPage(closestPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAnswerPage]);

  function scrollToPage(page: number) {
    pageRefs.current[page]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Clicking a question in the list scrolls the matching highlight into view.
  useEffect(() => {
    if (!selectedQuestionId) return;
    const el = highlightRefs.current[selectedQuestionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedQuestionId]);

  function boxesOnPage(page: number) {
    return [
      ...pairs
        .filter((p) => p.answer && p.answer.page === page)
        .map((p) => ({
          key: p.question.id,
          bbox: p.answer!.bbox,
          label: p.question.subpart ? `Q${p.question.number}${p.question.subpart}` : `Q${p.question.number}`,
          active: p.question.id === selectedQuestionId,
        })),
      ...unmatchedAnswers
        .filter((a) => a.page === page)
        .map((a) => ({ key: a.id, bbox: a.bbox, label: "?", active: false })),
    ];
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 sticky top-0 z-10 bg-white">
        <h2 className="text-sm font-semibold text-ink-900 font-display shrink-0">Answer Sheet</h2>
        <div className="flex items-center gap-3 flex-wrap justify-end min-w-0">
          <div className="flex items-center gap-1 text-ink-500 shrink-0">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="hover:text-ink-900"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs w-9 text-center hidden sm:inline">{zoom}%</span>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="hover:text-ink-900"
            >
              <ZoomIn size={15} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-ink-500 shrink-0">
            <button
              type="button"
              aria-label="Previous page"
              disabled={activeAnswerPage <= 1}
              onClick={() => scrollToPage(activeAnswerPage - 1)}
              className="disabled:opacity-30 hover:text-ink-900"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs whitespace-nowrap">
              Page {activeAnswerPage} of {pageCount || 1}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={activeAnswerPage >= pageCount}
              onClick={() => scrollToPage(activeAnswerPage + 1)}
              className="disabled:opacity-30 hover:text-ink-900"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto bg-ink-100/50 p-4 flex flex-col items-center gap-4"
      >
        {pageCount === 0 && (
          <div className="h-full grid place-items-center text-sm text-ink-500">
            No answer sheet page to display.
          </div>
        )}

        {pages.map((p) => (
          <div
            key={p.page}
            ref={(el) => {
              pageRefs.current[p.page] = el;
            }}
            className="relative bg-white shadow-card rounded-lg overflow-hidden shrink-0"
            style={{ width: `${zoom}%`, maxWidth: "100%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.dataUrl} alt={`Answer sheet page ${p.page}`} className="w-full block" />
            {boxesOnPage(p.page).map((b) => (
              <HighlightBox
                key={b.key}
                ref={(el) => {
                  highlightRefs.current[b.key] = el;
                }}
                bbox={b.bbox}
                label={b.label}
                active={b.active}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
