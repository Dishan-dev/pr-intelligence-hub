import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { OpportunityForm } from "@/components/opportunity-form";
import { Button } from "@/components/ui/button";
import { toOpportunityFormValues } from "@/lib/domain/opportunity-form";
import { getOpportunity, getOrganizationOptions } from "@/lib/data/opportunities";
import { updateOpportunity } from "../../actions";

type Props = { params: Promise<{ id: string }> };
export const metadata = { title: "Edit opportunity" };

async function EditOpportunityContent({ params }: Props) {
  const { id } = await params;
  const [opportunity, organizations] = await Promise.all([getOpportunity(id), getOrganizationOptions()]);
  if (!opportunity) notFound();
  const action = updateOpportunity.bind(null, id);
  return <section className="mx-auto max-w-4xl"><Button asChild variant="ghost" size="sm"><Link href={`/opportunities/${id}`}><ChevronLeft />Opportunity</Link></Button><div className="mb-7 mt-4"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Edit opportunity</h1><p className="mt-2 text-sm text-slate-600">Update the opportunity details, status, or evaluation.</p></div><OpportunityForm organizations={organizations} initialValues={toOpportunityFormValues(opportunity)} action={action} submitLabel="Save changes" /></section>;
}

export default function EditOpportunityPage({ params }: Props) {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-slate-100" aria-busy="true" />}><EditOpportunityContent params={params} /></Suspense>;
}
