import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isDuplicateCandidate,
  isWithinHorizon,
  normalizeResearchText,
  type DuplicateRecord,
} from "./duplicate";
import { researchThemes } from "./openai";
import { canonicalizeUrl, candidateFingerprint } from "./duplicate";
import { getResearchConfiguration, monthSpendUsd } from "./config";
import type { ResearchCandidate } from "./candidate";

function qualifiesForExternalRepresentation(candidate: ResearchCandidate) {
  return (
    candidate.representationType !== null &&
    candidate.relevanceScore >= 75 &&
    candidate.visibilityScore >= 55 &&
    candidate.stakeholderValueScore >= 55 &&
    candidate.feasibilityScore >= 40
  );
}

async function existingRecords(
  supabase: SupabaseClient,
): Promise<DuplicateRecord[]> {
  const [discoveries, opportunities, sources] = await Promise.all([
    supabase
      .from("discovered_opportunities")
      .select(
        "id, title, organization_name, event_date, event_url, source_url",
      ),
    supabase
      .from("opportunities")
      .select("title, event_date, event_url, source_url"),
    supabase.from("discovery_sources").select("url, discovered_opportunity_id"),
  ]);
  const sourceUrls = new Map<string, string[]>();
  (sources.data ?? []).forEach(
    (source: { url: string; discovered_opportunity_id: string }) =>
      sourceUrls.set(source.discovered_opportunity_id, [
        ...(sourceUrls.get(source.discovered_opportunity_id) ?? []),
        source.url,
      ]),
  );
  return [
    ...(
      (discoveries.data ?? []) as Array<{
        title: string;
        organization_name: string | null;
        event_date: string | null;
        event_url: string | null;
        source_url: string | null;
        id?: string;
      }>
    ).map((row) => ({
      title: row.title,
      organizationName: row.organization_name,
      eventDate: row.event_date,
      urls: [
        row.event_url,
        row.source_url,
        ...(row.id ? (sourceUrls.get(row.id) ?? []) : []),
      ].filter(Boolean) as string[],
    })),
    ...(
      (opportunities.data ?? []) as Array<{
        title: string;
        event_date: string | null;
        event_url: string | null;
        source_url: string | null;
      }>
    ).map((row) => ({
      title: row.title,
      eventDate: row.event_date,
      urls: [row.event_url, row.source_url].filter(Boolean) as string[],
    })),
  ];
}

