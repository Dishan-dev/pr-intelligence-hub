import { TemplatesLibrary } from "@/components/templates-library";
import { MESSAGE_TEMPLATES } from "@/lib/data/templates";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outreach toolkit</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Templates</h1>
        <p className="mt-2 text-sm text-slate-400">
          Ready-to-adapt messages for clubs, societies, media contacts, and partners.
        </p>
      </div>
      <TemplatesLibrary templates={MESSAGE_TEMPLATES} />
    </section>
  );
}

