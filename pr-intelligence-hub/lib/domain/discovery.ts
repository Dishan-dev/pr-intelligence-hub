import type { OpportunityCategory, OpportunityPriority, RepresentationType } from "./opportunity";

export const DISCOVERY_STATUSES = ["ai_found_needs_review", "reviewing", "approved", "rejected", "duplicate", "possible_duplicate", "expired"] as const;
export type DiscoveryStatus = (typeof DISCOVERY_STATUSES)[number];

export const DISCOVERY_STATUS_LABELS: Record<DiscoveryStatus, string> = {
  ai_found_needs_review: "AI Found – Needs Review", reviewing: "Reviewing", approved: "Approved", rejected: "Rejected", duplicate: "Duplicate", possible_duplicate: "Possible duplicate", expired: "Expired",
};

export const RESEARCH_OPPORTUNITY_TYPES = ["external_representation", "speaking", "youth_collaboration", "media", "volunteering", "ogx_stall", "other"] as const;
export type ResearchOpportunityType = (typeof RESEARCH_OPPORTUNITY_TYPES)[number];

export interface Discovery {
  id: string;
  title: string;
  organizationName: string | null;
  organizationId: string | null;
  description: string | null;
  category: OpportunityCategory | null;
  representationType: RepresentationType | null;
  eventDate: string | null;
  applicationDeadline: string | null;
  location: string | null;
  eventUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  relevanceScore: number | null;
  visibilityScore: number | null;
  networkingScore: number | null;
  stakeholderValueScore: number | null;
  feasibilityScore: number | null;
  recommendationSummary: string | null;
  researchNotes: string | null;
  discoveryStatus: DiscoveryStatus;
  discoveredAt: string;
  reviewedAt: string | null;
  approvedOpportunityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryWithEvaluation extends Discovery {
  overallScore: number | null;
  priority: OpportunityPriority | null;
  sources: DiscoverySource[];
}

export interface DiscoverySource { id: string; name: string | null; url: string; type: "primary" | "supporting"; }
