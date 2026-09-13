import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ResearchBudget { monthlyLimitUsd: number; maxSearchCallsPerRun: number; urgentDeadlineDays: number; extractionEstimateUsd: number; }
export interface ResearchQuery { id: string; queryText: string; opportunityFocus: string; domain: string | null; }
interface ResearchSource { id: string; keywords: string; domain: string; }

const fallbackBudget: ResearchBudget = { monthlyLimitUsd: 3, maxSearchCallsPerRun: 30, urgentDeadlineDays: 14, extractionEstimateUsd: 0.01 };

export async function getResearchConfiguration(supabase: SupabaseClient): Promise<{ budget: ResearchBudget; queries: ResearchQuery[] }> {
  const [{ data: budgetRow }, { data: queryRows }, { data: sourceRows }] = await Promise.all([
    supabase.from("research_budget_configs").select("monthly_limit_usd, max_search_calls_per_run, urgent_deadline_days, gemini_extraction_estimate_usd").eq("active", true).limit(1).maybeSingle(),
    supabase.from("research_query_configs").select("id, query_text, opportunity_focus, research_source_configs(allowed_domain)").eq("enabled", true).order("priority").limit(30),
    supabase.from("research_source_configs").select("id, search_keywords, allowed_domain").eq("enabled", true).eq("monitoring_frequency", "weekly").order("priority").limit(30),
  ]);
  const budget = budgetRow ? { monthlyLimitUsd: Number(budgetRow.monthly_limit_usd), maxSearchCallsPerRun: Number(budgetRow.max_search_calls_per_run), urgentDeadlineDays: Number(budgetRow.urgent_deadline_days), extractionEstimateUsd: Number(budgetRow.gemini_extraction_estimate_usd) } : fallbackBudget;
  const configuredQueries = ((queryRows ?? []) as unknown as Array<{ id: string; query_text: string; opportunity_focus: string; research_source_configs: { allowed_domain: string }[] | null }>).map((row) => ({ id: row.id, queryText: row.query_text, opportunityFocus: row.opportunity_focus, domain: row.research_source_configs?.[0]?.allowed_domain ?? null }));
  const sources = ((sourceRows ?? []) as unknown as Array<{ id: string; search_keywords: string; allowed_domain: string }>).map((row): ResearchSource => ({ id: row.id, keywords: row.search_keywords, domain: row.allowed_domain }));
  const queries = sources.length > 0 ? sources.flatMap((source) => configuredQueries.slice(0, 3).map((query) => ({ ...query, id: `${query.id}:${source.id}`, queryText: `${source.keywords} ${query.queryText}`, domain: source.domain }))) : configuredQueries.filter((query) => query.domain);
  return { budget, queries };
}

export async function monthSpendUsd(supabase: SupabaseClient) {
  const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const { data } = await supabase.from("research_usage_ledger").select("estimated_cost_usd, actual_cost_usd").gte("created_at", start.toISOString());
  return ((data ?? []) as Array<{ estimated_cost_usd: number | string; actual_cost_usd: number | string | null }>).reduce((total, row) => total + Number(row.actual_cost_usd ?? row.estimated_cost_usd), 0);
}
