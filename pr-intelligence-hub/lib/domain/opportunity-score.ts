export const SCORE_DIMENSIONS = [
  "relevance",
  "visibility",
  "networking",
  "stakeholderValue",
  "feasibility",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];
export type { OpportunityPriority } from "./opportunity";
import type { OpportunityPriority } from "./opportunity";

export type OpportunityScores = Record<ScoreDimension, number>;
export type PartialOpportunityScores = Partial<OpportunityScores>;

const WEIGHTS: Record<ScoreDimension, number> = {
  relevance: 0.3,
  visibility: 0.25,
  networking: 0.2,
  stakeholderValue: 0.15,
  feasibility: 0.1,
};

export function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function hasCompleteScores(scores: PartialOpportunityScores): scores is OpportunityScores {
  return SCORE_DIMENSIONS.every((dimension) => isValidScore(scores[dimension]));
}

export function calculateOverallScore(scores: OpportunityScores): number {
  return SCORE_DIMENSIONS.reduce(
    (total, dimension) => total + scores[dimension] * WEIGHTS[dimension],
    0,
  );
}

export function getOpportunityPriority(overallScore: number): OpportunityPriority {
  if (!isValidScore(overallScore)) {
    throw new RangeError("Overall score must be between 0 and 100.");
  }

  if (overallScore < 40) return "low";
  if (overallScore < 60) return "medium";
  if (overallScore < 80) return "high";
  return "critical";
}

export function evaluateOpportunity(scores: PartialOpportunityScores): {
  overallScore: number | null;
  priority: OpportunityPriority | null;
} {
  if (!hasCompleteScores(scores)) {
    return { overallScore: null, priority: null };
  }

  const overallScore = calculateOverallScore(scores);
  return { overallScore, priority: getOpportunityPriority(overallScore) };
}
