"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail, Phone, Search, X } from "lucide-react";

import { ExportCsvButton } from "@/components/export-csv-button";
import type { MediaLead } from "@/lib/data/media-opportunities";

export function MediaLeadsTable({ leads }: { leads: MediaLead[] }) {
  const [allLeads, setAllLeads] = useState(leads);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<MediaLead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<MediaLead | null>(null);
  const pageSize = 8;
  const normalizedSearch = search.trim().toLowerCase();
  const categories = useMemo(
    () => Array.from(new Set(allLeads.map((lead) => lead.category))).sort(),
    [allLeads],
  );
  const filteredLeads = useMemo(
    () => allLeads.filter((lead) =>
      (category === "" || lead.category === category) &&
      [lead.id, lead.name, lead.category, lead.email?.join(" "), lead.phone, lead.contact, lead.status]
        .filter(Boolean)
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

  useEffect(() => {
    const savedLeads = window.localStorage.getItem("media-opportunity-leads") ?? window.localStorage.getItem("media-opportunity-manual-leads");
    if (savedLeads) {
      try {
        setAllLeads([...leads, ...(JSON.parse(savedLeads) as MediaLead[])]);
      } catch {
        window.localStorage.removeItem("media-opportunity-manual-leads");
      }
    }
  }, [leads]);

  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const newLead: MediaLead = {
      id: editingLead?.id ?? `MAN-${Date.now()}`,
      name: String(values.name),
      category: values.category as MediaLead["category"],
      email: values.email ? [String(values.email)] : undefined,
      phone: values.phone ? String(values.phone) : undefined,
      contact: values.contact ? String(values.contact) : undefined,
      bestApproach: values.bestApproach ? String(values.bestApproach) : undefined,
      source: values.source ? String(values.source) : undefined,
      priority: values.priority as MediaLead["priority"],
      status: "Not contacted",
    };
    const nextLeads = editingLead
      ? allLeads.map((lead) => lead.id === editingLead.id ? newLead : lead)
      : [...allLeads, newLead];
    setAllLeads(nextLeads);
    window.localStorage.setItem("media-opportunity-leads", JSON.stringify(nextLeads));
    if (!editingLead) {
      void fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "media", name: newLead.name, details: newLead.category }),
      }).catch(() => undefined);
    }
    setShowAddForm(false);
    setEditingLead(null);
    setSelectedLead(null);
    event.currentTarget.reset();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 backdrop-blur-sm">
        <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search media organizations, contacts or emails"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          aria-label="Search media opportunities"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="max-w-[42%] border-l border-slate-700 bg-transparent pl-3 text-sm text-slate-300 outline-none"
          aria-label="Filter media category"
        >
          <option value="" className="bg-slate-800">All media types</option>
          {categories.map((item) => <option key={item} value={item} className="bg-slate-800">{item}</option>)}
        </select>
        <span className="whitespace-nowrap text-xs text-slate-500">{filteredLeads.length} of {allLeads.length}</span>
        <ExportCsvButton filename="media-opportunities.csv" headers={["ID", "Media organization", "Type", "Emails", "Phone", "Contact", "Priority", "Best approach", "Source", "Status"]} rows={allLeads.map((lead) => [lead.id, lead.name, lead.category, lead.email?.join("; "), lead.phone, lead.contact, lead.priority, lead.bestApproach, lead.source, lead.status])} />
        <button type="button" onClick={() => setShowAddForm(true)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors">Add opportunity</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-400">
            <tr>
              <th className="w-[42%] px-4 py-3">Media organization</th>
              <th className="w-[22%] px-4 py-3">Type</th>
              <th className="w-[36%] px-4 py-3">Contact</th>
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
                  <span className="block truncate font-medium text-white">{lead.name}</span>
                  <span className="font-mono text-xs text-slate-500">{lead.id}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{lead.category}</td>
                <td className="px-4 py-3">
                  <span className="block truncate text-slate-300">{lead.email?.[0] ?? "No email"}</span>
                  <span className="block truncate text-xs text-slate-500">{lead.phone ?? lead.contact ?? "No phone listed"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">No media leads match your search.</p>}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-4 text-sm">
          <p className="text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="add-media-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 id="add-media-title" className="text-xl font-bold text-white">{editingLead ? "Edit media opportunity" : "Add media opportunity"}</h2>
              <button type="button" onClick={() => { setShowAddForm(false); setEditingLead(null); }} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close media opportunity form"><X className="size-4" /></button>
            </div>
            <form onSubmit={addLead} className="grid gap-4 py-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-300 sm:col-span-2">Media organization<input name="name" required defaultValue={editingLead?.name} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <label className="text-sm font-medium text-slate-300">Media type<select name="category" defaultValue={editingLead?.category ?? "Digital media"} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500"><option>Newspaper</option><option>Magazine</option><option>Digital media</option><option>TV</option><option>Radio</option><option>Photography</option><option>Webcast</option></select></label>
              <label className="text-sm font-medium text-slate-300">Priority<select name="priority" defaultValue={editingLead?.priority ?? "Medium"} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500"><option>High</option><option>Medium-High</option><option>Medium</option></select></label>
              <label className="text-sm font-medium text-slate-300">Email<input name="email" type="email" defaultValue={editingLead?.email?.[0]} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <label className="text-sm font-medium text-slate-300">Phone / WhatsApp<input name="phone" defaultValue={editingLead?.phone} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <label className="text-sm font-medium text-slate-300">Contact person or route<input name="contact" defaultValue={editingLead?.contact} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <label className="text-sm font-medium text-slate-300">Source<input name="source" defaultValue={editingLead?.source} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <label className="text-sm font-medium text-slate-300 sm:col-span-2">Best approach<textarea name="bestApproach" rows={3} defaultValue={editingLead?.bestApproach} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label>
              <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => { setShowAddForm(false); setEditingLead(null); }} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">{editingLead ? "Save changes" : "Add opportunity"}</button></div>
            </form>
          </section>
        </div>
      )}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedLead(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="media-lead-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="font-mono text-xs text-slate-500">{selectedLead.id}</p>
                <h2 id="media-lead-title" className="mt-1 text-xl font-bold text-white">{selectedLead.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{selectedLead.category} · {selectedLead.status}</p>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close media lead details"><X className="size-4" /></button>
            </div>
            <div className="space-y-5 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact</p>
                <div className="mt-2 space-y-1 text-sm text-slate-300">
                  {selectedLead.email?.map((email) => <a key={email} href={`mailto:${email}`} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"><Mail className="size-3.5" />{email}</a>)}
                  {selectedLead.phone && <p className="flex items-center gap-2"><Phone className="size-3.5 text-slate-500" />{selectedLead.phone}</p>}
                  {selectedLead.whatsapp && <p className="text-sm">WhatsApp: {selectedLead.whatsapp}</p>}
                  {selectedLead.contact && <p>{selectedLead.contact}</p>}
                  {!selectedLead.email && !selectedLead.phone && !selectedLead.contact && <p>No direct contact details available.</p>}
                </div>
              </div>
              {selectedLead.address && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Address / location</p><p className="mt-1 text-sm leading-6 text-slate-300">{selectedLead.address}</p></div>}
              {selectedLead.bestApproach && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Best approach</p><p className="mt-1 text-sm leading-6 text-slate-300">{selectedLead.bestApproach}</p></div>}
              {selectedLead.priority && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</p><p className="mt-1 text-sm text-slate-300">{selectedLead.priority}</p></div>}
              {selectedLead.note && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Note</p><p className="mt-1 text-sm leading-6 text-slate-300">{selectedLead.note}</p></div>}
              {selectedLead.source && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Source</p><p className="mt-1 text-sm text-slate-300">{selectedLead.source}</p></div>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
