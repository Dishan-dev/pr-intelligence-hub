"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Search } from "lucide-react";

import type { MessageTemplate, TemplateChannel } from "@/lib/data/templates";

const channelStyles: Record<TemplateChannel, string> = {
  Email: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  Instagram: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
  WhatsApp: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
};

export function TemplatesLibrary({ templates }: { templates: MessageTemplate[] }) {
  const [channel, setChannel] = useState<TemplateChannel | "all">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredTemplates = useMemo(
    () => templates.filter((template) =>
      (channel === "all" || template.channel === channel) &&
      [template.title, template.purpose, template.channel, template.subject, template.body]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    ),
    [channel, normalizedSearch, templates],
  );

  async function copyTemplate(template: MessageTemplate) {
    const content = template.subject ? `Subject: ${template.subject}\n\n${template.body}` : template.body;
    await navigator.clipboard.writeText(content);
    setCopiedId(template.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 backdrop-blur-sm">
        <Search className="size-4 text-slate-500" aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates" aria-label="Search templates" className="min-w-48 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        {(["all", "Email", "Instagram", "WhatsApp"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setChannel(item)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${channel === item ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white"}`}>
            {item === "all" ? "All channels" : item}
          </button>
        ))}
        <span className="text-xs text-slate-500">{filteredTemplates.length} templates</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredTemplates.map((template) => (
          <article key={template.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm transition hover:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${channelStyles[template.channel]}`}>{template.channel}</span>
                <h2 className="mt-3 font-semibold text-white">{template.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{template.purpose}</p>
              </div>
              <button type="button" onClick={() => copyTemplate(template)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${copiedId === template.id ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"}`} title="Copy template">
                {copiedId === template.id ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
                {copiedId === template.id ? "Copied" : "Copy"}
              </button>
            </div>
            {template.subject && <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500"><span className="font-medium text-slate-400">Subject:</span> {template.subject}</p>}
            <pre className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap border-t border-slate-800 pt-3 font-sans text-sm leading-6 text-slate-400">{template.body}</pre>
          </article>
        ))}
      </div>
      {filteredTemplates.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-10 text-center text-sm text-slate-500">No templates match your search.</p>}
    </>
  );
}

