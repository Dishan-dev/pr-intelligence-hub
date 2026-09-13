import { createClient } from "@/lib/supabase/server";

export interface ResearchSummary { newOpportunityCount: number; duplicateCount: number; urgentDeadlineCount: number; estimatedCostUsd: number; createdAt: string; }

export async function getLatestResearchSummary(): Promise<ResearchSummary | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("weekly_research_summaries").select("new_opportunity_count, duplicate_count, urgent_deadline_count, estimated_cost_usd, created_at").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return { newOpportunityCount: data.new_opportunity_count, duplicateCount: data.duplicate_count, urgentDeadlineCount: data.urgent_deadline_count, estimatedCostUsd: Number(data.estimated_cost_usd), createdAt: data.created_at };
}
