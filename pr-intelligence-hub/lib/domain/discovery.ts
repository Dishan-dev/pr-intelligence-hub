import type { OpportunityCategory, OpportunityPriority, RepresentationType } from "./opportunity";

export const DISCOVERY_STATUSES = ["new", "reviewing", "approved", "rejected", "duplicate", "expired"] as const;
export type DiscoveryStatus = (typeof DISCOVERY_STATUSES)[number];

export const DISCOVERY_STATUS_LABELS: Record<DiscoveryStatus, string> = {
  new: "New", reviewing: "Reviewing", approved: "Approved", rejected: "Rejected", duplicate: "Duplicate", expired: "Expired",
};

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
