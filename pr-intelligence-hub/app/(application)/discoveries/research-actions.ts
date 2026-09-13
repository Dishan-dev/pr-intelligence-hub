"use server";
import { revalidatePath } from "next/cache";
import { researchHorizon } from "@/lib/research/profile";
import { executeResearchRun } from "@/lib/research/service";
import { researchFailureMessage } from "@/lib/research/openai";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResearchActionState { message?: string; }
export async function runResearch(previousState: ResearchActionState): Promise<ResearchActionState> {
  void previousState;
  const supabase = createAdminClient();
  const activeQuery = supabase.from("research_runs").select("id").eq("status", "running");
  const { data: active } = await activeQuery.is("triggered_by", null).maybeSingle();
  if (active) return { message: "A research run is already in progress for your account." };
  const horizon = researchHorizon(); const { data: run, error } = await supabase.from("research_runs").insert({ run_key: `manual:${crypto.randomUUID()}`, trigger_type: "manual", status: "pending", triggered_by: null, horizon_start: horizon.start, horizon_end: horizon.end }).select("id").single();
  if (error || !run) {
    console.error("Unable to create manual research run", error);
    return { message: error?.message ?? "Unable to start research." };
  }
  try { await executeResearchRun(supabase, run.id, horizon); } catch (researchError) { console.error("Manual research run failed", researchError); const message = researchFailureMessage(researchError); await supabase.from("research_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", run.id); return { message }; }
  revalidatePath("/discoveries");
  return {};
}
