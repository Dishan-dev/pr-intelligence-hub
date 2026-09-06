import {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_STATUSES,
  REPRESENTATION_TYPES,
  type OpportunityCategory,
  type OpportunityFormValues,
  type OpportunityStatus,
  type RepresentationType,
} from "./opportunity.ts";

export interface OpportunityFormState {
  message?: string;
  fieldErrors?: Partial<Record<keyof OpportunityFormValues, string>>;
}

export const INITIAL_OPPORTUNITY_FORM_STATE: OpportunityFormState = {};

export interface OpportunityWriteInput {
  title: string;
  organizationId: string | null;
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
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function value(formData: FormData, name: string): string {
  const field = formData.get(name);
  return typeof field === "string" ? field.trim() : "";
}

function optionalUrl(input: string): string | null {
  if (!input) return null;

  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:" ? input : null;
  } catch {
    return null;
  }
}

function optionalScore(input: string): number | null | "invalid" {
  if (!input) return null;
  const score = Number(input);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : "invalid";
}

function includes<T extends readonly string[]>(values: T, input: string): input is T[number] {
  return values.includes(input);
}

export function toOpportunityFormValues(opportunity?: Partial<OpportunityWriteInput>): OpportunityFormValues {
  return {
    title: opportunity?.title ?? "",
    organizationId: opportunity?.organizationId ?? "",
    description: opportunity?.description ?? "",
    category: opportunity?.category ?? "",
    representationType: opportunity?.representationType ?? "",
    eventDate: opportunity?.eventDate ?? "",
    applicationDeadline: opportunity?.applicationDeadline ?? "",
    location: opportunity?.location ?? "",
    eventUrl: opportunity?.eventUrl ?? "",
    source: opportunity?.source ?? "",
    sourceUrl: opportunity?.sourceUrl ?? "",
    status: opportunity?.status ?? "discovered",
    relevanceScore: opportunity?.relevanceScore?.toString() ?? "",
    visibilityScore: opportunity?.visibilityScore?.toString() ?? "",
    networkingScore: opportunity?.networkingScore?.toString() ?? "",
    stakeholderValueScore: opportunity?.stakeholderValueScore?.toString() ?? "",
    feasibilityScore: opportunity?.feasibilityScore?.toString() ?? "",
    notes: opportunity?.notes ?? "",
  };
}

export function parseOpportunityForm(formData: FormData):
  | { data: OpportunityWriteInput; errors: undefined }
  | { data: undefined; errors: OpportunityFormState } {
  const form = {
    title: value(formData, "title"), organizationId: value(formData, "organizationId"),
    description: value(formData, "description"), category: value(formData, "category"),
    representationType: value(formData, "representationType"), eventDate: value(formData, "eventDate"),
    applicationDeadline: value(formData, "applicationDeadline"), location: value(formData, "location"),
    eventUrl: value(formData, "eventUrl"), source: value(formData, "source"), sourceUrl: value(formData, "sourceUrl"),
    status: value(formData, "status"), relevanceScore: value(formData, "relevanceScore"),
    visibilityScore: value(formData, "visibilityScore"), networkingScore: value(formData, "networkingScore"),
    stakeholderValueScore: value(formData, "stakeholderValueScore"), feasibilityScore: value(formData, "feasibilityScore"),
    notes: value(formData, "notes"),
  };
  const fieldErrors: OpportunityFormState["fieldErrors"] = {};
  if (!form.title) fieldErrors.title = "Title is required.";
  if (form.organizationId && !UUID_PATTERN.test(form.organizationId)) fieldErrors.organizationId = "Choose a valid organization.";
  if (form.category && !includes(OPPORTUNITY_CATEGORIES, form.category)) fieldErrors.category = "Choose a valid category.";
  if (form.representationType && !includes(REPRESENTATION_TYPES, form.representationType)) fieldErrors.representationType = "Choose a valid representation type.";
  if (!includes(OPPORTUNITY_STATUSES, form.status)) fieldErrors.status = "Choose a valid status.";
  if (form.eventUrl && !optionalUrl(form.eventUrl)) fieldErrors.eventUrl = "Enter a valid http(s) URL.";
  if (form.sourceUrl && !optionalUrl(form.sourceUrl)) fieldErrors.sourceUrl = "Enter a valid http(s) URL.";
  const scoreFields = ["relevanceScore", "visibilityScore", "networkingScore", "stakeholderValueScore", "feasibilityScore"] as const;
  const scores = Object.fromEntries(scoreFields.map((key) => [key, optionalScore(form[key])])) as Record<(typeof scoreFields)[number], number | null | "invalid">;
  scoreFields.forEach((key) => { if (scores[key] === "invalid") fieldErrors[key] = "Use a whole number from 0 to 100."; });
  if (Object.keys(fieldErrors).length > 0) return { data: undefined, errors: { message: "Review the highlighted fields.", fieldErrors } };
  return { data: {
    title: form.title, organizationId: form.organizationId || null, description: form.description || null,
    category: (form.category || null) as OpportunityCategory | null, representationType: (form.representationType || null) as RepresentationType | null,
    eventDate: form.eventDate || null, applicationDeadline: form.applicationDeadline || null, location: form.location || null,
    eventUrl: optionalUrl(form.eventUrl), source: form.source || null, sourceUrl: optionalUrl(form.sourceUrl), status: form.status as OpportunityStatus,
    relevanceScore: scores.relevanceScore as number | null, visibilityScore: scores.visibilityScore as number | null,
    networkingScore: scores.networkingScore as number | null, stakeholderValueScore: scores.stakeholderValueScore as number | null,
    feasibilityScore: scores.feasibilityScore as number | null, notes: form.notes || null,
  }, errors: undefined };
}
