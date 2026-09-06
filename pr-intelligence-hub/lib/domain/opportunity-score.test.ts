import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateOverallScore,
  evaluateOpportunity,
  getOpportunityPriority,
  hasCompleteScores,
} from "./opportunity-score.ts";

const completeScores = {
  relevance: 80,
  visibility: 70,
  networking: 60,
  stakeholderValue: 50,
  feasibility: 90,
};

test("calculates the weighted opportunity score defined by the product", () => {
  assert.equal(calculateOverallScore(completeScores), 70);
});

test("maps score boundaries to the correct priority", () => {
  assert.equal(getOpportunityPriority(0), "low");
  assert.equal(getOpportunityPriority(39.99), "low");
  assert.equal(getOpportunityPriority(40), "medium");
  assert.equal(getOpportunityPriority(60), "high");
  assert.equal(getOpportunityPriority(80), "critical");
});

test("keeps unscored or partially scored opportunities unevaluated", () => {
  assert.equal(hasCompleteScores({ relevance: 101 }), false);
  assert.deepEqual(evaluateOpportunity({ relevance: 80 }), {
    overallScore: null,
    priority: null,
  });
});

test("rejects invalid overall scores", () => {
  assert.throws(() => getOpportunityPriority(-1), RangeError);
  assert.throws(() => getOpportunityPriority(101), RangeError);
});
