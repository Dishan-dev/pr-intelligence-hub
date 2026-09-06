import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, ChevronLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { OpportunityLifecycleActions } from "@/components/opportunity-lifecycle-actions";
import { OpportunityPriorityBadge, OpportunityStatusBadge } from "@/components/opportunity-badge";
import { Button } from "@/components/ui/button";
import {
  OPPORTUNITY_CATEGORY_LABELS, OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_LABELS,
  REPRESENTATION_TYPE_LABELS,
} from "@/lib/domain/opportunity";
import { getOpportunity } from "@/lib/data/opportunities";
import { updateOpportunityStatus } from "../actions";

type Props = { params: Promise<{ id: string }> };
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Not set"; }
function formatTimestamp(value: string) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }

async function OpportunityDetailContent({ params }: Props) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) notFound();
  const scoreRows = [
    ["AIESEC relevance", opportunity.relevanceScore], ["Visibility potential", opportunity.visibilityScore],
    ["Networking value", opportunity.networkingScore], ["Stakeholder value", opportunity.stakeholderValueScore],
    ["Feasibility", opportunity.feasibilityScore],
  ];

  return <section className="mx-auto max-w-5xl"><Button asChild variant="ghost" size="sm"><Link href="/opportunities"><ChevronLeft />Opportunities</Link></Button>
    <div className="mt-4 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><OpportunityStatusBadge status={opportunity.status} /><OpportunityPriorityBadge priority={opportunity.priority} /></div><h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{opportunity.title}</h1><p className="mt-2 text-sm text-slate-600">{opportunity.organization?.name ?? "No organization linked"}</p></div><div className="flex flex-wrap gap-2"><Button asChild><Link href={`/opportunities/${id}/edit`}><Pencil />Edit</Link></Button><OpportunityLifecycleActions id={id} archived={opportunity.status === "archived"} /></div></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Opportunity details</h2><dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</dt><dd className="mt-1 text-sm text-slate-800">{opportunity.category ? OPPORTUNITY_CATEGORY_LABELS[opportunity.category] : "Not set"}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Representation</dt><dd className="mt-1 text-sm text-slate-800">{opportunity.representationType ? REPRESENTATION_TYPE_LABELS[opportunity.representationType] : "Not set"}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Event date</dt><dd className="mt-1 text-sm text-slate-800">{formatDate(opportunity.eventDate)}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Application deadline</dt><dd className="mt-1 text-sm text-slate-800">{formatDate(opportunity.applicationDeadline)}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt><dd className="mt-1 text-sm text-slate-800">{opportunity.location ?? "Not set"}</dd></div></dl>{opportunity.description && <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{opportunity.description}</p></div>}</section>
      <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Sources</h2><dl className="mt-4 space-y-3 text-sm">{opportunity.eventUrl && <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Event URL</dt><dd className="mt-1"><a className="inline-flex items-center gap-1 text-slate-900 underline underline-offset-4" href={opportunity.eventUrl} target="_blank" rel="noreferrer">Open event page <ArrowUpRight className="size-3" /></a></dd></div>}<div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source</dt><dd className="mt-1 text-slate-700">{opportunity.source ?? "Not set"}</dd></div>{opportunity.sourceUrl && <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source URL</dt><dd className="mt-1"><a className="inline-flex items-center gap-1 text-slate-900 underline underline-offset-4" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">Open source <ArrowUpRight className="size-3" /></a></dd></div>}</dl></section>
      {opportunity.notes && <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Notes</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{opportunity.notes}</p></section>}</div>
      <aside className="space-y-6"><section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Evaluation</h2><div className="mt-4 rounded-md bg-slate-100 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall score</p><p className="mt-1 text-3xl font-semibold text-slate-950">{opportunity.overallScore?.toFixed(1) ?? "—"}</p><div className="mt-2"><OpportunityPriorityBadge priority={opportunity.priority} /></div></div><dl className="mt-4 divide-y divide-slate-100">{scoreRows.map(([label, score]) => <div key={label as string} className="flex items-center justify-between py-3 text-sm"><dt className="text-slate-600">{label}</dt><dd className="font-medium text-slate-900">{score ?? "—"}</dd></div>)}</dl></section>
      <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Update status</h2><form action={updateOpportunityStatus} className="mt-4 space-y-3"><input type="hidden" name="id" value={id} /><select name="status" defaultValue={opportunity.status} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">{OPPORTUNITY_STATUSES.map((status) => <option key={status} value={status}>{OPPORTUNITY_STATUS_LABELS[status]}</option>)}</select><Button type="submit" variant="outline" className="w-full">Update status</Button></form></section>
      <p className="text-xs leading-5 text-slate-500">Created {formatTimestamp(opportunity.createdAt)}<br />Last updated {formatTimestamp(opportunity.updatedAt)}</p></aside></div>
  </section>;
}

export default function OpportunityDetailPage({ params }: Props) {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-slate-100" aria-busy="true" />}><OpportunityDetailContent params={params} /></Suspense>;
}
