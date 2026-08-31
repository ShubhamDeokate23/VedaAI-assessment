"use client";

/**
 * Screen/board with a gesturing person, matching the reference glyph — no
 * exact lucide equivalent exists, so this is a small original icon kept in
 * the same stroke style as the rest of the (lucide) sidebar icon set.
 */
export function ClassroomIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <circle cx="10.5" cy="9.2" r="1.7" />
      <path d="M8 14.5c0-1.6 1.1-2.8 2.5-2.8s2.5 1.2 2.5 2.8" />
      <path d="M13 10.5 16 7.5" />
      <path d="M16 7.5v2.3M16 7.5h-2.3" />
    </svg>
  );
}
