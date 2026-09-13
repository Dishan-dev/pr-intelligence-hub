"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function authenticatedUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ? String(data.claims.sub) : null };
}

function discoveryId(formData: FormData) { const value = formData.get("id"); return typeof value === "string" ? value : null; }
function refresh(id: string) { revalidatePath("/discoveries"); revalidatePath(`/discoveries/${id}`); revalidatePath("/dashboard"); }

export async function assignDiscoveryToSelf(formData: FormData) {
  const id = discoveryId(formData); if (!id) return;
  const { supabase, userId } = await authenticatedUser();
  if (!userId) return;
  await supabase.from("discovered_opportunities").update({ assigned_to: userId, assigned_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("opportunity_assignments").insert({ discovered_opportunity_id: id, assigned_to: userId, assigned_by: userId, note: "Assigned to self" });
  refresh(id);
}

export async function prepareOutreachDraft(formData: FormData) {
  const id = discoveryId(formData); if (!id) return;
  const { supabase, userId } = await authenticatedUser();
  if (!userId) return;
  const { data } = await supabase.from("discovered_opportunities").select("title, organization_name, opportunity_type").eq("id", id).maybeSingle();
  if (!data) return;
  const subject = `Youth representation collaboration – ${data.organization_name ?? data.title}`;
  const body = `Dear [Name/Team],\n\nI am reaching out on behalf of AIESEC in University of Moratuwa regarding ${data.title}. We would like to explore a suitable ${data.opportunity_type?.replaceAll("_", " ") ?? "external representation"} opportunity and contribute relevant university-youth perspectives, representatives, speakers, or volunteers.\n\nCould you please connect us with the person handling partnerships, events, or youth engagement?\n\nBest regards,\n[Your name]\nAIESEC in University of Moratuwa`;
  await supabase.from("outreach_drafts").insert({ discovered_opportunity_id: id, subject, body, template_key: "institutional_email", created_by: userId, updated_by: userId });
  refresh(id);
}
