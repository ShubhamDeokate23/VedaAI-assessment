"use client";

import { Clock, ClipboardList, Cloud, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Circular teacher avatar with 4 icon badges around the ring, matching the
 * Figma reference layout. The source photo (public/avatar-teacher.png) has
 * its own peach ring + one badge baked into a square canvas, so we zoom the
 * <img> in via CSS transform to isolate just the inner face circle inside
 * our own round mask, then lay our own ring + 4 badges on top — that gives
 * the exact circular crop and full 4-badge composition from the reference,
 * while still using the real photo for the face itself.
 */
export function AvatarIllustration({ size = 160 }: { size?: number }) {
  const badgeSize = Math.round(size * 0.24);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* outer + mid ring, matching the reference's two-tone peach circle */}
      <div className="absolute inset-0 rounded-full bg-brand-50" />
      <div
        className="absolute rounded-full bg-brand-100"
        style={{ inset: size * 0.12 }}
      />

      {/* photo, cropped via object-position (measured against the actual
          source image) so the full face is visible instead of over-zoomed */}
      <div
        className="absolute rounded-full overflow-hidden bg-white shadow-card"
        style={{ inset: size * 0.16 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar-teacher.png"
          alt="Teacher illustration"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 30%" }}
        />
      </div>

      <Badge icon={Clock} size={badgeSize} style={{ top: -badgeSize * 0.3, right: size * 0.06 }} />
      <Badge icon={ClipboardList} size={badgeSize} style={{ top: size * 0.32, left: -badgeSize * 0.35 }} />
      <Badge icon={Cloud} size={badgeSize} style={{ top: size * 0.58, right: -badgeSize * 0.35 }} />
      <Badge icon={Settings} size={badgeSize} style={{ bottom: -badgeSize * 0.3, left: size * 0.34 }} />
    </div>
  );
}

function Badge({
  icon: Icon,
  size,
  style,
}: {
  icon: LucideIcon;
  size: number;
  style: React.CSSProperties;
}) {
  return (
    <span
      className="absolute rounded-full bg-brand-500 text-white grid place-items-center shadow-card ring-2 ring-white"
      style={{ width: size, height: size, ...style }}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
