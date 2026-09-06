import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDuplicateCandidate, isWithinHorizon, normalizeResearchText, type DuplicateRecord } from "./duplicate";
import { researchTheme } from "./gemini";
import { RESEARCH_THEMES } from "./profile";

async function existingRecords(supabase: SupabaseClient): Promise<DuplicateRecord[]> {
  const [discoveries, opportunities, sources] = await Promise.all([
    supabase.from("discovered_opportunities").select("id, title, organization_name, event_date, event_url, source_url"),
    supabase.from("opportunities").select("title, event_date, event_url, source_url"),
    supabase.from("discovery_sources").select("url, discovered_opportunity_id"),
  ]);
  const sourceUrls = new Map<string, string[]>();
  (sources.data ?? []).forEach((source: { url: string; discovered_opportunity_id: string }) => sourceUrls.set(source.discovered_opportunity_id, [...(sourceUrls.get(source.discovered_opportunity_id) ?? []), source.url]));
  return [
    ...((discoveries.data ?? []) as Array<{ title: string; organization_name: string | null; event_date: string | null; event_url: string | null; source_url: string | null; id?: string }>).map((row) => ({ title: row.title, organizationName: row.organization_name, eventDate: row.event_date, urls: [row.event_url, row.source_url, ...(row.id ? sourceUrls.get(row.id) ?? [] : [])].filter(Boolean) as string[] })),
    ...((opportunities.data ?? []) as Array<{ title: string; event_date: string | null; event_url: string | null; source_url: string | null }>).map((row) => ({ title: row.title, eventDate: row.event_date, urls: [row.event_url, row.source_url].filter(Boolean) as string[] })),
  ];
}

export async function executeResearchRun(supabase: SupabaseClient, runId: string, horizon: { start: string; end: string }) {
  await supabase.from("research_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", runId);
  let candidates: Awaited<ReturnType<typeof researchTheme>> = []; let themeFailures = 0;
  for (const theme of RESEARCH_THEMES) { try { candidates = candidates.concat(await researchTheme(theme, horizon)); } catch { themeFailures += 1; } }
  if (candidates.length === 0 && themeFailures === RESEARCH_THEMES.length) throw new Error("All research themes failed.");
  const existing = await existingRecords(supabase); let inserted = 0; let duplicates = 0; let rejected = 0;
  for (const candidate of candidates) {
    if (!isWithinHorizon(candidate, horizon.start, horizon.end)) { rejected += 1; continue; }
    if (isDuplicateCandidate(candidate, existing)) { duplicates += 1; continue; }
    const primary = candidate.sources[0];
    const { data, error } = await supabase.from("discovered_opportunities").insert({ title: candidate.title, organization_name: candidate.organizationName, description: candidate.description, category: candidate.category, representation_type: candidate.representationType, event_date: candidate.eventDate, application_deadline: candidate.applicationDeadline, location: candidate.location, event_url: candidate.eventUrl, source_name: primary.name, source_url: primary.url, relevance_score: candidate.relevanceScore, visibility_score: candidate.visibilityScore, networking_score: candidate.networkingScore, stakeholder_value_score: candidate.stakeholderValueScore, feasibility_score: candidate.feasibilityScore, recommendation_summary: candidate.recommendationSummary, research_notes: candidate.evidenceSummary }).select("id").single();
    if (error || !data) { rejected += 1; continue; }
    const sourceRows = candidate.sources.map((source, index) => ({ discovered_opportunity_id: data.id, url: source.url, source_name: source.name, source_type: index === 0 ? "primary" : "supporting" }));
    await supabase.from("discovery_sources").insert(sourceRows);
    existing.push({ title: candidate.title, organizationName: candidate.organizationName, eventDate: candidate.eventDate, urls: candidate.sources.map((source) => source.url).concat(candidate.eventUrl ? [candidate.eventUrl] : []) });
    inserted += 1;
  }
  await supabase.from("research_runs").update({ status: themeFailures ? "partial" : "completed", completed_at: new Date().toISOString(), candidate_count: candidates.length, inserted_count: inserted, duplicate_count: duplicates, rejected_count: rejected }).eq("id", runId);
}

export { normalizeResearchText };
