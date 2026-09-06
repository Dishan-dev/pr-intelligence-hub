"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseOpportunityForm, type OpportunityFormState } from "@/lib/domain/opportunity-form";
import { OPPORTUNITY_STATUSES } from "@/lib/domain/opportunity";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");
  return supabase;
}

function databaseFields(input: NonNullable<ReturnType<typeof parseOpportunityForm>["data"]>) {
  return {
    title: input.title, organization_id: input.organizationId, description: input.description,
    category: input.category, representation_type: input.representationType, event_date: input.eventDate,
    application_deadline: input.applicationDeadline, location: input.location, event_url: input.eventUrl,
    source: input.source, source_url: input.sourceUrl, status: input.status,
    relevance_score: input.relevanceScore, visibility_score: input.visibilityScore,
    networking_score: input.networkingScore, stakeholder_value_score: input.stakeholderValueScore,
    feasibility_score: input.feasibilityScore, notes: input.notes,
  };
}

export async function createOpportunity(_: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  const parsed = parseOpportunityForm(formData);
  if (!parsed.data) return parsed.errors;
  const supabase = await getAuthenticatedClient();
  const { data, error } = await supabase.from("opportunities").insert(databaseFields(parsed.data)).select("id").single();
  if (error) return { message: "Unable to create this opportunity. Please try again." };
  revalidatePath("/opportunities");
  redirect(`/opportunities/${data.id}`);
}

export async function updateOpportunity(id: string, _: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  const parsed = parseOpportunityForm(formData);
  if (!parsed.data) return parsed.errors;
  const supabase = await getAuthenticatedClient();
  const { error } = await supabase.from("opportunities").update(databaseFields(parsed.data)).eq("id", id);
  if (error) return { message: "Unable to save changes. Please try again." };
  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}

export async function updateOpportunityStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string" || !OPPORTUNITY_STATUSES.includes(status as typeof OPPORTUNITY_STATUSES[number])) return;
  const supabase = await getAuthenticatedClient();
  await supabase.from("opportunities").update({ status }).eq("id", id);
  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
}

export async function archiveOpportunity(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await getAuthenticatedClient();
  await supabase.from("opportunities").update({ status: "archived" }).eq("id", id);
  revalidatePath("/opportunities");
  redirect("/opportunities");
}

export async function deleteOpportunity(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await getAuthenticatedClient();
  await supabase.from("opportunities").delete().eq("id", id);
  revalidatePath("/opportunities");
  redirect("/opportunities");
}
