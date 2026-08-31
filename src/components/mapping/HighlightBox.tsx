"use client";

import { forwardRef } from "react";
import type { BBox } from "@/lib/types";

interface HighlightBoxProps {
  bbox: BBox; // 0-1000 normalized
  label?: string;
  active?: boolean;
}

/**
 * Absolutely-positioned overlay drawn on top of the answer-sheet <img>.
 * The bbox is normalized 0-1000 (as returned by Gemini), so we just
 * convert to percentages — no canvas math needed as long as the parent
 * is `position: relative` around the image. Forwards a ref so the
 * viewer can scrollIntoView() a specific box when its question is selected.
 */
export const HighlightBox = forwardRef<HTMLDivElement, HighlightBoxProps>(
  ({ bbox, label, active }, ref) => {
    const style = {
      top: `${bbox.ymin / 10}%`,
      left: `${bbox.xmin / 10}%`,
      width: `${(bbox.xmax - bbox.xmin) / 10}%`,
      height: `${(bbox.ymax - bbox.ymin) / 10}%`,
    };

    return (
      <div
        ref={ref}
        className={`absolute rounded-md border-2 transition-colors scroll-mt-24 ${
          active ? "border-brand-500 bg-brand-500/10" : "border-emerald-500 bg-emerald-500/10"
        }`}
        style={style}
      >
        {label && (
          <span
            className={`absolute -top-3 -left-1 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded ${
              active ? "bg-brand-500" : "bg-emerald-500"
            }`}
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);
HighlightBox.displayName = "HighlightBox";
