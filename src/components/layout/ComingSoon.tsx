"use client";

import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 grid place-items-center mx-auto">
        <Icon size={24} />
      </div>
      <h1 className="font-display text-xl font-bold text-ink-900 mt-4">{title}</h1>
      <p className="text-sm text-ink-500 mt-2">{description}</p>
    </div>
  );
}
