"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, Target } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discoveries", label: "Discoveries", icon: Inbox },
  { href: "/opportunities", label: "Opportunities", icon: Target },
  { href: "/organizations", label: "Organizations", icon: Building2 },
] as const;

export function ApplicationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-60 md:border-r md:border-b-0">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">PR</span>
          <span>Intelligence Hub</span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:py-5" aria-label="Primary navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-slate-200 p-3 md:mt-auto md:block">
        <LogoutButton />
      </div>
    </aside>
  );
}
