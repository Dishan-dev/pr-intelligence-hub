export const ORGANIZATION_TYPES = [
  "company",
  "ngo",
  "university",
  "government",
  "media",
  "professional_body",
  "youth_organization",
  "other",
] as const;

export const RELATIONSHIP_STATUSES = [
  "prospect",
  "active",
  "dormant",
  "former",
] as const;

export const OPPORTUNITY_CATEGORIES = [
  "conference",
  "youth_forum",
  "corporate_event",
  "university_event",
  "ngo_event",
  "government_event",
  "sdg_event",
  "networking_event",
  "workshop",
  "panel_discussion",
  "competition",
  "media_opportunity",
  "partnership_opportunity",
  "stall_exhibition",
  "other",
] as const;

export const REPRESENTATION_TYPES = [
  "speaking",
  "non_speaking",
  "panel",
  "networking",
  "media",
  "partnership",
  "stall_booth",
  "competition",
] as const;

export const OPPORTUNITY_STATUSES = [
  "discovered",
  "researching",
  "qualified",
  "applying",
  "applied",
  "confirmed",
  "attended",
  "rejected",
  "missed",
  "archived",
] as const;

export const OPPORTUNITY_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];
export type RepresentationType = (typeof REPRESENTATION_TYPES)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type OpportunityPriority = (typeof OPPORTUNITY_PRIORITIES)[number];

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  company: "Company",
  ngo: "NGO",
  university: "University",
  government: "Government",
  media: "Media",
  professional_body: "Professional body",
  youth_organization: "Youth organization",
  other: "Other",
};

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  conference: "Conference",
  youth_forum: "Youth forum",
  corporate_event: "Corporate event",
  university_event: "University event",
  ngo_event: "NGO event",
  government_event: "Government event",
  sdg_event: "SDG event",
  networking_event: "Networking event",
  workshop: "Workshop",
  panel_discussion: "Panel discussion",
  competition: "Competition",
  media_opportunity: "Media opportunity",
  partnership_opportunity: "Partnership opportunity",
  stall_exhibition: "Stall / exhibition",
  other: "Other",
};

export const REPRESENTATION_TYPE_LABELS: Record<RepresentationType, string> = {
  speaking: "Speaking",
  non_speaking: "Non-speaking",
  panel: "Panel",
  networking: "Networking",
  media: "Media",
  partnership: "Partnership",
  stall_booth: "Stall / booth",
  competition: "Competition",
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  discovered: "Discovered",
  researching: "Researching",
  qualified: "Qualified",
  applying: "Applying",
  applied: "Applied",
  confirmed: "Confirmed",
  attended: "Attended",
  rejected: "Rejected",
  missed: "Missed",
  archived: "Archived",
};

export const OPPORTUNITY_PRIORITY_LABELS: Record<OpportunityPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export interface Organization {
  id: string;
  name: string;
  website: string | null;
  organizationType: OrganizationType | null;
  industry: string | null;
  description: string | null;
  linkedinUrl: string | null;
  location: string | null;
  relationshipStatus: RelationshipStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  organizationId: string | null;
  title: string;
  description: string | null;
  category: OpportunityCategory | null;
  representationType: RepresentationType | null;
  eventDate: string | null;
  applicationDeadline: string | null;
  location: string | null;
  eventUrl: string | null;
  source: string | null;
  sourceUrl: string | null;
  status: OpportunityStatus;
  relevanceScore: number | null;
  visibilityScore: number | null;
  networkingScore: number | null;
  stakeholderValueScore: number | null;
  feasibilityScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationOption {
  id: string;
  name: string;
}

export interface OpportunityFormValues {
  title: string;
  organizationId: string;
  description: string;
  category: OpportunityCategory | "";
  representationType: RepresentationType | "";
  eventDate: string;
  applicationDeadline: string;
  location: string;
  eventUrl: string;
  source: string;
  sourceUrl: string;
  status: OpportunityStatus;
  relevanceScore: string;
  visibilityScore: string;
  networkingScore: string;
  stakeholderValueScore: string;
  feasibilityScore: string;
  notes: string;
}
