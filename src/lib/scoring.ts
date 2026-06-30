type LeadScoreInput = {
  visiblePain: number;
  reachableDecisionMaker: number;
  budgetLikelihood: number;
  urgency: number;
  complianceRisk: number;
};

export function calculateLeadPriorityScore(input: LeadScoreInput) {
  const weightedScore =
    input.visiblePain * 0.3 +
    input.reachableDecisionMaker * 0.25 +
    input.budgetLikelihood * 0.2 +
    input.urgency * 0.2 -
    input.complianceRisk * 0.15;

  return Math.max(0, Math.min(100, Math.round(weightedScore * 10)));
}
