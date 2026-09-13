import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, GraduationCap, Newspaper } from "lucide-react";
import { CLUB_LEADS } from "@/lib/data/clubs-societies";
import { MEDIA_LEADS } from "@/lib/data/media-opportunities";
import { PR_CALENDAR_DATES } from "@/lib/data/pr-calendar";
import { MESSAGE_TEMPLATES } from "@/lib/data/templates";

export const metadata = { title: "Dashboard" };
export const instant = false;

export default function DashboardPage() {
  const calendarBreakdown = [
    { label: "SDG", value: PR_CALENDAR_DATES.filter((date) => date.category === "SDG").length, color: "bg-emerald-500" },
    { label: "Sri Lanka", value: PR_CALENDAR_DATES.filter((date) => date.category === "Sri Lanka").length, color: "bg-amber-500" },
    { label: "World", value: PR_CALENDAR_DATES.filter((date) => date.category === "World").length, color: "bg-sky-500" },
  ];
  const calendarTotal = calendarBreakdown.reduce((total, item) => total + item.value, 0);

  return (
    <section>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PR workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          A quick view of the resources available for planning outreach and managing external representation.
        </p>
      </div>

      {/* Research inbox hero banner */}
      <div className="mb-6 relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 p-6 sm:p-7">
        {/* Glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)", filter: "blur(40px)" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Research inbox</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Find your next opportunity.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Review AI-found opportunities, check deadlines, and move the strongest discoveries into your pipeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/discoveries"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
            >
              Open discoveries <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Workspace overview cards */}
      <WorkspaceOverview />

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Coverage chart */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resource mix</p>
              <h2 className="mt-1 text-lg font-semibold text-white">PR workspace coverage</h2>
            </div>
            <span className="flex items-center gap-1.5 text-2xl font-bold text-white">
              <BarChart3 className="size-5 text-slate-500" />
              {CLUB_LEADS.length + MEDIA_LEADS.length + MESSAGE_TEMPLATES.length}
            </span>
          </div>
          <div className="mt-6 space-y-5">
            <ChartRow label="Media contacts" value={MEDIA_LEADS.length} total={MEDIA_LEADS.length + CLUB_LEADS.length + MESSAGE_TEMPLATES.length} color="bg-sky-500" />
            <ChartRow label="Club & society leads" value={CLUB_LEADS.length} total={MEDIA_LEADS.length + CLUB_LEADS.length + MESSAGE_TEMPLATES.length} color="bg-amber-500" />
            <ChartRow label="Message templates" value={MESSAGE_TEMPLATES.length} total={MEDIA_LEADS.length + CLUB_LEADS.length + MESSAGE_TEMPLATES.length} color="bg-emerald-500" />
          </div>
        </section>

        {/* Calendar chart */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Planning signals</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Calendar coverage</h2>
            </div>
            <Link href="/pr-calendar" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Open calendar →
            </Link>
          </div>
          <div className="mt-6 space-y-5">
            {calendarBreakdown.map((item) => (
              <ChartRow key={item.label} label={item.label} value={item.value} total={calendarTotal} color={item.color} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

const cardConfig = [
  { href: "/clubs-societies", label: "Club & society leads", detail: "External partnership contacts", icon: GraduationCap, accent: "amber" },
  { href: "/media-opportunities", label: "Media opportunities", detail: "Press, TV, radio and digital", icon: Newspaper, accent: "sky" },
  { href: "/templates", label: "Message templates", detail: "Email, Instagram and WhatsApp", icon: ClipboardList, accent: "violet" },
  { href: "/pr-calendar", label: "Calendar moments", detail: "SDG, Sri Lanka and world dates", icon: CalendarDays, accent: "emerald" },
] as const;

const accentColors: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

function WorkspaceCard({ href, label, value, detail, icon: Icon, accent }: {
  href: string; label: string; value: number; detail: string;
  icon: typeof CalendarDays; accent: string;
}) {
  const colors = accentColors[accent] ?? accentColors.emerald;
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex size-9 items-center justify-center rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`size-4 ${colors.text}`} />
        </div>
        <ArrowRight className="size-4 text-slate-600 transition-colors group-hover:text-slate-400" />
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </Link>
  );
}

function WorkspaceOverview() {
  const values: Record<string, number> = {
    "/clubs-societies": CLUB_LEADS.length,
    "/media-opportunities": MEDIA_LEADS.length,
    "/templates": MESSAGE_TEMPLATES.length,
    "/pr-calendar": PR_CALENDAR_DATES.length,
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PR workspace</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Your outreach toolkit at a glance</h2>
        </div>
        <p className="text-xs text-slate-600">Open a page to work the details</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cardConfig.map((card) => (
          <WorkspaceCard
            key={card.href}
            href={card.href}
            label={card.label}
            detail={card.detail}
            icon={card.icon}
            accent={card.accent}
            value={values[card.href] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

function ChartRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">
          {value} <span className="font-normal text-slate-600">({percentage}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

