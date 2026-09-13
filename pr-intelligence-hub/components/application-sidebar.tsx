"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, ClipboardList, GraduationCap, Inbox, LayoutDashboard, Menu, Newspaper, X } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discoveries", label: "Discoveries", icon: Inbox },
  { href: "/clubs-societies", label: "Clubs & societies", icon: GraduationCap },
  { href: "/media-opportunities", label: "Media opportunities", icon: Newspaper },
  { href: "/pr-calendar", label: "PR Calendar", icon: CalendarDays },
  { href: "/templates", label: "Templates", icon: ClipboardList },
] as const;

export function ApplicationSidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="relative sticky top-0 z-30 flex w-full shrink-0 flex-col border-b border-slate-800 bg-slate-900 backdrop-blur-xl md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:border-b-0">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4 sm:px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/30 transition-shadow group-hover:shadow-emerald-500/50">
            <span className="text-xs font-bold text-slate-950 tracking-tight">CS</span>
          </div>
          <span className="whitespace-nowrap text-sm font-semibold tracking-wide text-white sm:text-base">
            CS PR HUB
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Nav panel */}
      <div
        className={`${menuOpen ? "block" : "hidden"} absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-800 bg-slate-900 shadow-2xl md:static md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-visible md:border-0 md:shadow-none`}
      >
        <nav
          id="primary-navigation"
          className="flex flex-col gap-0.5 px-3 py-3 md:overflow-y-auto md:py-4"
          aria-label="Primary navigation"
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 md:gap-3",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 pl-[10px]"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent pl-[10px]",
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white")}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">{label}</span>
                {isActive && (
                  <span className="ml-auto size-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-3 md:mt-auto">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

