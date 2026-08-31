"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Sparkles,
  FileText,
  ChevronDown,
  LogOut,
  Menu,
  BellOff,
  HelpCircle,
} from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";

interface TopbarProps {
  breadcrumb: string;
  onBack?: () => void;
}

const TEACHER_NAME = "Madhur Rastogi";

/** Generic click-outside-to-close wrapper, shared by all header popovers. */
function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

/** Small circular icon button, matching the light-gray badge style in the reference topbar. */
function IconBadgeButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative w-9 h-9 rounded-full bg-ink-100/70 text-ink-700 grid place-items-center hover:bg-ink-100 transition-colors"
    >
      {children}
    </button>
  );
}

export function Topbar({ breadcrumb, onBack }: TopbarProps) {
  const { setMobileSidebarOpen } = useSessionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const menuRef = useOutsideClose(() => setMenuOpen(false));
  const notifRef = useOutsideClose(() => setNotifOpen(false));
  const geminiRef = useOutsideClose(() => setGeminiOpen(false));
  const helpRef = useOutsideClose(() => setHelpOpen(false));

  function closeAllExcept(which: "menu" | "notif" | "gemini" | "help") {
    if (which !== "menu") setMenuOpen(false);
    if (which !== "notif") setNotifOpen(false);
    if (which !== "gemini") setGeminiOpen(false);
    if (which !== "help") setHelpOpen(false);
  }

  return (
    <header className="border-b border-ink-100 bg-white sticky top-0 z-20">
      {/* Desktop / tablet layout */}
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 text-sm text-ink-700">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="text-ink-500 hover:text-ink-900"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="flex items-center gap-1.5 font-medium">
            <FileText size={15} className="text-ink-500" />
            {breadcrumb}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={helpRef}>
            <IconBadgeButton
              label="Help"
              onClick={() => {
                setHelpOpen((o) => !o);
                closeAllExcept("help");
              }}
            >
              <HelpCircle size={17} />
            </IconBadgeButton>
            {helpOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-ink-100 bg-white shadow-card p-3 z-30">
                <p className="text-xs font-semibold text-ink-900">Need help?</p>
                <p className="text-xs text-ink-500 mt-1">
                  Upload a question paper and an answer sheet from Exams — VedaAI extracts,
                  maps, and grades them automatically.
                </p>
              </div>
            )}
          </div>

          <div className="relative" ref={notifRef}>
            <IconBadgeButton
              label="Notifications"
              onClick={() => {
                setNotifOpen((o) => !o);
                closeAllExcept("notif");
              }}
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
            </IconBadgeButton>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-ink-100 bg-white shadow-card py-2 z-30">
                <p className="px-3 pb-2 text-xs font-semibold text-ink-900 border-b border-ink-100">
                  Notifications
                </p>
                <div className="flex items-start gap-2 px-3 py-3 text-xs text-ink-500">
                  <BellOff size={14} className="mt-0.5 shrink-0" />
                  You&apos;re all caught up — new grading results will show up here.
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={geminiRef}>
            <IconBadgeButton
              label="Ask Gemini"
              onClick={() => {
                setGeminiOpen((o) => !o);
                closeAllExcept("gemini");
              }}
            >
              <Sparkles size={17} />
            </IconBadgeButton>
            {geminiOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-ink-100 bg-white shadow-card p-3 z-30">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                  <Sparkles size={13} />
                  Ask Gemini
                </p>
                <p className="text-xs text-ink-500 mt-1.5">
                  Chatting with Gemini about your class isn&apos;t built yet — for now, upload an
                  exam from the Exams tab to have it graded automatically.
                </p>
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((o) => !o);
                closeAllExcept("menu");
              }}
              className="flex items-center gap-2 text-sm text-ink-900"
            >
              <div className="w-8 h-8 rounded-full bg-ink-100 grid place-items-center text-xs font-semibold text-ink-700">
                MR
              </div>
              <span>{TEACHER_NAME}</span>
              <ChevronDown size={14} className="text-ink-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-ink-100 bg-white shadow-card py-1.5 z-30">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout — logo/wordmark + back on the left, hamburger at the
          top-right corner (not the left, matching the reference exactly). */}
      <div className="flex md:hidden items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="text-ink-500 hover:text-ink-900 shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-ink-900 text-white grid place-items-center text-xs font-bold shrink-0">
              V
            </div>
            <span className="font-semibold text-ink-900 font-display truncate">VedaAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={notifRef}>
            <IconBadgeButton
              label="Notifications"
              onClick={() => {
                setNotifOpen((o) => !o);
                closeAllExcept("notif");
              }}
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
            </IconBadgeButton>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-ink-100 bg-white shadow-card py-2 z-30">
                <p className="px-3 pb-2 text-xs font-semibold text-ink-900 border-b border-ink-100">
                  Notifications
                </p>
                <div className="flex items-start gap-2 px-3 py-3 text-xs text-ink-500">
                  <BellOff size={14} className="mt-0.5 shrink-0" />
                  You&apos;re all caught up.
                </div>
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-ink-100 grid place-items-center text-xs font-semibold text-ink-700 shrink-0">
            MR
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="text-ink-700 shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
