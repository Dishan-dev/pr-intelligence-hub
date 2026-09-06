import Link from "next/link";
import { Suspense } from "react";
import { Plus, SlidersHorizontal, Target } from "lucide-react";

import { OpportunityPriorityBadge, OpportunityStatusBadge } from "@/components/opportunity-badge";
import { PageEmptyState } from "@/components/page-empty-state";
import { Button } from "@/components/ui/button";
import {
  OPPORTUNITY_CATEGORIES, OPPORTUNITY_CATEGORY_LABELS, OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_PRIORITY_LABELS, OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_LABELS,
  REPRESENTATION_TYPES, REPRESENTATION_TYPE_LABELS, type OpportunityCategory,
  type OpportunityPriority, type OpportunityStatus, type RepresentationType,
} from "@/lib/domain/opportunity";
import { getOpportunities, type OpportunityFilters } from "@/lib/data/opportunities";

export const metadata = { title: "Opportunities" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return typeof value === "string" ? value : undefined; }
function inOptions<T extends readonly string[]>(value: string | undefined, options: T): T[number] | undefined { return value && options.includes(value) ? value as T[number] : undefined; }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—"; }

async function OpportunitiesContent({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const filters: OpportunityFilters = {
    status: inOptions(one(query.status), OPPORTUNITY_STATUSES) as OpportunityStatus | undefined,
    category: inOptions(one(query.category), OPPORTUNITY_CATEGORIES) as OpportunityCategory | undefined,
    representationType: inOptions(one(query.representationType), REPRESENTATION_TYPES) as RepresentationType | undefined,
    priority: inOptions(one(query.priority), OPPORTUNITY_PRIORITIES) as OpportunityPriority | undefined,
    sort: inOptions(one(query.sort), ["event", "deadline", "score", "recent"] as const),
  };
  const opportunities = await getOpportunities(filters);
  const hasFilters = Boolean(filters.status || filters.category || filters.representationType || filters.priority);
  const selectClass = "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900";

  return <>
    <form className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3" action="/opportunities"><SlidersHorizontal className="size-4 text-slate-500" aria-hidden="true" />
      <select className={selectClass} name="status" defaultValue={filters.status ?? ""}><option value="">All statuses</option>{OPPORTUNITY_STATUSES.map((status) => <option key={status} value={status}>{OPPORTUNITY_STATUS_LABELS[status]}</option>)}</select>
      <select className={selectClass} name="category" defaultValue={filters.category ?? ""}><option value="">All categories</option>{OPPORTUNITY_CATEGORIES.map((category) => <option key={category} value={category}>{OPPORTUNITY_CATEGORY_LABELS[category]}</option>)}</select>
      <select className={selectClass} name="representationType" defaultValue={filters.representationType ?? ""}><option value="">All representation types</option>{REPRESENTATION_TYPES.map((type) => <option key={type} value={type}>{REPRESENTATION_TYPE_LABELS[type]}</option>)}</select>
      <select className={selectClass} name="priority" defaultValue={filters.priority ?? ""}><option value="">All priorities</option>{OPPORTUNITY_PRIORITIES.map((priority) => <option key={priority} value={priority}>{OPPORTUNITY_PRIORITY_LABELS[priority]}</option>)}</select>
      <select className={selectClass} name="sort" defaultValue={filters.sort ?? "recent"}><option value="recent">Recently added</option><option value="event">Nearest event</option><option value="deadline">Nearest deadline</option><option value="score">Highest score</option></select>
      <Button type="submit" variant="outline">Apply</Button>{hasFilters && <Button asChild variant="ghost"><Link href="/opportunities">Clear</Link></Button>}
    </form>
    {opportunities.length === 0 ? <PageEmptyState icon={Target} title={hasFilters ? "No opportunities match these filters" : "No opportunities yet"} description={hasFilters ? "Try clearing a filter or choose a different combination." : "Add an opportunity to begin evaluating your external representation pipeline."} /> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500"><tr>{["Opportunity", "Organization", "Category", "Representation", "Event", "Deadline", "Score", "Priority", "Status"].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{opportunities.map((opportunity) => <tr key={opportunity.id} className="hover:bg-slate-50"><td className="max-w-56 px-4 py-3 font-medium text-slate-950"><Link className="hover:underline" href={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link></td><td className="px-4 py-3 text-slate-600">{opportunity.organization?.name ?? "—"}</td><td className="px-4 py-3 text-slate-600">{opportunity.category ? OPPORTUNITY_CATEGORY_LABELS[opportunity.category] : "—"}</td><td className="px-4 py-3 text-slate-600">{opportunity.representationType ? REPRESENTATION_TYPE_LABELS[opportunity.representationType] : "—"}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(opportunity.eventDate)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(opportunity.applicationDeadline)}</td><td className="px-4 py-3 font-medium text-slate-800">{opportunity.overallScore?.toFixed(1) ?? "—"}</td><td className="px-4 py-3"><OpportunityPriorityBadge priority={opportunity.priority} /></td><td className="px-4 py-3"><OpportunityStatusBadge status={opportunity.status} /></td></tr>)}</tbody></table></div>}
  </>;
}

function OpportunitiesLoadingState() {
  return <div className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" aria-busy="true" />;
}

export default function OpportunitiesPage({ searchParams }: { searchParams: SearchParams }) {
  return <section>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-slate-500">Pipeline</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Opportunities</h1><p className="mt-2 text-sm text-slate-600">Discover, evaluate, and track external representation opportunities.</p></div><Button asChild><Link href="/opportunities/new"><Plus />Add opportunity</Link></Button></div>
    <Suspense fallback={<OpportunitiesLoadingState />}>
      <OpportunitiesContent searchParams={searchParams} />
    </Suspense>
  </section>;
}
