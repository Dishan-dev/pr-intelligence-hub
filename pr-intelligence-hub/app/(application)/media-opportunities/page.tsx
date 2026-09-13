import { MediaLeadsTable } from "@/components/media-leads-table";
import { MEDIA_LEADS } from "@/lib/data/media-opportunities";

export const metadata = { title: "Media opportunities" };

export default function MediaOpportunitiesPage() {
  return (
    <section>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">External visibility</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Media opportunities
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Search media outreach contacts and open a row for contact details.
          </p>
        </div>
        <p className="text-sm text-slate-500">{MEDIA_LEADS.length} leads</p>
      </div>
      <MediaLeadsTable leads={MEDIA_LEADS} />
    </section>
  );
}

