"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { researchHorizon } from "@/lib/research/profile";
import { executeResearchRun } from "@/lib/research/service";
import { createClient } from "@/lib/supabase/server";

export interface ResearchActionState { message?: string; }
export async function runResearch(previousState: ResearchActionState): Promise<ResearchActionState> {
  void previousState;
  const supabase = await createClient(); const { data: claims, error: authError } = await supabase.auth.getClaims(); if (authError || !claims?.claims) redirect("/auth/login");
  const userId = String(claims.claims.sub); const { data: active } = await supabase.from("research_runs").select("id").eq("triggered_by", userId).eq("status", "running").maybeSingle();
  if (active) return { message: "A research run is already in progress for your account." };
  const horizon = researchHorizon(); const { data: run, error } = await supabase.from("research_runs").insert({ status: "pending", triggered_by: userId, horizon_start: horizon.start, horizon_end: horizon.end }).select("id").single();
  if (error || !run) return { message: "Unable to start research." };
  try { await executeResearchRun(supabase, run.id, horizon); } catch { await supabase.from("research_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: "Research could not be completed. Check server configuration and try again." }).eq("id", run.id); }
  revalidatePath("/discoveries");
  return {};
}
