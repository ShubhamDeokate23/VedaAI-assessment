"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutGrid,
  ClipboardList,
  FileText,
  History,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Wand2,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useSessionStore } from "@/store/useSessionStore";
import { ClassroomIcon } from "./ClassroomIcon";

const NAV_ITEMS = [
  { label: "Home", icon: LayoutGrid, href: "/home" },
  { label: "My Classroom", icon: ClassroomIcon, href: "/classroom" },
  { label: "Assignments", icon: FileText, href: "/assignments" },
  { label: "Exams", icon: ClipboardList, href: "/" },
  { label: "My Library", icon: History, href: "/library" },
];

// Icon-only rail order matches the "Loading state" / "Question - Answer
// mapping" Figma frames: sparkle (active), grid, classroom, doc, clipboard, history.
const RAIL_ITEMS = [
  { icon: Sparkles, href: null }, // AI Toolkit — rendered as its own distinct badge below
  { icon: LayoutGrid, href: "/home" },
  { icon: ClassroomIcon, href: "/classroom" },
  { icon: FileText, href: "/assignments" },
  { icon: ClipboardList, href: "/" },
  { icon: History, href: "/library" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/mapping");
  return pathname.startsWith(href);
}

interface SidebarProps {
  /** Mobile slide-over uses this to render as an overlay instead of the sticky column. */
  overlay?: boolean;
}

export function Sidebar({ overlay }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useSessionStore();
  const pathname = usePathname();
  const router = useRouter();
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const toolkitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (toolkitRef.current && !toolkitRef.current.contains(e.target as Node)) {
        setToolkitOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (sidebarCollapsed && !overlay) {
    return (
      <aside className="hidden md:flex w-16 shrink-0 flex-col items-center gap-2 border-r border-ink-100 bg-white h-screen sticky top-0 py-5">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="w-8 h-8 rounded-md bg-ink-900 text-white grid place-items-center text-sm font-bold mb-2"
        >
          V
        </button>

        {/* AI Toolkit — black circle with a thick orange ring, matching the
            reference exactly; clicking it opens the Exams tab. */}
        <Link
          href="/"
          aria-label="Exams"
          className="w-10 h-10 rounded-full bg-ink-900 border-[3px] border-brand-500 grid place-items-center mb-1"
        >
          <Sparkles size={16} className="text-white" />
        </Link>

        {RAIL_ITEMS.slice(1).map(({ icon: Icon, href }, i) => {
          const active = href ? isActive(pathname, href) : false;
          const content = (
            <span
              className={clsx(
                "w-9 h-9 rounded-lg grid place-items-center transition-colors",
                active ? "bg-brand-50 text-brand-500" : "text-ink-500 hover:bg-ink-100"
              )}
            >
              <Icon size={17} />
            </span>
          );
          return href ? (
            <Link key={i} href={href}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}

        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink-100 grid place-items-center p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dps-crest.png" alt="Delhi Public School" width={26} height={26} />
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="w-9 h-9 rounded-lg grid place-items-center text-ink-700 hover:bg-ink-100"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={clsx(
        "flex w-64 max-w-[85vw] shrink-0 flex-col border-r border-ink-100 bg-white h-screen top-0 px-4 py-5",
        overlay ? "fixed z-40 left-0 shadow-2xl" : "hidden md:flex sticky"
      )}
    >
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink-900 text-white grid place-items-center text-sm font-bold">
            V
          </div>
          <span className="font-semibold text-ink-900 font-display">VedaAI</span>
        </Link>
        {overlay ? (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
            className="text-ink-500 hover:text-ink-900"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="text-ink-500 hover:text-ink-900"
          >
            <ChevronsLeft size={17} />
          </button>
        )}
      </div>

      <div className="relative mt-5" ref={toolkitRef}>
        <button
          type="button"
          onClick={() => setToolkitOpen((o) => !o)}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-ink-900 border-2 border-brand-500 text-white font-medium text-sm py-2.5 hover:bg-ink-700 transition-colors"
        >
          <Sparkles size={16} className="text-brand-400" />
          AI Teacher&apos;s Toolkit
        </button>

        {toolkitOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-ink-100 bg-white shadow-card py-1.5 z-30">
            <button
              type="button"
              onClick={() => {
                setToolkitOpen(false);
                if (overlay) setMobileSidebarOpen(false);
                router.push("/");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 text-left"
            >
              <Wand2 size={15} />
              Grade an assignment
            </button>
            <div className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-400 cursor-not-allowed">
              <Sparkles size={15} />
              Ask Gemini about your class
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              onClick={() => overlay && setMobileSidebarOpen(false)}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-ink-100 text-ink-900 font-semibold" : "text-ink-700 hover:bg-ink-100"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <a
        href="#"
        className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-500 hover:bg-ink-100"
      >
        <Settings size={18} />
        Settings
      </a>

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-ink-100 p-3">
        <div className="w-9 h-9 rounded-md bg-ink-50 grid place-items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dps-crest.png" alt="Delhi Public School" width={26} height={26} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900 truncate">Delhi Public School</p>
          <p className="text-xs text-ink-500 truncate">Bokaro Steel City</p>
        </div>
      </div>
    </aside>
  );
}
