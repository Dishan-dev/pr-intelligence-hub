import { PRCalendar } from "@/components/pr-calendar";
import { PR_CALENDAR_DATES } from "@/lib/data/pr-calendar";

export const metadata = { title: "PR Calendar" };

export default function PRCalendarPage() {
  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Planning desk</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">PR Calendar</h1>
        <p className="mt-2 text-sm text-slate-400">
          Plan outreach around SDG observances, Sri Lankan dates, and global moments that matter to your audience.
        </p>
      </div>
      <PRCalendar dates={PR_CALENDAR_DATES} />
    </section>
  );
}

