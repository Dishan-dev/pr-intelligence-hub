import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";

import { OpportunityForm } from "@/components/opportunity-form";
import { Button } from "@/components/ui/button";
import { createOpportunity } from "../actions";
import { toOpportunityFormValues } from "@/lib/domain/opportunity-form";
import { getOrganizationOptions } from "@/lib/data/opportunities";

export const metadata = { title: "Add opportunity" };

async function NewOpportunityContent() {
  const organizations = await getOrganizationOptions();
  return <section className="mx-auto max-w-4xl"><Button asChild variant="ghost" size="sm"><Link href="/opportunities"><ChevronLeft />Opportunities</Link></Button><div className="mb-7 mt-4"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Add opportunity</h1><p className="mt-2 text-sm text-slate-600">Capture the opportunity details and evaluate its potential.</p></div><OpportunityForm organizations={organizations} initialValues={toOpportunityFormValues()} action={createOpportunity} submitLabel="Create opportunity" /></section>;
}

export default function NewOpportunityPage() {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-slate-100" aria-busy="true" />}><NewOpportunityContent /></Suspense>;
}
