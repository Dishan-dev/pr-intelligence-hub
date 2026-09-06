import { BarChart3 } from "lucide-react";

import { PageEmptyState } from "@/components/page-empty-state";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Monitor your external representation pipeline at a glance.</p>
      </div>
      <PageEmptyState
        icon={BarChart3}
        title="Your opportunity pipeline will appear here"
        description="Add organizations and opportunities to start tracking upcoming events, deadlines, and high-priority work."
      />
    </section>
  );
}
