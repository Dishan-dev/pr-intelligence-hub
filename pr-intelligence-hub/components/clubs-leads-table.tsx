"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Mail, Phone, Search, X } from "lucide-react";

import { ExportCsvButton } from "@/components/export-csv-button";
import type { ClubLead } from "@/lib/data/clubs-societies";

const priorityStyles = {
  High: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
  "Medium-High": "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  Medium: "bg-slate-700/50 text-slate-300 border border-slate-600",
};

export function ClubsLeadsTable({ leads }: { leads: ClubLead[] }) {
  const [allLeads, setAllLeads] = useState(leads);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<ClubLead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const pageSize = 8;
  useEffect(() => {
    const savedLeads = window.localStorage.getItem("clubs-societies-manual-leads");
    if (savedLeads) {
      try {
        setAllLeads([...leads, ...JSON.parse(savedLeads) as ClubLead[]]);
      } catch {
        window.localStorage.removeItem("clubs-societies-manual-leads");
      }
    }
  }, [leads]);
  const categories = useMemo(
    () => Array.from(new Set(allLeads.map((lead) => lead.category))).sort(),
    [allLeads],
  );
  const filteredLeads = useMemo(
    () =>
      allLeads.filter((lead) =>
        (category === "" || lead.category === category) &&
        [lead.id, lead.name, lead.institution, lead.category, lead.area, lead.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [allLeads, category, normalizedSearch],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const visibleLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [category, normalizedSearch]);

  function addLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const newLead: ClubLead = {
      id: `MAN-${Date.now()}`,
      name: String(values.name),
      institution: String(values.institution),
      category: String(values.category),
      area: String(values.area),
      email: values.email ? [String(values.email)] : undefined,
      phone: values.phone ? String(values.phone) : undefined,
      contact: values.contact ? String(values.contact) : undefined,
      page: String(values.page || "#"),
      confidence: String(values.confidence || "Manually added"),
      priority: values.priority as ClubLead["priority"],
      pitch: String(values.pitch || ""),
      bestUse: String(values.bestUse || ""),
      nextAction: String(values.nextAction || "Follow up manually"),
      status: String(values.status || "Not contacted"),
    };
    const manualLeads = [...allLeads.filter((lead) => lead.id.startsWith("MAN-")), newLead];
    setAllLeads([...allLeads, newLead]);
    window.localStorage.setItem("clubs-societies-manual-leads", JSON.stringify(manualLeads));
    void fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "club", name: newLead.name, details: newLead.institution }),
    }).catch(() => undefined);
    setShowAddForm(false);
    event.currentTarget.reset();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 backdrop-blur-sm">
        <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clubs, institutions, categories or status"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          aria-label="Search clubs and societies"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="max-w-[42%] border-l border-slate-700 bg-transparent pl-3 text-sm text-slate-300 outline-none"
          aria-label="Filter by category"
        >
          <option value="" className="bg-slate-800">All categories</option>
          {categories.map((leadCategory) => (
            <option key={leadCategory} value={leadCategory} className="bg-slate-800">
              {leadCategory}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap text-xs text-slate-500">{filteredLeads.length} of {allLeads.length}</span>
        <ExportCsvButton filename="clubs-and-societies.csv" headers={["ID", "Name", "Institution", "Category", "Area", "Emails", "Phone", "Contact", "Priority", "Pitch", "Best use", "Next action", "Status", "Page"]} rows={allLeads.map((lead) => [lead.id, lead.name, lead.institution, lead.category, lead.area, lead.email?.join("; "), lead.phone, lead.contact, lead.priority, lead.pitch, lead.bestUse, lead.nextAction, lead.status, lead.page])} />
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="ml-auto rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          Add lead
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-400">
            <tr>
              <th className="w-[34%] px-4 py-3">Lead</th>
              <th className="w-[23%] px-4 py-3">Institution / area</th>
              <th className="w-[18%] px-4 py-3">Category</th>
              <th className="w-[11%] px-4 py-3">Priority</th>
              <th className="w-[14%] px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {visibleLeads.map((lead) => (
              <tr
                key={lead.id}
                className="cursor-pointer transition hover:bg-slate-800/50"
                tabIndex={0}
                onClick={() => setSelectedLead(lead)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedLead(lead);
                  }
                }}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="block max-w-full text-left"
                  >
                    <span className="block truncate font-medium text-white hover:text-emerald-400 transition-colors">
                      {lead.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{lead.id}</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="truncate text-slate-300">{lead.institution}</p>
                  <p className="truncate text-xs text-slate-500">{lead.area}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="line-clamp-2 text-slate-400">{lead.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${priorityStyles[lead.priority]}`}>
                    {lead.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="line-clamp-2 text-xs font-medium text-slate-400">{lead.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No leads match your search.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-4 text-sm">
          <p className="text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-club-lead-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 id="add-club-lead-title" className="text-xl font-bold text-white">Add club or society</h2>
              <button type="button" onClick={() => setShowAddForm(false)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close add lead form">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={addLead} className="grid gap-4 py-5 sm:grid-cols-2">
              {[
                ["name", "Club or society name"],
                ["institution", "Institution"],
                ["category", "Category"],
                ["area", "Area"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["contact", "Contact route - where or who to contact"],
                ["page", "Public page URL"],
                ["confidence", "Contact confidence - how reliable the contact is"],
                ["pitch", "Pitch"],
                ["bestUse", "Best use - ideal collaboration opportunity"],
                ["nextAction", "Next action - immediate follow-up step"],
                ["status", "Status"],
              ].map(([name, label]) => (
                <label key={name} className="text-sm font-medium text-slate-300">
                  {label}
                  <input name={name} required={["name", "institution", "category", "area"].includes(name)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-300">
                Priority
                <select name="priority" defaultValue="Medium" className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500">
                  <option>High</option>
                  <option>Medium-High</option>
                  <option>Medium</option>
                </select>
              </label>
              <div className="flex items-end justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="submit" className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">Add lead</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedLead(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="club-lead-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="font-mono text-xs text-slate-500">{selectedLead.id}</p>
                <h2 id="club-lead-title" className="mt-1 text-xl font-bold text-white">
                  {selectedLead.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedLead.institution} · {selectedLead.area}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close lead details"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-5 py-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-1 text-sm text-slate-300">{selectedLead.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority / status</p>
                <p className="mt-1 text-sm text-slate-300">{selectedLead.priority} · {selectedLead.status}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact</p>
                <div className="mt-2 space-y-1 text-sm text-slate-300">
                  {selectedLead.email?.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                      <Mail className="size-3.5" />{email}
                    </a>
                  ))}
                  {selectedLead.phone && <p className="flex items-center gap-2"><Phone className="size-3.5 text-slate-500" />{selectedLead.phone}</p>}
                  {selectedLead.contact && <p>{selectedLead.contact}</p>}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact confidence</p>
                <p className="mt-1 text-sm text-slate-300">{selectedLead.confidence}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pitch</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{selectedLead.pitch}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Best use</p>
                <p className="mt-1 text-sm text-slate-300">{selectedLead.bestUse}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Next action</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">{selectedLead.nextAction}</p>
              </div>
            </div>
            <a
              href={selectedLead.page}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Open public page <ExternalLink className="size-3.5" />
            </a>
          </section>
        </div>
      )}
    </>
  );
}