export async function executeResearchRun(
  supabase: SupabaseClient,
  runId: string,
  horizon: { start: string; end: string },
) {
  await supabase
    .from("research_runs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", runId);
  const { budget, queries } = await getResearchConfiguration(supabase);
  if (queries.length === 0)
    throw new Error("No enabled research queries are configured.");
  let spent = await monthSpendUsd(supabase);
  if (spent >= budget.monthlyLimitUsd)
    throw new Error("The configured monthly research budget has been reached.");
  if (spent + budget.extractionEstimateUsd > budget.monthlyLimitUsd)
    throw new Error(
      "The configured monthly research budget would be exceeded by extraction.",
    );
  const themes = queries
    .slice(0, budget.maxSearchCallsPerRun)
    .map((query) => query.queryText);
  const candidates = await researchThemes(themes, horizon);
  await supabase
    .from("research_usage_ledger")
    .insert({
      research_run_id: runId,
      provider: "openai",
      operation: "web_search_and_extract",
      model: process.env.OPENAI_RESEARCH_MODEL ?? "gpt-5-mini",
      units: 1,
      estimated_cost_usd: budget.extractionEstimateUsd,
      metadata: { themeCount: themes.length },
    });
  spent += budget.extractionEstimateUsd;
  const existing = await existingRecords(supabase);
  let inserted = 0;
  let duplicates = 0;
  let rejected = 0;
  for (const candidate of candidates) {
    const fingerprint = candidateFingerprint(candidate);
    if (!qualifiesForExternalRepresentation(candidate)) {
      rejected += 1;
      await supabase
        .from("research_run_items")
        .insert({
          research_run_id: runId,
          candidate_fingerprint: fingerprint,
          disposition: "invalid",
          detail:
            "Does not meet the AIESEC external-representation qualification threshold",
        });
      continue;
    }
    if (!isWithinHorizon(candidate, horizon.start, horizon.end)) {
      rejected += 1;
      await supabase
        .from("research_run_items")
        .insert({
          research_run_id: runId,
          candidate_fingerprint: fingerprint,
          disposition: "invalid",
          detail: "Outside configured horizon",
        });
      continue;
    }
    if (isDuplicateCandidate(candidate, existing)) {
      duplicates += 1;
      await supabase
        .from("research_run_items")
        .insert({
          research_run_id: runId,
          candidate_fingerprint: fingerprint,
          disposition: "duplicate",
        });
      continue;
    }
    const primary = candidate.sources[0];
    const { data, error } = await supabase
      .from("discovered_opportunities")
      .insert({
        title: candidate.title,
        organization_name: candidate.organizationName,
        description: candidate.description,
        category: candidate.category,
        representation_type: candidate.representationType,
        event_date: candidate.eventDate,
        application_deadline: candidate.applicationDeadline,
        location: candidate.location,
        event_url: candidate.eventUrl,
        source_name: primary.name,
        source_url: primary.url,
        relevance_score: candidate.relevanceScore,
        visibility_score: candidate.visibilityScore,
        networking_score: candidate.networkingScore,
        stakeholder_value_score: candidate.stakeholderValueScore,
        feasibility_score: candidate.feasibilityScore,
        recommendation_summary: candidate.recommendationSummary,
        research_notes: candidate.evidenceSummary,
        discovery_status: "ai_found_needs_review",
        canonical_source_url: canonicalizeUrl(primary.url),
        duplicate_fingerprint: fingerprint,
        score_breakdown: {
          relevance: candidate.relevanceScore,
          visibility: candidate.visibilityScore,
          networking: candidate.networkingScore,
          stakeholderValue: candidate.stakeholderValueScore,
          feasibility: candidate.feasibilityScore,
        },
      })
      .select("id")
      .single();
    if (error || !data) {
      rejected += 1;
      continue;
    }
    const sourceRows = candidate.sources.map((source, index) => ({
      discovered_opportunity_id: data.id,
      url: source.url,
      canonical_url: canonicalizeUrl(source.url),
      source_name: source.name,
      source_type: index === 0 ? "primary" : "supporting",
    }));
    await supabase.from("discovery_sources").insert(sourceRows);
    await supabase
      .from("research_run_items")
      .insert({
        research_run_id: runId,
        candidate_fingerprint: fingerprint,
        disposition: "inserted",
        discovered_opportunity_id: data.id,
      });
    existing.push({
      title: candidate.title,
      organizationName: candidate.organizationName,
      eventDate: candidate.eventDate,
      urls: candidate.sources
        .map((source) => source.url)
        .concat(candidate.eventUrl ? [candidate.eventUrl] : []),
    });
    inserted += 1;
  }
  const status = "completed";
  const summary = {
    newOpportunities: inserted,
    duplicates,
    failures: 0,
    estimatedCostUsd: spent,
  };
  await supabase
    .from("research_runs")
    .update({
      status,
      completed_at: new Date().toISOString(),
      candidate_count: candidates.length,
      inserted_count: inserted,
      duplicate_count: duplicates,
      rejected_count: rejected,
      actual_cost_usd: spent,
      summary,
    })
    .eq("id", runId);
  const urgentUntil = new Date();
  urgentUntil.setDate(urgentUntil.getDate() + budget.urgentDeadlineDays);
  const { count: urgentDeadlineCount } = await supabase
    .from("discovered_opportunities")
    .select("id", { count: "exact", head: true })
    .eq("discovery_status", "ai_found_needs_review")
    .gte("application_deadline", new Date().toISOString().slice(0, 10))
    .lte("application_deadline", urgentUntil.toISOString().slice(0, 10));
  await supabase
    .from("weekly_research_summaries")
    .insert({
      research_run_id: runId,
      week_start: horizon.start,
      new_opportunity_count: inserted,
      duplicate_count: duplicates,
      urgent_deadline_count: urgentDeadlineCount ?? 0,
      failure_count: 0,
      estimated_cost_usd: spent,
      summary,
    });
  return summary;
}

export { normalizeResearchText };
