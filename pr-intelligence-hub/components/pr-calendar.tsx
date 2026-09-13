"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { PRCalendarDate, PRDateCategory } from "@/lib/data/pr-calendar";

const categoryStyles: Record<PRDateCategory, string> = {
  SDG: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Sri Lanka": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  World: "border-sky-500/30 bg-sky-500/10 text-sky-400",
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PRCalendar({ dates }: { dates: PRCalendarDate[] }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [category, setCategory] = useState<PRDateCategory | "all">("all");
  const [selectedDate, setSelectedDate] = useState<PRCalendarDate | null>(null);
  const visibleDates = useMemo(
    () => dates.filter((date) => category === "all" || date.category === category),
    [category, dates],
  );
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const datesForDay = (day: number) => visibleDates.filter((date) => date.month === month && date.day === day);

  function moveMonth(offset: number) {
    const next = new Date(year, month - 1 + offset, 1);
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => moveMonth(-1)} className="grid size-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white" aria-label="Previous month"><ChevronLeft className="size-4" /></button>
          <h2 className="min-w-36 text-center text-lg font-bold text-white">{monthNames[month - 1]} {year}</h2>
          <button type="button" onClick={() => moveMonth(1)} className="grid size-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white" aria-label="Next month"><ChevronRight className="size-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "SDG", "Sri Lanka", "World"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${category === item ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white"}`}>
              {item === "all" ? "All dates" : item}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/60">
          {weekDays.map((day) => <div key={day} className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayDates = day ? datesForDay(day) : [];
            return (
              <div key={`${year}-${month}-${index}`} className="min-h-28 border-b border-r border-slate-800 p-2 last:border-r-0 sm:min-h-32">
                {day && <><p className={`text-xs font-medium ${day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear() ? "grid size-6 place-items-center rounded-full bg-emerald-500 text-slate-950" : "text-slate-500"}`}>{day}</p><div className="mt-2 space-y-1">{dayDates.map((date) => <button key={date.id} type="button" onClick={() => setSelectedDate(date)} className={`block w-full truncate rounded border px-1.5 py-1 text-left text-[11px] font-medium transition hover:opacity-80 ${categoryStyles[date.category]}`} title={date.name}>{date.name}</button>)}</div></>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {(["SDG", "Sri Lanka", "World"] as const).map((item) => <span key={item} className="flex items-center gap-2"><span className={`size-3 rounded border ${categoryStyles[item]}`} />{item}</span>)}
        <span className="text-slate-600">Dates with lunar observances should be confirmed against the official annual calendar.</span>
      </div>
      {selectedDate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDate(null); }}><section role="dialog" aria-modal="true" aria-labelledby="pr-date-title" className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${categoryStyles[selectedDate.category]}`}>{selectedDate.category}</span><h2 id="pr-date-title" className="mt-3 text-xl font-bold text-white">{selectedDate.name}</h2><p className="mt-1 text-sm text-slate-400">{monthNames[selectedDate.month - 1]} {selectedDate.day}</p></div><button type="button" onClick={() => setSelectedDate(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close date details"><X className="size-4" /></button></div><p className="mt-5 text-sm leading-6 text-slate-300">{selectedDate.description}</p><div className="mt-5 border-t border-slate-800 pt-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">PR angle</p><p className="mt-1 text-sm leading-6 text-slate-300">{selectedDate.prAngle}</p></div></section></div>}
    </>
  );
}

