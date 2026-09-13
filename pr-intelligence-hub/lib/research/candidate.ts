import { z } from "zod";
import { OPPORTUNITY_CATEGORIES, REPRESENTATION_TYPES } from "@/lib/domain/opportunity";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const score = z.number().int().min(0).max(100);

export const ResearchCandidateSchema = z.object({
  title: z.string().trim().min(3), organizationName: z.string().trim().min(2).nullable(), description: z.string().trim().min(10).nullable(),
  category: z.enum(OPPORTUNITY_CATEGORIES).nullable(), representationType: z.enum(REPRESENTATION_TYPES).nullable(),
  eventDate: date, applicationDeadline: date, location: z.string().trim().min(2).nullable(), eventUrl: z.string().url().nullable(),
  sources: z.array(z.object({ name: z.string().trim().min(2), url: z.string().url() })).min(1).max(5),
  recommendationSummary: z.string().trim().min(10), evidenceSummary: z.string().trim().min(10),
  relevanceScore: score, visibilityScore: score, networkingScore: score, stakeholderValueScore: score, feasibilityScore: score,
});

export const ResearchResponseSchema = z.object({ candidates: z.array(ResearchCandidateSchema).max(12) });
export type ResearchCandidate = z.infer<typeof ResearchCandidateSchema>;

export const RESPONSE_JSON_SCHEMA = {
  type: "object", additionalProperties: false, required: ["candidates"], properties: {
    candidates: { type: "array", maxItems: 12, items: { type: "object", additionalProperties: false, required: ["title", "organizationName", "description", "category", "representationType", "eventDate", "applicationDeadline", "location", "eventUrl", "sources", "recommendationSummary", "evidenceSummary", "relevanceScore", "visibilityScore", "networkingScore", "stakeholderValueScore", "feasibilityScore"], properties: {
      title: { type: "string" }, organizationName: { type: ["string", "null"] }, description: { type: ["string", "null"] }, category: { type: ["string", "null"], enum: [...OPPORTUNITY_CATEGORIES, null] }, representationType: { type: ["string", "null"], enum: [...REPRESENTATION_TYPES, null] }, eventDate: { type: ["string", "null"], pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, applicationDeadline: { type: ["string", "null"], pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, location: { type: ["string", "null"] }, eventUrl: { type: ["string", "null"] }, sources: { type: "array", minItems: 1, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["name", "url"], properties: { name: { type: "string" }, url: { type: "string" } } } }, recommendationSummary: { type: "string" }, evidenceSummary: { type: "string" }, relevanceScore: { type: "integer", minimum: 0, maximum: 100 }, visibilityScore: { type: "integer", minimum: 0, maximum: 100 }, networkingScore: { type: "integer", minimum: 0, maximum: 100 }, stakeholderValueScore: { type: "integer", minimum: 0, maximum: 100 }, feasibilityScore: { type: "integer", minimum: 0, maximum: 100 }
    } } }
  }
} as const;
