"use client";

import { FileText, X } from "lucide-react";

interface UploadedFileCardProps {
  name: string;
  sizeLabel: string; // e.g. "2MB"
  pageCount: number;
  onRemove: () => void;
}

export function UploadedFileCard({ name, sizeLabel, pageCount, onRemove }: UploadedFileCardProps) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-ink-100 p-5">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-ink-100 grid place-items-center text-ink-500 hover:bg-ink-300"
      >
        <X size={13} />
      </button>
      <div className="w-9 h-9 rounded-md bg-red-50 grid place-items-center shrink-0">
        <FileText size={18} className="text-red-500" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{name}</p>
        <p className="text-xs text-ink-500">
          {sizeLabel} &bull; {pageCount} {pageCount === 1 ? "Page" : "Pages"}
        </p>
      </div>
    </div>
  );
}
