"use server";
import { revalidatePath } from "next/cache";
import { researchHorizon } from "@/lib/research/profile";
import { executeResearchRun } from "@/lib/research/service";
import { researchFailureMessage } from "@/lib/research/openai";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResearchActionState { message?: string; }
export async function runResearch(previousState: ResearchActionState): Promise<ResearchActionState> {
  void previousState;
  let supabase: ReturnType<typeof createAdminClient> | null = null;
  let runId: string | null = null;
  try {
    supabase = createAdminClient();
    const activeQuery = supabase.from("research_runs").select("id, started_at").eq("status", "running");
    const { data: active } = await activeQuery.order("started_at", { ascending: false }).limit(1).maybeSingle();
    if (active) {
      const startedAt = active.started_at ? new Date(active.started_at).getTime() : 0;
      const isStale = !startedAt || Date.now() - startedAt > 3 * 60 * 1000;
      if (!isStale) return { message: "A research run is already in progress." };
      await supabase.from("research_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: "Run marked stale after exceeding the execution window." }).eq("id", active.id).eq("status", "running");
    }
    const horizon = researchHorizon();
    const { data: run, error } = await supabase.from("research_runs").insert({ run_key: `manual:${crypto.randomUUID()}`, trigger_type: "manual", status: "pending", triggered_by: null, horizon_start: horizon.start, horizon_end: horizon.end }).select("id").single();
    if (error || !run) {
      console.error("Unable to create manual research run", error);
      return { message: error?.message ?? "Unable to start research." };
    }
    runId = run.id;
    await executeResearchRun(supabase, run.id, horizon);
  } catch (researchError) {
    console.error("Manual research run failed", researchError);
    const message = researchFailureMessage(researchError);
    if (supabase && runId) await supabase.from("research_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", runId);
    return { message };
  }
  revalidatePath("/discoveries");
  return {};
}
