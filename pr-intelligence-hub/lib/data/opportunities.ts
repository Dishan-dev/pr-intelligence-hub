import { evaluateOpportunity, type OpportunityPriority } from "@/lib/domain/opportunity-score";
import type {
  Opportunity,
  OpportunityCategory,
  OpportunityStatus,
  OrganizationOption,
  RepresentationType,
} from "@/lib/domain/opportunity";
import { createClient } from "@/lib/supabase/server";

export interface OpportunityWithOrganization extends Opportunity {
  organization: OrganizationOption | null;
  overallScore: number | null;
  priority: OpportunityPriority | null;
}

export interface OpportunityFilters {
  status?: OpportunityStatus;
  category?: OpportunityCategory;
  representationType?: RepresentationType;
  priority?: OpportunityPriority;
  sort?: "event" | "deadline" | "score" | "recent";
}

type OpportunityRow = {
  id: string; organization_id: string | null; title: string; description: string | null;
  category: OpportunityCategory | null; representation_type: RepresentationType | null;
  event_date: string | null; application_deadline: string | null; location: string | null;
  event_url: string | null; source: string | null; source_url: string | null; status: OpportunityStatus;
  relevance_score: number | null; visibility_score: number | null; networking_score: number | null;
  stakeholder_value_score: number | null; feasibility_score: number | null; notes: string | null;
  created_at: string; updated_at: string; organizations: OrganizationOption | null;
};

function throwDataAccessError(error: { code?: string; message: string }, resource: string): never {
  if (error.code === "PGRST205") {
    throw new Error(
      "The Supabase database schema is not available yet. Apply the local Supabase migrations, then reload the PostgREST schema cache.",
    );
  }

  throw new Error(`Unable to load ${resource}.`);
}

function toOpportunity(row: OpportunityRow): OpportunityWithOrganization {
  const evaluation = evaluateOpportunity({
    relevance: row.relevance_score ?? undefined,
    visibility: row.visibility_score ?? undefined,
    networking: row.networking_score ?? undefined,
    stakeholderValue: row.stakeholder_value_score ?? undefined,
    feasibility: row.feasibility_score ?? undefined,
  });

  return {
    id: row.id, organizationId: row.organization_id, title: row.title, description: row.description,
    category: row.category, representationType: row.representation_type, eventDate: row.event_date,
    applicationDeadline: row.application_deadline, location: row.location, eventUrl: row.event_url,
    source: row.source, sourceUrl: row.source_url, status: row.status, relevanceScore: row.relevance_score,
    visibilityScore: row.visibility_score, networkingScore: row.networking_score,
    stakeholderValueScore: row.stakeholder_value_score, feasibilityScore: row.feasibility_score,
    notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at, organization: row.organizations,
    overallScore: evaluation.overallScore, priority: evaluation.priority,
  };
}

export async function getOrganizationOptions(): Promise<OrganizationOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").select("id, name").order("name");
  if (error) throwDataAccessError(error, "organizations");
  return (data ?? []) as OrganizationOption[];
}

export async function getOpportunities(filters: OpportunityFilters = {}): Promise<OpportunityWithOrganization[]> {
  const supabase = await createClient();
  let query = supabase
    .from("opportunities")
    .select("*, organizations(id, name)")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.representationType) query = query.eq("representation_type", filters.representationType);

  const { data, error } = await query;
  if (error) throwDataAccessError(error, "opportunities");

  let opportunities = ((data ?? []) as unknown as OpportunityRow[]).map(toOpportunity);
  if (filters.priority) opportunities = opportunities.filter((opportunity) => opportunity.priority === filters.priority);

  const nullLastDate = (left: string | null, right: string | null) => {
    if (!left && !right) return 0;
    if (!left) return 1;
    if (!right) return -1;
    return left.localeCompare(right);
  };
  switch (filters.sort) {
    case "event": opportunities.sort((a, b) => nullLastDate(a.eventDate, b.eventDate)); break;
    case "deadline": opportunities.sort((a, b) => nullLastDate(a.applicationDeadline, b.applicationDeadline)); break;
    case "score": opportunities.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1)); break;
    default: opportunities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return opportunities;
}

export async function getOpportunity(id: string): Promise<OpportunityWithOrganization | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, organizations(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDataAccessError(error, "opportunity");
  return data ? toOpportunity(data as unknown as OpportunityRow) : null;
}
