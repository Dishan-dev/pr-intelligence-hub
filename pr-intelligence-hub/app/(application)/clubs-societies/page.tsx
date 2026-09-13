import { CLUB_LEADS } from "@/lib/data/clubs-societies";
import { ClubsLeadsTable } from "@/components/clubs-leads-table";

export const metadata = { title: "Clubs & societies" };

export default function ClubsAndSocietiesPage() {
  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">External network</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Clubs & societies
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Search outreach leads outside the University of Moratuwa and open a row for full details.
        </p>
      </div>
      <ClubsLeadsTable leads={CLUB_LEADS} />
    </section>
  );
}

