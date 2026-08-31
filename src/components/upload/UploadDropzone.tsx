"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, AlertCircle } from "lucide-react";

interface UploadDropzoneProps {
  label: string;
  onFile: (file: File) => void;
  /** Surfaced when the parent's own processing (e.g. PDF rasterization) fails after a valid file is dropped. */
  externalError?: string | null;
  /** True while the parent is converting the dropped file (e.g. rasterizing a PDF). */
  busy?: boolean;
}

function describeRejection(rejection: FileRejection): string {
  const code = rejection.errors[0]?.code;
  if (code === "file-too-large") return "File is over 10MB — try a smaller file.";
  if (code === "file-invalid-type") return "Unsupported file type — upload a PDF, PNG, or JPG.";
  return rejection.errors[0]?.message ?? "That file couldn't be uploaded.";
}

export function UploadDropzone({ label, onFile, externalError, busy }: UploadDropzoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        setRejectionError(describeRejection(rejections[0]));
        return;
      }
      setRejectionError(null);
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
    multiple: false,
    disabled: busy,
  });

  const error = externalError ?? rejectionError;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          busy ? "cursor-wait opacity-70" : "cursor-pointer"
        } ${
          error
            ? "border-bad-text bg-bad-bg/30"
            : isDragActive
              ? "border-brand-500 bg-brand-50"
              : "border-ink-300 hover:border-brand-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-10 h-10 rounded-lg bg-ink-100 grid place-items-center">
          <UploadCloud size={18} className={busy ? "text-ink-400 animate-pulse" : "text-ink-700"} />
        </div>
        <p className="text-sm text-ink-900">
          {busy ? (
            "Processing…"
          ) : (
            <>
              Upload <span className="text-brand-600 font-medium">{label}</span>
            </>
          )}
        </p>
        <p className="text-xs text-ink-500">Max 10MB</p>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-bad-text mt-2">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
