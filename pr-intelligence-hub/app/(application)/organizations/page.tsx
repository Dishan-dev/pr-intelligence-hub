import { Building2 } from "lucide-react";

import { PageEmptyState } from "@/components/page-empty-state";

export const metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Stakeholders</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Organizations</h1>
        <p className="mt-2 text-sm text-slate-600">Keep a clear view of the external organizations in your network.</p>
      </div>
      <PageEmptyState
        icon={Building2}
        title="No organizations yet"
        description="Organizations will provide the stakeholder context and relationship history for your opportunities."
      />
    </section>
  );
}
