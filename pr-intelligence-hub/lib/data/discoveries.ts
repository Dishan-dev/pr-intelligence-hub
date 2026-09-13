import type { Discovery, DiscoverySource, DiscoveryStatus, DiscoveryWithEvaluation } from "@/lib/domain/discovery";
import type { OpportunityCategory, OpportunityPriority, RepresentationType } from "@/lib/domain/opportunity";
import { evaluateOpportunity } from "@/lib/domain/opportunity-score";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface DiscoveryFilters {
  status?: DiscoveryStatus;
  category?: OpportunityCategory;
  representationType?: RepresentationType;
  priority?: OpportunityPriority;
  sort?: "score" | "deadline" | "event" | "newest";
}

export interface DiscoveryPagination {
  page?: number;
  pageSize?: number;
}

export interface PaginatedDiscoveries {
  items: DiscoveryWithEvaluation[];
  total: number;
  page: number;
  pageSize: number;
}

type DiscoveryRow = {
  id: string; title: string; organization_name: string | null; organization_id: string | null; description: string | null;
  category: OpportunityCategory | null; representation_type: RepresentationType | null; event_date: string | null; application_deadline: string | null; location: string | null; event_url: string | null; source_name: string | null; source_url: string | null;
  relevance_score: number | null; visibility_score: number | null; networking_score: number | null; stakeholder_value_score: number | null; feasibility_score: number | null;
  recommendation_summary: string | null; research_notes: string | null; discovery_status: DiscoveryStatus; discovered_at: string; reviewed_at: string | null; approved_opportunity_id: string | null; created_at: string; updated_at: string;
};

function mapDiscovery(row: DiscoveryRow, sources: DiscoverySource[] = []): DiscoveryWithEvaluation {
  const evaluation = evaluateOpportunity({ relevance: row.relevance_score ?? undefined, visibility: row.visibility_score ?? undefined, networking: row.networking_score ?? undefined, stakeholderValue: row.stakeholder_value_score ?? undefined, feasibility: row.feasibility_score ?? undefined });
  const discovery: Discovery = { id: row.id, title: row.title, organizationName: row.organization_name, organizationId: row.organization_id, description: row.description, category: row.category, representationType: row.representation_type, eventDate: row.event_date, applicationDeadline: row.application_deadline, location: row.location, eventUrl: row.event_url, sourceName: row.source_name, sourceUrl: row.source_url, relevanceScore: row.relevance_score, visibilityScore: row.visibility_score, networkingScore: row.networking_score, stakeholderValueScore: row.stakeholder_value_score, feasibilityScore: row.feasibility_score, recommendationSummary: row.recommendation_summary, researchNotes: row.research_notes, discoveryStatus: row.discovery_status, discoveredAt: row.discovered_at, reviewedAt: row.reviewed_at, approvedOpportunityId: row.approved_opportunity_id, createdAt: row.created_at, updatedAt: row.updated_at };
  return { ...discovery, ...evaluation, sources };
}

export async function getDiscoveries(filters: DiscoveryFilters = {}, pagination: DiscoveryPagination = {}, providedClient?: SupabaseClient): Promise<PaginatedDiscoveries> {
  const pageSize = pagination.pageSize ?? 25;
  const page = Math.max(1, pagination.page ?? 1);
  const supabase = providedClient ?? await createClient();
  let query = supabase.from("discovered_opportunities").select("*").order("discovered_at", { ascending: false });
  if (filters.status) {
    query = query.eq("discovery_status", filters.status);
  } else {
    query = query.in("discovery_status", ["ai_found_needs_review", "reviewing", "possible_duplicate"]);
  }
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.representationType) query = query.eq("representation_type", filters.representationType);
  const { data, error } = await query;
  if (error) throw new Error("Unable to load discoveries. Apply the Discovery Inbox migration if it has not been applied.");
  let discoveries = ((data ?? []) as unknown as DiscoveryRow[]).map((row) => mapDiscovery(row));
  if (filters.priority) discoveries = discoveries.filter((discovery) => discovery.priority === filters.priority);
  const dateSort = (left: string | null, right: string | null) => !left && !right ? 0 : !left ? 1 : !right ? -1 : left.localeCompare(right);
  if (filters.sort === "score") discoveries.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));
  if (filters.sort === "deadline") discoveries.sort((a, b) => dateSort(a.applicationDeadline, b.applicationDeadline));
  if (filters.sort === "event") discoveries.sort((a, b) => dateSort(a.eventDate, b.eventDate));
  const total = discoveries.length;
  const start = (page - 1) * pageSize;
  return { items: discoveries.slice(start, start + pageSize), total, page, pageSize };
}

export async function getClubsAndSocieties(): Promise<DiscoveryWithEvaluation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discovered_opportunities")
    .select("*")
    .in("discovery_status", ["ai_found_needs_review", "reviewing", "possible_duplicate"])
    .order("discovered_at", { ascending: false });
  if (error) throw new Error("Unable to load clubs and societies.");
  return ((data ?? []) as unknown as DiscoveryRow[])
    .filter((row) => {
      const searchable = [row.title, row.organization_name, row.description, row.recommendation_summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return /(club|societ|association|student organization)/.test(searchable) && !/university of moratuwa|uom/.test(searchable);
    })
    .map((row) => mapDiscovery(row));
}

export async function getDiscovery(id: string): Promise<DiscoveryWithEvaluation | null> {
  const supabase = await createClient();
  const [{ data, error }, { data: sourceData }] = await Promise.all([
    supabase.from("discovered_opportunities").select("*").eq("id", id).maybeSingle(),
    supabase.from("discovery_sources").select("id, source_name, url, source_type").eq("discovered_opportunity_id", id).order("created_at"),
  ]);
  if (error) throw new Error("Unable to load this discovery.");
  const sources = ((sourceData ?? []) as Array<{ id: string; source_name: string | null; url: string; source_type: "primary" | "supporting" }>).map((source) => ({ id: source.id, name: source.source_name, url: source.url, type: source.source_type }));
  return data ? mapDiscovery(data as unknown as DiscoveryRow, sources) : null;
}
